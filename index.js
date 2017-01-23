"use strict";
var spawn = require("child_process").spawn;
var path = require("path");
var pipeWrench = require("pipe-wrench");
var pipeWrenchIdentifiers = require("./pipeWrenchIdentifiers");
var handleIpc = require("./handleIpc");

module.exports = function nodeNw(cwd, argv) {
  var identifiers = pipeWrenchIdentifiers(process.pid);

  pipeWrench.server(identifiers.stdout, (socket) => socket.pipe(process.stdout));
  pipeWrench.server(identifiers.stderr, (socket) => socket.pipe(process.stderr));
  pipeWrench.server(identifiers.stdin, (socket) => process.stdin.pipe(socket));
  pipeWrench.server(identifiers.ipc, (socket) => {
    socket.setEncoding("utf-8");
    socket.on("data", handleIpc(socket));
  });

  spawn(
    "nw",
    [
      path.resolve(path.join(__dirname, "node-nw")),
      cwd,
      process.pid
    ].concat(argv),
    { stdio: "inherit" }
  );

  if (process.platform === "win32") {
    var readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
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
