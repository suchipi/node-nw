#!/usr/bin/env node
"use strict";

const nodeNw = require("./index");

const platform =
  process.platform === "win32"
    ? require("./platforms/win32")
    : process.platform === "darwin"
    ? require("./platforms/darwin")
    : require("./platforms/unix");

if (platform.nwjsIsInstalled()) {
  nodeNw(platform.nwjsBinary(), process.cwd(), process.argv.slice(2));
} else {
  console.error(platform.installationInstructions());
  process.exit(1);
}
