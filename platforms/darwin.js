"use strict";
var fs = require("fs");

function nwjsBinary() {
  return "/Applications/nwjs.app/Contents/MacOS/nwjs";
}

function nwjsIsInstalled() {
  return fs.existsSync(nwjsBinary());
}

function installationInstructions() {
  return (
    "You need to have the 'nwjs' Application installed and in your " +
    "/Applications folder to use node-nw.\n" +
    "You can download it from https://nwjs.io/.\n" +
    "The 'SDK' build flavor is required for DevTools support."
  );
}

module.exports = {
  nwjsIsInstalled: nwjsIsInstalled,
  installationInstructions: installationInstructions,
  nwjsBinary: nwjsBinary,
};
