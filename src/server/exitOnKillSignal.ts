"use strict";
const debug = require("debug")("node-nw:server/exitOnKillSignal");
const { exit } = require("./exiting");

module.exports = function exitOnKillSignal() {
  if (process.platform === "win32") {
    debug("Registering readline interface for SIGINT handler");
    const readline = require("readline").createInterface({
      input: process.stdin,
    });

    readline.on("SIGINT", () => {
      process.emit("SIGINT");
    });
  }

  process.on("SIGINT", () => {
    debug("Received SIGINT");
    exit();
  });

  process.on("SIGTERM", () => {
    debug("Received SIGTERM");
    exit();
  });

  process.on("SIGHUP", () => {
    debug("Received SIGHUP");
    exit();
  });

  process.on("exit", (code) => {
    debug(`process.exit was called with code: ${code}`);
    exit(code);
  });
};
