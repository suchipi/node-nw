"use strict";
const vm = require("vm");
const util = require("util");

let repl;
function setSocket(socket) {
  repl = socket;
}

let supportsColor;
function setSupportsColor(bool) {
  supportsColor = bool;
}

function start() {
  repl.setEncoding("utf-8");
  repl.on("data", function(data) {
    let result;
    try {
      result = vm.runInThisContext(data, { filename: "repl" });
    } catch (error) {
      result = error;
    }
    try {
      result = util.inspect(result, { colors: supportsColor });
    } catch (error) {
      result = error.stack;
    }
    repl.write(result);
  });
}

module.exports = {
  setSocket,
  setSupportsColor,
  start,
};
