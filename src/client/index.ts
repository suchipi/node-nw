"use strict";
require("./setup");

const { getTarget } = require("../shared/argv");
const [target, arg] = getTarget(process.argv.slice(1), process.stdin.isTTY);

switch (target) {
  case "eval": {
    eval(arg);
    break;
  }
  case "require": {
    require(arg);
    break;
  }
  case "repl": {
    const replClient = require("./replClient");
    replClient.start();
    break;
  }
}
