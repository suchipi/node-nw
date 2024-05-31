"use strict";
const path = require("path");
const debug = require("debug")("node-nw:server/prepareUserDataDir");
const { onExit } = require("./exiting");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = function prepareUserDataDir() {
  const os = require("os");
  const mkdirp = require("mkdirp");
  const rimraf = require("rimraf");

  const userDataDir = path.join(os.tmpdir(), "node-nw-profile-" + process.pid);
  debug(`Creating user data dir (${userDataDir})`);
  mkdirp.sync(userDataDir);
  onExit(2, async function removeUserDataDir() {
    debug(`Removing user data dir (${userDataDir})`);
    try {
      rimraf.sync(userDataDir);
    } catch (err) {
      debug(`Removing user data dir failed; retrying in 1 second: ${err}`);
      // nw.js might still be closing all its file handles, try again in a second
      await sleep(1000);
      rimraf.sync(userDataDir);
    }
  });

  return userDataDir;
};
