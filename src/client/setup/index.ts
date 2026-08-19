"use strict";
const debug = require("debug")("node-nw:client/setup/index");

// We get launched with these arguments:
// 0: Unrelated --user-data-dir argument that doesn't get filtered out
// 1: Environment config JSON string
// ...: process.argv.slice(2) from node
const envConfig = JSON.parse(nw.App.argv[1]);
const argv = nw.App.argv.slice(2);

debug("Env config: %o", envConfig);
debug("argv: %o", argv);

// Log uncaught errors to console
debug("Registering uncaught exception handler");
process.on("uncaughtException", function handleUncaughtException(error) {
  console.error(error);
});

// ipc sockets, used for stdio and well as general-purpose communication
const sockets = require("./sockets")(envConfig.pid);

const ipc = require("./ipc");
ipc.setSocket(sockets.ipc);

// Log to node stdout/stderr in addition to browser console
global.console = require("./console")(sockets.stdout, sockets.stderr);

// Set up process global which forwards stuff to the node server
global.process = require("./process")({
  stdout: sockets.stdout,
  stderr: sockets.stderr,
  stdin: sockets.stdin,
  envConfig,
  argv,
  ipc,
});

const replClient = require("../replClient");
replClient.setSocket(sockets.repl);
replClient.setSupportsColor(envConfig.supportsColor);

// Some things blow up if you try to inspect them.
// Patch them so that doesn't happen.
require("./inspect-patches");
