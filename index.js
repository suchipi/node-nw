"use strict";
var child_process = require("child_process");
var path = require("path");
var os = require("os");
var pipeWrench = require("pipe-wrench");
var pipeWrenchIdentifiers = require("./pipeWrenchIdentifiers");
var ipc = require("./ipc");
var replServer = require("./replServer");
var argvTarget = require("./node-nw/argv").target;
var supportsColor = require("supports-color");
var version = require("./package.json").version;
var help = require("./help");
var shellEscape = require("shell-escape");

module.exports = function nodeNw(cwd, argv) {
  var target = argvTarget(argv, process.stdin.isTTY)[0];
  if (target === "version") {
    console.log("v" + version);
    process.exit(0);
  }
  if (target === "help") {
    console.log(help);
    process.exit(0);
  }

  var identifiers = pipeWrenchIdentifiers(process.pid);
  var sockets = [];

  pipeWrench.server(identifiers.stdout, function(socket) {
    sockets.push(socket);
    socket.pipe(process.stdout);
  });
  pipeWrench.server(identifiers.stderr, function(socket) {
    sockets.push(socket);
    socket.pipe(process.stderr);
  });
  pipeWrench.server(identifiers.stdin, function(socket) {
    sockets.push(socket);
    process.stdin.pipe(socket);
  });
  pipeWrench.server(identifiers.ipc, function(socket) {
    sockets.push(socket);
    socket.setEncoding("utf-8");
    ipc.setSocket(socket);
  });
  pipeWrench.server(identifiers.repl, function(socket) {
    sockets.push(socket);
    socket.setEncoding("utf-8");
    if (target === "repl") {
      replServer.start(socket);
    }
  });

  var envConfig = {
    cwd: cwd,
    pid: process.pid,
    supportsColor: Boolean(supportsColor),
    stdinIsTTY: Boolean(process.stdin.isTTY),
    stdoutIsTTY: Boolean(process.stdout.isTTY),
  };

  var userDataDir = path.join(os.tmpdir(), "node-nw-profile-" + process.pid);

  child_process.execSync("mkdir -p " + userDataDir);

  var nw = child_process.spawn(
    "nw",
    [
      path.resolve(path.join(__dirname, "node-nw")),
      "--user-data-dir=" + shellEscape([userDataDir]),
      JSON.stringify(envConfig),
    ].concat(argv),
    { stdio: "inherit" }
  );
  var running = true;

  nw.once("close", function(code) {
    running = false;
    process.exit(code);
  });

  nw.once("error", function() {
    console.error("An error occurred in the child nw process");
    running = false;
    process.exit(1);
  });

  if (process.platform === "win32") {
    var readline = require("readline").createInterface({
      input: process.stdin,
    });

    readline.on("SIGINT", function() {
      process.emit("SIGINT");
    });
  }

  process.on("SIGINT", function() {
    nw.kill("SIGINT");
    running = false;
    process.exit(0);
  });

  process.on("exit", function() {
    if (running) {
      nw.kill();
      running = false;
    }
    var rimrafPath = path.resolve(__dirname, path.join("node_modules", ".bin", "rimraf"));
    child_process.execSync(rimrafPath + " " + userDataDir);
    sockets.forEach(function(socket) {
      socket.unref();
    });
    pipeWrench.cleanup();
  });
}
