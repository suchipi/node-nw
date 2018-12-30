"use strict";
const path = require("path");
const debug = require("debug")("node-nw:server/startNw");
const { onExit, exit } = require("./exiting");

module.exports = function startNw(binary, envConfig, userDataDir, argv) {
  const child_process = require("child_process");
  const shellEscape = require("shell-escape");

  function escape(arg) {
    if (process.platform === "win32") {
      if (arg.indexOf(" ") !== -1) {
        return '"' + arg + '"';
      } else {
        return arg;
      }
    } else {
      return shellEscape([userDataDir]);
    }
  }

  const spawnArgs = [
    binary,
    [
      path.resolve(__dirname, "..", "client"),
      "--user-data-dir=" + escape(userDataDir),
      JSON.stringify(envConfig),
    ].concat(argv),
    { stdio: "pipe" },
  ];
  debug("Spawning: %o", spawnArgs);
  const nw = child_process.spawn(...spawnArgs);

  let running = true;
  onExit(() => {
    if (running) {
      debug("Killing NW.js process");
      nw.kill("SIGKILL");
      nw.unref();
    } else {
      debug("Exit was called, but the process is already exiting; ignoring");
    }
  });

  nw.once("close", (code) => {
    debug("NW.js process closed, %o", code);
    running = false;
    exit();
  });

  nw.once("exit", (code) => {
    debug("NW.js process exited, %o", code);
    running = false;
    exit();
  });

  nw.once("error", (err) => {
    console.error("An error occurred in the child nw process: ", err);
    running = false;
    process.exitCode = 1;
    exit();
  });

  const nwDebug = require("debug")("node-nw:nw");
  nw.stdout.on("data", (data) => {
    nwDebug("stdout: %s", data);
  });
  nw.stderr.on("data", (data) => {
    nwDebug("stderr: %s", data);
  });
};
