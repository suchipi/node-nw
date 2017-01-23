"use strict";
require("./setup");

var argv = require("./argv");
var replClient = require("./replClient");

var executionTarget = argv.target(process.argv.slice(1));
var target = executionTarget[0];
var arg = executionTarget[1];

({
  "eval": function() {
    eval(arg);
  },
  "require": function() {
    require(arg);
  },
  "repl": function() {
    replClient.start();
  },
})[target]();
