"use strict";

// Hide the main window
nw.Window.get().hide();

// Close all windows on process.exit,
// So that nwjs exits
process.on("exit", function() {
  nw.App.closeAllWindows();
});

// Log uncaught errors to console
process.on("uncaughtException", function(error) {
  console.error(error);
  process.exit(-1);
});

// We get launched with these arguments:
// 0: Environment config JSON string
// ...: process.argv.slice(2) from node
var envConfig = JSON.parse(nw.App.argv[0]);
var argv = nw.App.argv.slice(1);

// process.stdout, process.stderr, and process.stdin don't work in nw on Windows,
// so we use an IPC library to create sockets back to the node process, and then
// override the properties on process to use those instead.
var shouldUseRepl = require("../argv").target(argv, envConfig.stdinIsTTY)[0] === "repl";
var sockets = require("./sockets")(envConfig.pid, shouldUseRepl);

var ipc = require("./ipc");
ipc.setSocket(sockets.ipc);

// process.stdin normally has a special setRawMode function on it.
// This defines that function as one that uses the ipc channel to tell the
// node process to set raw mode on the "real" process.stdin on its end.
sockets.stdin.setRawMode = function(bool) {
  if (bool) {
    ipc.send("stdin-raw-mode:true");
    sockets.stdin.isRaw = true;
  } else {
    ipc.send("stdin-raw-mode:false");
    sockets.stdin.isRaw = false;
  }
}
sockets.stdin.isRaw = false;

// process.stdout and process.stdin normally have an `isTTY` boolean
// property on them that can be used to detect if they are a tty.
// We get this from the env config and set it appropriately.
sockets.stdout.isTTY = envConfig.stdoutIsTTY;
sockets.stdin.isTTY = envConfig.stdinIsTTY;

// Log to node stdout/stderr in addition to browser console
global.console = require("./console")(sockets.stdout, sockets.stderr);

if (shouldUseRepl) {
  var replClient = require("../replClient");
  replClient.setSocket(sockets.repl);
  replClient.setSupportsColor(envConfig.supportsColor);
}

// If process.stdout and process.stderr aren't usable streams (win32),
// then use the IPC ones instead. TODO: Don't create the sockets on
// platforms where they aren't needed.
if (process.stdout.constructor.name !== "WriteStream") {
  Object.defineProperty(process, "stdout", { value: sockets.stdout });
}
if (process.stderr.constructor.name !== "WriteStream") {
  Object.defineProperty(process, "stderr", { value: sockets.stderr });
}

//
Object.defineProperty(process, "stdin", { value: sockets.stdin });

// Set process.cwd() to what it was in node
process.chdir(envConfig.cwd);

// Override process.argv to be ["/absolutePathTo/nw", ...argv].
// This fits the same shape node usually has: ["/absolutePathTo/node", ...argv].
process.argv = [process.argv[0]].concat(argv);

// Some things blow up if you try to inspect them.
// Patch them so that doesn't happen.
require("./inspect-patches");
