"use strict";
var pipeWrench = require("pipe-wrench");
var pipeWrenchIdentifiers = require("../../pipeWrenchIdentifiers");

module.exports = function setupSockets(pid, shouldUseRepl) {
  var identifiers = pipeWrenchIdentifiers(pid);

  var stdout = pipeWrench.client(identifiers.stdout);
  var stderr = pipeWrench.client(identifiers.stderr);
  var stdin = pipeWrench.client(identifiers.stdin);
  var ipc = pipeWrench.client(identifiers.ipc);

  var repl;
  if (shouldUseRepl) {
    repl = pipeWrench.client(identifiers.repl);
  }

  return {
    stdout: stdout,
    stderr: stderr,
    stdin: stdin,
    ipc: ipc,
    repl: repl,
  };
}
