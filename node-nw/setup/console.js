"use strict";

module.exports = function(stdout, stderr) {
  var Console = require("console").Console;
  var devtoolsConsole = global.console;
  var nodeConsole = new Console(stdout, stderr);
  var multiPlexConsole = {};
  [
    "assert",
    "dir",
    "error",
    "info",
    "log",
    "time",
    "timeEnd",
    "trace",
    "warn",
  ].forEach(function(name) {
    multiPlexConsole[name] = function() {
      devtoolsConsole[name].apply(devtoolsConsole, arguments);
      nodeConsole[name].apply(nodeConsole, arguments);
    };
  });

  return multiPlexConsole;
};
