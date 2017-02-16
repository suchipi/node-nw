"use strict";
var child_process = require("child_process");
var path = require("path");

var exiting = require("./exiting");
var exit = exiting.exit;
var onExit = exiting.onExit;

function determineTarget(argv) {
  var argvTarget = require("./node-nw/argv").target;
  return argvTarget(argv, process.stdin.isTTY)[0];
}

function handleNodeOnlyTargets(target) {
  var shouldExit = false;
  if (target === "version") {
    var version = require("./package.json").version;
    console.log("v" + version);
    shouldExit = true;
  }
  if (target === "help") {
    var helpText = require("./help");
    console.log(helpText);
    shouldExit = true;
  }
  return shouldExit;
}

function setupPipeWrenchSockets(target) {
  var pipeWrench = require("pipe-wrench");
  var pipeWrenchIdentifiers = require("./pipeWrenchIdentifiers");
  var ipc = require("./ipc");
  var replServer = require("./replServer");

  var identifiers = pipeWrenchIdentifiers(process.pid);

  var cleanupStdout = pipeWrench.server(identifiers.stdout, function(socket) {
    socket.pipe(process.stdout);
    onExit(function() {
      socket.end();
      socket.unref();
    });
  });

  var cleanupStderr = pipeWrench.server(identifiers.stderr, function(socket) {
    socket.pipe(process.stderr);
    onExit(function() {
      socket.end();
      socket.unref();
    });
  });

  var cleanupStdin = pipeWrench.server(identifiers.stdin, function(socket) {
    process.stdin.pipe(socket);
    onExit(function() {
      socket.end();
      socket.unref();
    });
  });

  var cleanupIpc = pipeWrench.server(identifiers.ipc, function(socket) {
    socket.setEncoding("utf-8");
    ipc.setSocket(socket);
    onExit(function() {
      socket.end();
      socket.unref();
    });
  });

  var cleanupRepl = pipeWrench.server(identifiers.repl, function(socket) {
    socket.setEncoding("utf-8");
    if (target === "repl") {
      replServer.start(socket);
    }
    onExit(function() {
      socket.end();
      socket.unref();
    });
  });

  onExit(function() {
    cleanupStdout();
    cleanupStderr();
    cleanupStdin();
    cleanupIpc();
    cleanupRepl();
  });
}

function prepareUserDataDir() {
  var os = require("os");

  var userDataDir = path.join(os.tmpdir(), "node-nw-profile-" + process.pid);
  child_process.execSync("mkdir -p " + userDataDir); // TODO: cross-platform mkdir -p
  onExit(function() {
    var rimrafPath = path.resolve(__dirname, path.join("node_modules", ".bin", "rimraf"));
    child_process.execSync(rimrafPath + " " + userDataDir);
  });

  return userDataDir;
}

function determineEnvConfig(cwd) {
  var supportsColor = require("supports-color");

  return {
    cwd: cwd,
    pid: process.pid,
    supportsColor: Boolean(supportsColor),
    stdinIsTTY: Boolean(process.stdin.isTTY),
    stdoutIsTTY: Boolean(process.stdout.isTTY),
  };
}

function startNw(envConfig, userDataDir, argv) {
  var shellEscape = require("shell-escape");

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
  onExit(function() {
    if (running) {
      nw.kill();
      nw.unref();
    }
  });

  nw.once("close", function(code) {
    running = false;
    exit();
  });

  nw.once("exit", function(code) {
    running = false;
    exit();
  });

  nw.once("error", function() {
    console.error("An error occurred in the child nw process");
    running = false;
    process.exitCode = 1;
    exit();
  });
}

function handleExit() {
  if (process.platform === "win32") {
    var readline = require("readline").createInterface({
      input: process.stdin,
    });

    readline.on("SIGINT", function() {
      process.emit("SIGINT");
    });
  }

  process.on("SIGINT", function() {
    exit();
  });

  process.on("SIGTERM", function() {
    exit();
  });

  process.on("SIGHUP", function() {
    exit();
  });

  process.on("exit", function(code) {
    exit(code);
  });
}

module.exports = function nodeNw(cwd, argv) {
  var target = determineTarget(argv);
  var shouldExit = handleNodeOnlyTargets(target);
  if (!shouldExit) {
    setupPipeWrenchSockets(target);
    var userDataDir = prepareUserDataDir();
    var envConfig = determineEnvConfig(cwd);
    startNw(envConfig, userDataDir, argv);
    handleExit();
  }
}
