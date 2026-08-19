import makeDebug from "debug";
import { getTarget } from "../shared/argv";
import startNw from "./startNw";
import setupPipeWrenchSockets from "./setupPipeWrenchSockets";
import exitOnKillSignal from "./exitOnKillSignal";
import prepareUserDataDir from "./prepareUserDataDir";
import determineEnvConfig from "./determineEnvConfig";
import helpText from "./help";

const debug = makeDebug("node-nw:server/index");

export default function nodeNw(
  binary: string,
  cwd: string,
  argv: Array<string>
) {
  const [target] = getTarget(argv, Boolean(process.stdin.isTTY));
  debug(`Target is: '${target}'`);
  switch (target) {
    case "version": {
      const { version } = require("../../package.json") as { version: string };
      console.log("v" + version);
      break;
    }
    case "help": {
      console.log(helpText);
      break;
    }
    default: {
      // All other targets are handled by the NW.js process
      debug(`Spawning NW.js process to handle target: ${target}`);
      setupPipeWrenchSockets(target);
      const userDataDir = prepareUserDataDir();
      const envConfig = determineEnvConfig(cwd);
      startNw(binary, envConfig, userDataDir, argv);
      exitOnKillSignal();
    }
  }
}
