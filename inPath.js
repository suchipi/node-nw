var fs = require("fs");
var path = require("path");

var pathSeparator;
if (process.platform === "win32") {
  pathSeparator = ";";
} else {
  pathSeparator = ":";
}

module.exports = function inPath(executableName) {
  return process.env.PATH.split(pathSeparator).reduce(function(found, pathComponent) {
    if (found) return true;

    var executablePath = path.join(pathComponent, executableName);
    if (fs.existsSync(executablePath)) {
      return true;
    } else {
      return false;
    }
  }, false);
}
