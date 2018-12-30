"use strict";
const path = require("path");
const debug = require("debug")("node-nw:server/index");
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
    onExit(() => {
      debug("Closing and unreffing stdout socket");
      socket.end();
      socket.unref();
    });
  });

  const cleanupStderr = pipeWrench.server(identifiers.stderr, function(socket) {
    socket.pipe(process.stderr);
    onExit(() => {
      debug("Closing and unreffing stderr socket");
      socket.end();
      socket.unref();
    });
  });

  const cleanupStdin = pipeWrench.server(identifiers.stdin, function(socket) {
    process.stdin.pipe(socket);
    onExit(() => {
      debug("Closing and unreffing stdin socket");
      socket.end();
      socket.unref();
    });
  });

  const cleanupIpc = pipeWrench.server(identifiers.ipc, function(socket) {
    socket.setEncoding("utf-8");
    ipc.setSocket(socket);
    onExit(() => {
      debug("Closing and unreffing ipc socket");
      socket.end();
      socket.unref();
    });
  });

  const cleanupRepl = pipeWrench.server(identifiers.repl, function(socket) {
    socket.setEncoding("utf-8");
    if (target === "repl") {
      replServer.start(socket);
    }
    onExit(() => {
      debug("Closing and unreffing repl socket");
      socket.end();
      socket.unref();
    });
  });

  onExit(() => {
    debug("Cleaning up pipe-wrench sockets");
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
  debug(`Creating user data dir (${userDataDir})`);
  mkdirp.sync(userDataDir);
  onExit(() => {
    debug(`Removing user data dir (${userDataDir})`);
    rimraf.sync(userDataDir);
  });

  return userDataDir;
}

function determineEnvConfig(cwd) {
  const supportsColor = require("supports-color");

  const envConfig = {
    cwd,
    pid: process.pid,
    supportsColor: Boolean(supportsColor),
    stdinIsTTY: Boolean(process.stdin.isTTY),
    stdoutIsTTY: Boolean(process.stdout.isTTY),
  };

  debug("envConfig: %o", envConfig);

  return envConfig;
}

function handleExit() {
  if (process.platform === "win32") {
    debug("Registering readline interface for SIGINT handler");
    const readline = require("readline").createInterface({
      input: process.stdin,
    });

    readline.on("SIGINT", () => {
      process.emit("SIGINT");
    });
  }

  process.on("SIGINT", () => {
    debug("Received SIGINT");
    exit();
  });

  process.on("SIGTERM", () => {
    debug("Received SIGTERM");
    exit();
  });

  process.on("SIGHUP", () => {
    debug("Received SIGHUP");
    exit();
  });

  process.on("exit", (code) => {
    debug(`process.exit was called with code: ${code}`);
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
