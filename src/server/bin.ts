#!/usr/bin/env node
"use strict";

const debug = require("debug")("node-nw:server/bin");
const nodeNw = require("./index");

const osTag =
  {
    darwin: "osx",
    win32: "win",
  }[process.platform] || process.platform;

const arch = process.arch;

debug(`Platform/arch: ${osTag}-${arch}`);

let bin;
try {
  bin = require(`@nwjs-binaries/${osTag}-${arch}`);
} catch (err) {
  console.error(
    [
      "Failed to load NW.js. Maybe it isn't supported on this platform?",
      `Platform/arch was: ${osTag}-${arch}`,
      "",
    ].join("\n")
  );
  console.error(err);
  process.exit(1);
}

nodeNw(bin, process.cwd(), process.argv.slice(2));
