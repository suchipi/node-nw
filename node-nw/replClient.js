"use strict";
var vm = require("vm");
var util = require("util");

var repl;
var supportsColor;

function setSocket(socket) {
  repl = socket;
}

function setSupportsColor(bool) {
  supportsColor = bool;
}

function start() {
  repl.setEncoding("utf-8");
  repl.on("data", function(data) {
    var result;
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
  setSocket: setSocket,
  setSupportsColor: setSupportsColor,
  start: start,
};
