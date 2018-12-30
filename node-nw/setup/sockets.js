"use strict";
const pipeWrench = require("pipe-wrench");
const pipeWrenchIdentifiers = require("../../pipeWrenchIdentifiers");

module.exports = function setupSockets(pid) {
  const identifiers = pipeWrenchIdentifiers(pid);

  const stdout = pipeWrench.client(identifiers.stdout);
  const stderr = pipeWrench.client(identifiers.stderr);
  const stdin = pipeWrench.client(identifiers.stdin);
  const ipc = pipeWrench.client(identifiers.ipc);
  const repl = pipeWrench.client(identifiers.repl);

  return {
    stdout,
    stderr,
    stdin,
    ipc,
    repl,
  };
};
