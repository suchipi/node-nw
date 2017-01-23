"use strict";
var path = require("path");

// If invoked with '-e', run the script.
// Otherwise, if invoked with a file path, require and run it.
// Otherwise, open devtools as a repl.
if (process.argv[1] === "-e" && process.argv[2]) {
  eval(process.argv[2]);
} else if (process.argv[1]) {
  require(path.resolve(process.cwd(), process.argv[1]));
} else { // REPL mode
  win.showDevTools();
}
