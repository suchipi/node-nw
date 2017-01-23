"use strict";

// Hide the main window
nw.Window.get().hide();

// Close all windows on process.exit,
// So that nwjs exits
process.on("exit", function() {
  nw.App.closeAllWindows();
});

// We get launched with these arguments:
// 0: process.cwd() from node
// 1: pid of the node process
// 2: Whether the terminal running the node
//    process supports color ("true" or "false")
// ...: process.argv.slice(2) from node
var cwd = nw.App.argv[0];
var pid = nw.App.argv[1];
var supportsColor = nw.App.argv[2] === "true";
var argv = nw.App.argv.slice(3);

// process.stdout, process.stderr, and process.stdin don't work in nw on Windows,
// so we use an IPC library to create sockets back to the node process, and then
// override the properties on process to use those instead.
var shouldUseRepl = require("../argv").target(argv)[0] === "repl";
var sockets = require("./sockets")(pid, shouldUseRepl);

var ipc = require("./ipc");
ipc.setSocket(sockets.ipc);

// process.stdin normally has a special setRawMode function on it.
// This defines that function as one that uses the ipc channel to tell the
// node process to set raw mode on the "real" process.stdin on its end.
sockets.stdin.setRawMode = function(bool) {
  if (bool) {
    ipc.send("stdin-raw-mode:true");
  } else {
    ipc.send("stdin-raw-mode:false");
  }
}

// Log to node stdout/stderr in addition to browser console
global.console = require("./console")(sockets.stdout, sockets.stderr);

if (shouldUseRepl) {
  var replClient = require("../replClient");
  replClient.setSocket(sockets.repl);
  replClient.setSupportsColor(supportsColor);
}

// Override the real process.stdout, process.sterr, and process.stdin
// In nw on Windows, these were DummyStreams
Object.defineProperty(process, "stdout", { value: sockets.stdout });
Object.defineProperty(process, "stderr", { value: sockets.stderr });
Object.defineProperty(process, "stdin", { value: sockets.stdin });

// Set process.cwd() to what it was in node
process.chdir(cwd);

// Override process.argv to be ["/absolutePathTo/nw", ...argv].
// This fits the same shape node usually has: ["/absolutePathTo/node", ...argv].
process.argv = [process.argv[0]].concat(argv);
