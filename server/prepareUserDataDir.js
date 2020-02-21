"use strict";
const path = require("path");
const debug = require("debug")("node-nw:server/prepareUserDataDir");
const { onExit } = require("./exiting");

module.exports = function prepareUserDataDir() {
  const os = require("os");
  const mkdirp = require("mkdirp");
  const rimraf = require("rimraf");

  const userDataDir = path.join(os.tmpdir(), "node-nw-profile-" + process.pid);
  debug(`Creating user data dir (${userDataDir})`);
  mkdirp.sync(userDataDir);
  onExit(2, () => {
    debug(`Removing user data dir (${userDataDir})`);
    rimraf.sync(userDataDir);
  });

  return userDataDir;
};
