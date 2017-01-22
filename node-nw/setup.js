"use strict";

// Hide the main window
var win = nw.Window.get();
win.hide();

// Log to stdout/stderr instead of browser console
var Console = require("console").Console;
global.console = new Console(process.stdout, process.stderr);

var argv = nw.App.argv;
// We get launched with these arguments:
// 0: process.cwd() from node
// 1: process.argv.slice(2) from node

// Set process.cwd() to what it was in node
process.chdir(argv[0]);

// Override process.argv to be ["/absolutePathTo/nw", "absolutePathTo/nw-runner", ...argv].
// This fits the same shape node usually has: ["/absolutePathTo/node", "/absolutePathTo/script.js", ...argv].
process.argv = [process.argv[0], __dirname].concat(argv.slice(1));

// Close all windows on process.exit,
// So that nwjs exits
process.on("exit", () => {
  nw.App.closeAllWindows();
});
