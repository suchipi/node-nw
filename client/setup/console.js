"use strict";
const Console = require("console").Console;

module.exports = function makeConsole(stdout, stderr) {
  const devtoolsConsole = global.console;
  const nodeConsole = new Console(stdout, stderr);
  const multiPlexConsole = {};
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
  ].forEach((name) => {
    multiPlexConsole[name] = function() {
      devtoolsConsole[name].apply(devtoolsConsole, arguments);
      nodeConsole[name].apply(nodeConsole, arguments);
    };
    Object.defineProperty(multiPlexConsole[name], "name", { value: name });
  });

  return multiPlexConsole;
};
