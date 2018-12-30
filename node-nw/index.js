"use strict";
require("./setup");

const argv = require("./argv");
const replClient = require("./replClient");

const [target, arg] = argv.target(process.argv.slice(1), process.stdin.isTTY);

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
    replClient.start();
    break;
  }
}
