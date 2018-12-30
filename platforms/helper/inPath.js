"use strict";
const fs = require("fs");
const path = require("path");

const pathSeparator = process.platform === "win32" ? ";" : ":";

module.exports = function inPath(executableName) {
  const pathComponents = process.env.PATH.split(pathSeparator);
  for (const pathComponent of pathComponents) {
    const executablePath = path.join(pathComponent, executableName);
    if (fs.existsSync(executablePath)) {
      return true;
    }
  }
  return false;
};
