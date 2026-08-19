import * as os from "os";
import * as path from "path";
import makeDebug from "debug";
import * as mkdirp from "mkdirp";
import * as rimraf from "rimraf";
import { onExit } from "./exiting";

const debug = makeDebug("node-nw:server/prepareUserDataDir");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function prepareUserDataDir(): string {
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
}
