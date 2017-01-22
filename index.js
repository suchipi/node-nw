"use strict";
var spawn = require("child_process").spawn;
var path = require("path");
var pipeWrench = require("pipe-wrench");
var handleIpc = require("./handleIpc");

module.exports = function nodeNw(cwd, argv) {
  var stdoutIdentifier = "node-nw-stdout-" + process.pid;
  var stderrIdentifier = "node-nw-stderr-" + process.pid;
  var stdinIdentifier = "node-nw-stdin-" + process.pid;
  var ipcIdentifier = "node-nw-ipc-" + process.pid;

  pipeWrench.server(stdoutIdentifier, (socket) => socket.pipe(process.stdout));
  pipeWrench.server(stderrIdentifier, (socket) => socket.pipe(process.stderr));
  pipeWrench.server(stdinIdentifier, (socket) => process.stdin.pipe(socket));
  pipeWrench.server(ipcIdentifier, (socket) => {
    socket.setEncoding("utf-8");
    socket.on("data", handleIpc(socket));
  });

  spawn(
    "nw",
    [path.resolve(path.join(__dirname, "node-nw")), cwd]
      .concat([stdoutIdentifier, stderrIdentifier, stdinIdentifier, ipcIdentifier])
      .concat(argv),
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
