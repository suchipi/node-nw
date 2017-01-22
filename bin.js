#!/usr/bin/env node
"use strict";

var inPath = require("./inPath");
var nodeNw = require("./index");

if (process.platform === "win32" ? inPath("nw.exe") : inPath("nw")) {
  nodeNw(process.cwd(), process.argv.slice(2));
} else {
  console.error("You need to have the 'nw' binary installed and in your PATH to use node-nw.");
  console.error("You can download it from https://nwjs.io/.");
  console.error("The 'SDK' build flavor is required for DevTools support.");
  process.exit(-1);
}
