"use strict";
const path = require("path");
const yargsParser = require("yargs-parser");

function getTarget(argv, stdinIsTTY) {
  const config = yargsParser(argv, {
    alias: {
      version: ["v"],
      help: ["h"],
      eval: ["e"],
      interactive: ["i"],
    },
  });

  if (config.version) {
    return ["version"];
  } else if (config.help) {
    return ["help"];
  } else if (config.eval) {
    return ["eval", config.eval];
  } else if (config.interactive) {
    return ["repl"];
  } else if (config._[0]) {
    return ["require", path.resolve(process.cwd(), config._[0])];
  } else {
    if (stdinIsTTY) {
      return ["repl"];
    } else {
      return ["help"];
    }
  }
}

module.exports = {
  getTarget,
};
