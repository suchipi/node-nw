"use strict";
const debug = require("debug")("node-nw:client/setup/process");

module.exports = function makeProcessObject({
  stdout,
  stderr,
  stdin,
  envConfig,
  argv,
  ipc,
}) {
  debug("Creating 'process' global");

  const realProcess = process;
  const processOverlay = Object.create(null);
  const newProcess = new Proxy(realProcess, {
    get(target, prop, receiver) {
      if (prop in processOverlay) {
        return Reflect.get(processOverlay, prop, realProcess);
      } else {
        return Reflect.get(target, prop, receiver);
      }
    },
    set(target, prop, newValue, receiver) {
      if (prop in processOverlay) {
        return Reflect.set(processOverlay, prop, newValue, receiver);
      } else {
        return Reflect.set(target, prop, newValue, receiver);
      }
    },
    has(target, prop) {
      return Reflect.has(processOverlay, prop) || Reflect.has(target, prop);
    },
  });

  Object.defineProperty(processOverlay, "stdout", { value: stdout });
  Object.defineProperty(processOverlay, "stderr", { value: stderr });
  Object.defineProperty(processOverlay, "stdin", { value: stdin });

  // process.stdin normally has a special setRawMode function on it.
  // This defines that function as one that uses the ipc channel to tell the
  // node process to set raw mode on the "real" process.stdin on its end.
  stdin.setRawMode = function setRawMode(bool) {
    debug(`Client called setRawMode(${bool})`);
    if (bool) {
      ipc.send("stdin-raw-mode", true);
      stdin.isRaw = true;
    } else {
      ipc.send("stdin-raw-mode", false);
      stdin.isRaw = false;
    }
  };
  stdin.isRaw = false;

  // process.stdout and process.stdin normally have an `isTTY` boolean
  // property on them that can be used to detect if they are a tty.
  // We get this from the env config and set it appropriately.
  stdout.isTTY = envConfig.stdoutIsTTY;
  stdin.isTTY = envConfig.stdinIsTTY;
  // TODO: add stderr.isTTY here, too.

  // Set process.cwd() to what it was in node
  realProcess.chdir(envConfig.cwd);

  // Override process.argv to be ["/absolutePathTo/nw", ...argv].
  // This fits the same shape node usually has: ["/absolutePathTo/node", ...argv].
  processOverlay.argv = [realProcess.argv[0]].concat(argv);

  Object.defineProperty(processOverlay, "exit", {
    value: (code) => {
      if (code != null) {
        ipc.send("set-exit-code", code);
      }
      // App won't quit if no windows are open; see https://github.com/nwjs/nw.js/issues/4227
      nw.Window.open("", { show: false });
      nw.App.quit();
    },
  });

  let _exitCode = 0;
  Object.defineProperty(processOverlay, "exitCode", {
    set(code) {
      ipc.send("set-exit-code", code);
      _exitCode = code;
    },
    get() {
      return _exitCode;
    },
  });

  return newProcess;
};
