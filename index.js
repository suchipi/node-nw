"use strict";
var spawn = require("child_process").spawn;
var path = require("path");
var pipeWrench = require("pipe-wrench");
var pipeWrenchIdentifiers = require("./pipeWrenchIdentifiers");
var ipc = require("./ipc");
var replServer = require("./replServer");
var argvTarget = require("./node-nw/argv").target;
var supportsColor = require("supports-color");
var version = require("./package.json").version;
var help = require("./help");

module.exports = function nodeNw(cwd, argv) {
  var target = argvTarget(argv, process.stdin.isTTY)[0];

  if (target === "version") {
    console.log("v" + version);
    process.exit(0);
  }

  if (target === "help") {
    help();
    process.exit(0);
  }

  var identifiers = pipeWrenchIdentifiers(process.pid);

  pipeWrench.server(identifiers.stdout, function(socket) { socket.pipe(process.stdout); });
  pipeWrench.server(identifiers.stderr, function(socket) { socket.pipe(process.stderr); });
  pipeWrench.server(identifiers.stdin, function(socket) { process.stdin.pipe(socket); });
  pipeWrench.server(identifiers.ipc, function(socket) {
    socket.setEncoding("utf-8");
    ipc.setSocket(socket);
  });

  if (target === "repl") {
    pipeWrench.server(identifiers.repl, function(socket) {
      socket.setEncoding("utf-8");
      replServer.start(socket);
    });
  }

  var envConfig = {
    cwd: cwd,
    pid: process.pid,
    supportsColor: Boolean(supportsColor),
    stdinIsTTY: Boolean(process.stdin.isTTY),
    stdoutIsTTY: Boolean(process.stdout.isTTY),
  };

  var nw = spawn(
    "nw",
    [
      path.resolve(path.join(__dirname, "node-nw")),
      JSON.stringify(envConfig)
    ].concat(argv),
    { stdio: "inherit" }
  );

  nw.on("close", function(code) {
    process.exit(code);
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
    process.exit(0);
  });

  process.on("exit", function() {
    pipeWrench.cleanup();
  });
}
