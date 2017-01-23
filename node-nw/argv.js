"use strict";
var path = require("path");

// If invoked with '-e', run the script.
// Otherwise, if invoked with a file path, require and run it.
// Otherwise, open a repl.
function target(argv) {
  if (argv[0] === "-e" && argv[1]) {
    return ["eval", argv[1]];
  } else if (argv[0]) {
    return ["require", path.resolve(process.cwd(), argv[0])];
  } else {
    return ["repl"];
  }
}

module.exports = {
  target: target,
};
