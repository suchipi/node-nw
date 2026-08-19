"use strict";
const debug = require("debug")("node-nw:server/determineEnvConfig");
const supportsColor = require("supports-color");

module.exports = function determineEnvConfig(cwd) {
  const envConfig = {
    cwd,
    pid: process.pid,
    supportsColor: Boolean(supportsColor),
    stdinIsTTY: Boolean(process.stdin.isTTY),
    stdoutIsTTY: Boolean(process.stdout.isTTY),
  };

  debug("envConfig: %o", envConfig);

  return envConfig;
};
