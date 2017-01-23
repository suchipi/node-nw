"use strict";
var pipeWrench = require("pipe-wrench");
var pipeWrenchIdentifiers = require("../pipeWrenchIdentifiers");

// Hide the main window
var win = nw.Window.get();
win.hide();

// Close all windows on process.exit,
// So that nwjs exits
process.on("exit", function() {
  nw.App.closeAllWindows();
});

var argv = nw.App.argv;
// We get launched with these arguments:
// 0: process.cwd() from node
// 1: pid of the node process
// ...: process.argv.slice(2) from node
const cwd = argv[0];
const pid = argv[1];

// Set process.cwd() to what it was in node
process.chdir(cwd);

// process.stdout, process.stderr, and process.stdin don't work in nw on Windows,
// so we use an IPC library to create streams back to the node process, and then
// override the properties on process to use those instead.
var identifiers = pipeWrenchIdentifiers(pid);
const stdout = pipeWrench.client(identifiers.stdout);
const stderr = pipeWrench.client(identifiers.stderr);
const stdin = pipeWrench.client(identifiers.stdin);
const ipc = pipeWrench.client(identifiers.ipc); // general ipc socket

// process.stdin normally has a special setRawMode function on it.
// This defines that function as one that uses the ipc channel to tell the
// node process to set raw mode on the "real" process.stdin on its end.
stdin.setRawMode = function(bool) {
  if (bool) {
    ipc.write("stdin-raw-mode:true");
  } else {
    ipc.write("stdin-raw-mode:false");
  }
}

// Override the real process.stdout, process.sterr, and process.stdin
// In nw on Windows, these were DummyStreams
Object.defineProperty(process, "stdout", { value: stdout });
Object.defineProperty(process, "stderr", { value: stderr });
Object.defineProperty(process, "stdin", { value: stdin });

// Log to node stdout/stderr in addition to browser console
var Console = require("console").Console;
var devtoolsConsole = global.console;
var nodeConsole = new Console(stdout, stderr);
global.console = {};
["assert", "dir", "error", "info", "log", "time", "timeEnd", "trace", "warn"].forEach(function(name) {
  console[name] = function() {
    devtoolsConsole[name].apply(devtoolsConsole, arguments);
    nodeConsole[name].apply(nodeConsole, arguments);
  }
});

// Override process.argv to be ["/absolutePathTo/nw", ...argv].
// This fits the same shape node usually has: ["/absolutePathTo/node", ...argv].
process.argv = [process.argv[0]].concat(argv.slice(2));
