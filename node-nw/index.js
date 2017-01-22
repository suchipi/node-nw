"use strict";
var path = require("path");

// If invoked with '-e', run the script.
// Otherwise, if invoked with a file path, require and run it.
// Otherwise, open devtools as a repl.
if (process.argv[2] === "-e" && process.argv[3]) {
  eval(process.argv[3]);
} else if (process.argv[2]) {
  require(path.resolve(process.cwd(), process.argv[2]));
} else { // REPL mode
  win.showDevTools();
}
