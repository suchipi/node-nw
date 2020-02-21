"use strict";

const debug = require("debug")("node-nw:server/bin");
const path = require("path");
const nodeNw = require("./index");

let bin;
if (process.platform === "win32") {
  debug("Platform detected: win32");
  bin = path.resolve(
    __dirname,
    "..",
    "binaries",
    "nwjs-sdk-v0.44.2-win-x64",
    "nw.exe"
  );
} else if (process.platform === "darwin") {
  debug("Platform detected: darwin");
  bin = path.resolve(
    __dirname,
    "..",
    "binaries",
    "nwjs-sdk-v0.44.2-osx-x64",
    "nwjs.app",
    "Contents",
    "MacOS",
    "nwjs"
  );
} else if (process.platform === "linux") {
  debug("Platform detected: linux");
  bin = path.resolve(
    __dirname,
    "..",
    "binaries",
    "nwjs-sdk-v0.44.2-linux-x64",
    "nw"
  );
} else {
  console.error("NW.js is not supported on this platform:", process.platform);
  process.exit(1);
}

nodeNw(bin, process.cwd(), process.argv.slice(2));
