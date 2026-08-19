import * as child_process from "child_process";
import * as path from "path";
import makeDebug from "debug";
import shellEscape from "shell-escape";
import { onExit, exit } from "./exiting";
import type { EnvConfig } from "../shared/envConfig";

const debug = makeDebug("node-nw:server/startNw");
const nwDebug = makeDebug("node-nw:nw");

export default function startNw(
  binary: string,
  envConfig: EnvConfig,
  userDataDir: string,
  argv: Array<string>
) {
  function escape(arg: string) {
    if (process.platform === "win32") {
      if (arg.indexOf(" ") !== -1) {
        return '"' + arg + '"';
      } else {
        return arg;
      }
    } else {
      return shellEscape([userDataDir]);
    }
  }

  const nwArgv = [
    path.resolve(__dirname, "..", "client"),
    "--user-data-dir=" + escape(userDataDir),
    JSON.stringify(envConfig),
  ].concat(argv);
  const spawnOptions = { stdio: "pipe" } as const;
  debug("Spawning: %o", [binary, nwArgv, spawnOptions]);
  const nw = child_process.spawn(binary, nwArgv, spawnOptions);

  let exitedResolve = () => {};

  let running = true;
  onExit(1, async function sigkillNwjs() {
    if (running) {
      debug("Killing NW.js process");
      nw.kill("SIGKILL");
      await new Promise<void>((resolve) => {
        exitedResolve = resolve;
      });
      nw.unref();
    } else {
      debug("Exit was called, but the process is already exiting; ignoring");
    }
  });

  nw.once("close", (code) => {
    debug("NW.js process closed, %o", code);
    running = false;
    exit();
    exitedResolve();
  });

  let nwOutput = "";

  nw.once("exit", (code) => {
    debug("NW.js process exited, %o", code);
    running = false;
    if (code !== 0) {
      console.error(nwOutput);
      process.exitCode = code;
    }
    exit();
    exitedResolve();
  });

  nw.once("error", (err) => {
    console.error("An error occurred in the child nw process: ", err);
    running = false;
    process.exitCode = 1;
    exit();
  });

  nw.stdout.on("data", (data) => {
    nwOutput += data;

    nwDebug("stdout: %s", data);
  });
  nw.stderr.on("data", (data) => {
    nwOutput += data;

    nwDebug("stderr: %s", data);
  });
}
