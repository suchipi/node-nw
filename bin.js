#!/usr/bin/env node
"use strict";

var nodeNw = require("./index");

var platform;
if (process.platform === "win32") {
  platform = require("./platforms/win32");
} else if (process.platform === "darwin") {
  platform = require("./platforms/darwin");
} else {
  platform = require("./platforms/unix");
}

if (platform.nwjsIsInstalled()) {
  nodeNw(platform.nwjsBinary(), process.cwd(), process.argv.slice(2));
} else {
  console.error(platform.installationInstructions());
  process.exit(1);
}
