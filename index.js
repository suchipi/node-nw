"use strict";
var spawn = require("child_process").spawn;
var path = require("path");

module.exports = function nodeNw(cwd, argv) {
  spawn(
    "nw",
    [path.resolve(path.join(__dirname, "node-nw")), cwd].concat(argv),
    { stdio: "inherit" }
  );
}
