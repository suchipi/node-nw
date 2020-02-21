"use strict";
const pipeWrench = require("pipe-wrench");
const debug = require("debug")("node-nw:server/setupPipeWrenchSockets");
const pipeWrenchIdentifiers = require("../shared/pipeWrenchIdentifiers");
const { onExit } = require("./exiting");
const ipc = require("./ipc");
const replServer = require("./replServer");

module.exports = function setupPipeWrenchSockets(target) {
  const identifiers = pipeWrenchIdentifiers(process.pid);

  const cleanupStdout = pipeWrench.server(identifiers.stdout, function(socket) {
    socket.pipe(process.stdout);
    onExit(0, () => {
      debug("Closing and unreffing stdout socket");
      socket.end();
      socket.unref();
    });
  });

  const cleanupStderr = pipeWrench.server(identifiers.stderr, function(socket) {
    socket.pipe(process.stderr);
    onExit(0, () => {
      debug("Closing and unreffing stderr socket");
      socket.end();
      socket.unref();
    });
  });

  const cleanupStdin = pipeWrench.server(identifiers.stdin, function(socket) {
    process.stdin.pipe(socket);
    onExit(0, () => {
      debug("Closing and unreffing stdin socket");
      socket.end();
      socket.unref();
    });
  });

  const cleanupIpc = pipeWrench.server(identifiers.ipc, function(socket) {
    socket.setEncoding("utf-8");
    ipc.setSocket(socket);
    onExit(0, () => {
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
    onExit(0, () => {
      debug("Closing and unreffing repl socket");
      socket.end();
      socket.unref();
    });
  });

  onExit(0, () => {
    debug("Cleaning up pipe-wrench sockets");
    cleanupStdout();
    cleanupStderr();
    cleanupStdin();
    cleanupIpc();
    cleanupRepl();
  });
};
