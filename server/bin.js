"use strict";

const debug = require("debug")("node-nw:server/bin");
const nodeNw = require("./index");

let bin;
if (process.platform === "win32") {
  debug("Platform detected: win32");
  bin = require("@nwjs-binaries/win-x64");
} else if (process.platform === "darwin") {
  debug("Platform detected: darwin");
  bin = require("@nwjs-binaries/osx-x64");
} else if (process.platform === "linux") {
  debug("Platform detected: linux");
  bin = require("@nwjs-binaries/linux-x64");
} else {
  console.error("NW.js is not supported on this platform:", process.platform);
  process.exit(1);
}

nodeNw(bin, process.cwd(), process.argv.slice(2));
