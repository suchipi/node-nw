"use strict";
const debug = require("debug")("node-nw:server/index");
const { getTarget } = require("../shared/argv");
const startNw = require("./startNw");
const setupPipeWrenchSockets = require("./setupPipeWrenchSockets");
const exitOnKillSignal = require("./exitOnKillSignal");
const prepareUserDataDir = require("./prepareUserDataDir");
const determineEnvConfig = require("./determineEnvConfig");

module.exports = function nodeNw(binary, cwd, argv) {
  const [target] = getTarget(argv, process.stdin.isTTY);
  debug(`Target is: '${target}'`);
  switch (target) {
    case "version": {
      const version = require("../package.json").version;
      console.log("v" + version);
      break;
    }
    case "help": {
      const helpText = require("./help");
      console.log(helpText);
      break;
    }
    default: {
      // All other targets are handled by the NW.js process
      debug(`Spawning NW.js process to handle target: ${target}`);
      setupPipeWrenchSockets(target);
      const userDataDir = prepareUserDataDir();
      const envConfig = determineEnvConfig(cwd);
      startNw(binary, envConfig, userDataDir, argv);
      exitOnKillSignal();
    }
  }
};
