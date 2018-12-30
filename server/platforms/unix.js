"use strict";
const inPath = require("./helper/inPath");

function nwjsBinary() {
  return "nw";
}

function nwjsIsInstalled() {
  return inPath(nwjsBinary());
}

function installationInstructions() {
  return (
    "You need to have the 'nw' binary installed and in your " +
    "PATH to use node-nw.\n" +
    "You can download it from https://nwjs.io/.\n" +
    "The 'SDK' build flavor is required for DevTools support."
  );
}

module.exports = {
  nwjsIsInstalled,
  installationInstructions,
  nwjsBinary,
};