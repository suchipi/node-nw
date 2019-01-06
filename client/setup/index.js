"use strict";
const debug = require("debug")("node-nw:client/setup/index");

// Log uncaught errors to console
debug("Registering uncaught exception handler");
process.on("uncaughtException", function handleUncaughtException(error) {
  console.error(error);
});

// We get launched with these arguments:
// 0: Unrelated --user-data-dir argument that doesn't get filtered out
// 1: Environment config JSON string
// ...: process.argv.slice(2) from node
const envConfig = JSON.parse(nw.App.argv[1]);
const argv = nw.App.argv.slice(2);

// process.stdout, process.stderr, and process.stdin don't work in nw on Windows,
// so we use an IPC library to create sockets back to the node process, and then
// override the properties on process to use those instead.
const sockets = require("./sockets")(envConfig.pid);

const ipc = require("./ipc");
ipc.setSocket(sockets.ipc);

// process.stdin normally has a special setRawMode function on it.
// This defines that function as one that uses the ipc channel to tell the
// node process to set raw mode on the "real" process.stdin on its end.
sockets.stdin.setRawMode = function setRawMode(bool) {
  debug(`Client called setRawMode(${bool})`);
  if (bool) {
    ipc.send("stdin-raw-mode", true);
    sockets.stdin.isRaw = true;
  } else {
    ipc.send("stdin-raw-mode", false);
    sockets.stdin.isRaw = false;
  }
};
sockets.stdin.isRaw = false;

// process.stdout and process.stdin normally have an `isTTY` boolean
// property on them that can be used to detect if they are a tty.
// We get this from the env config and set it appropriately.
sockets.stdout.isTTY = envConfig.stdoutIsTTY;
sockets.stdin.isTTY = envConfig.stdinIsTTY;

// Log to node stdout/stderr in addition to browser console
global.console = require("./console")(sockets.stdout, sockets.stderr);

const replClient = require("../replClient");
replClient.setSocket(sockets.repl);
replClient.setSupportsColor(envConfig.supportsColor);

Object.defineProperty(process, "stdout", { value: sockets.stdout });
Object.defineProperty(process, "stderr", { value: sockets.stderr });
Object.defineProperty(process, "stdin", { value: sockets.stdin });

debug("Env config: %o", envConfig);
debug("argv: %o", argv);

// Set process.cwd() to what it was in node
process.chdir(envConfig.cwd);

// Override process.argv to be ["/absolutePathTo/nw", ...argv].
// This fits the same shape node usually has: ["/absolutePathTo/node", ...argv].
process.argv = [process.argv[0]].concat(argv);

Object.defineProperty(process, "exit", {
  value: (code) => {
    ipc.send("set-exit-code", code);
    // App won't quit if no windows are open; see https://github.com/nwjs/nw.js/issues/4227
    nw.Window.open("", { show: false });
    nw.App.quit();
  },
});

let _exitCode = 0;
Object.defineProperty(process, "exitCode", {
  set(code) {
    ipc.send("set-exit-code", code);
    _exitCode = code;
  },
  get() {
    return _exitCode;
  },
});

// Some things blow up if you try to inspect them.
// Patch them so that doesn't happen.
require("./inspect-patches");
