"use strict";
var pipeWrench = require("pipe-wrench");

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
// 1: pipe-wrench stdout identifier
// 2: pipe-wrench stderr identifier
// 3: pipe-wrench stdin identifier
// 4: pipe-wrench ipc identifier
// ...: process.argv.slice(2) from node

// process.stdout, process.stderr, and process.stdin don't work in nw on Windows,
// so we use an IPC library to create streams back to the node process, and then
// override the properties on process to use those instead.
const stdout = pipeWrench.client(argv[1]);
const stderr = pipeWrench.client(argv[2]);
const stdin = pipeWrench.client(argv[3]);
const ipc = pipeWrench.client(argv[4]);

stdin.setRawMode = function(bool) {
  if (bool) {
    ipc.write("stdin-raw-mode:true");
  } else {
    ipc.write("stdin-raw-mode:false");
  }
}

Object.defineProperty(process, "stdout", { value: stdout });
Object.defineProperty(process, "stderr", { value: stderr });
Object.defineProperty(process, "stdin", { value: stdin });

// Log to stdout/stderr instead of browser console
var Console = require("console").Console;
global.devtoolsConsole = global.console;
global.console = new Console(stdout, stderr);

// Set process.cwd() to what it was in node
process.chdir(argv[0]);

// Override process.argv to be ["/absolutePathTo/nw", "absolutePathTo/nw-runner", ...argv].
// This fits the same shape node usually has: ["/absolutePathTo/node", "/absolutePathTo/script.js", ...argv].
process.argv = [process.argv[0], __dirname].concat(argv.slice(5));
