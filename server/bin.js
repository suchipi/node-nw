"use strict";

const debug = require("debug")("node-nw:server/bin");
const nodeNw = require("./index");

let platform;
if (process.platform === "win32") {
  debug("Platform detected: win32");
  platform = require("./platforms/win32");
} else if (process.platform === "darwin") {
  debug("Platform detected: darwin");
  platform = require("./platforms/darwin");
} else {
  debug("Platform detected: unix");
  platform = require("./platforms/unix");
}

if (platform.nwjsIsInstalled()) {
  debug("NW.js is installed");
  nodeNw(platform.nwjsBinary(), process.cwd(), process.argv.slice(2));
} else {
  debug("NW.js not installed");
  console.error(platform.installationInstructions());
  process.exit(1);
}
