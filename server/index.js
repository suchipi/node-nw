"use strict";
const path = require("path");
const { exit, onExit } = require("./exiting");
const startNw = require("./startNw");

function determineTarget(argv) {
  const argvTarget = require("../shared/argv").target;
  return argvTarget(argv, process.stdin.isTTY)[0];
}

function handleNodeOnlyTargets(target) {
  let shouldExit = false;
  if (target === "version") {
    const version = require("../package.json").version;
    console.log("v" + version);
    shouldExit = true;
  }
  if (target === "help") {
    const helpText = require("./help");
    console.log(helpText);
    shouldExit = true;
  }
  return shouldExit;
}

function setupPipeWrenchSockets(target) {
  const pipeWrench = require("pipe-wrench");
  const pipeWrenchIdentifiers = require("../shared/pipeWrenchIdentifiers");
  const ipc = require("./ipc");
  const replServer = require("./replServer");

  const identifiers = pipeWrenchIdentifiers(process.pid);

  const cleanupStdout = pipeWrench.server(identifiers.stdout, function(socket) {
    socket.pipe(process.stdout);
    onExit(function() {
      socket.end();
      socket.unref();
    });
  });

  const cleanupStderr = pipeWrench.server(identifiers.stderr, function(socket) {
    socket.pipe(process.stderr);
    onExit(function() {
      socket.end();
      socket.unref();
    });
  });

  const cleanupStdin = pipeWrench.server(identifiers.stdin, function(socket) {
    process.stdin.pipe(socket);
    onExit(function() {
      socket.end();
      socket.unref();
    });
  });

  const cleanupIpc = pipeWrench.server(identifiers.ipc, function(socket) {
    socket.setEncoding("utf-8");
    ipc.setSocket(socket);
    onExit(function() {
      socket.end();
      socket.unref();
    });
  });

  const cleanupRepl = pipeWrench.server(identifiers.repl, function(socket) {
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
  const os = require("os");
  const mkdirp = require("mkdirp");
  const rimraf = require("rimraf");

  const userDataDir = path.join(os.tmpdir(), "node-nw-profile-" + process.pid);
  mkdirp.sync(userDataDir);
  onExit(function() {
    rimraf.sync(userDataDir);
  });

  return userDataDir;
}

function determineEnvConfig(cwd) {
  const supportsColor = require("supports-color");

  return {
    cwd: cwd,
    pid: process.pid,
    supportsColor: Boolean(supportsColor),
    stdinIsTTY: Boolean(process.stdin.isTTY),
    stdoutIsTTY: Boolean(process.stdout.isTTY),
  };
}

function handleExit() {
  if (process.platform === "win32") {
    const readline = require("readline").createInterface({
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

module.exports = function nodeNw(binary, cwd, argv) {
  const target = determineTarget(argv);
  const shouldExit = handleNodeOnlyTargets(target);
  if (!shouldExit) {
    setupPipeWrenchSockets(target);
    const userDataDir = prepareUserDataDir();
    const envConfig = determineEnvConfig(cwd);
    startNw(binary, envConfig, userDataDir, argv);
    handleExit();
  }
};
