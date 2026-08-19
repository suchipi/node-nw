import * as readline from "readline";
import makeDebug from "debug";
import { exit } from "./exiting";

const debug = makeDebug("node-nw:server/exitOnKillSignal");

export default function exitOnKillSignal() {
  if (process.platform === "win32") {
    debug("Registering readline interface for SIGINT handler");
    const readlineInterface = readline.createInterface({
      input: process.stdin,
    });

    readlineInterface.on("SIGINT", () => {
      process.emit("SIGINT", "SIGINT");
    });
  }

  process.on("SIGINT", () => {
    debug("Received SIGINT");
    exit();
  });

  process.on("SIGTERM", () => {
    debug("Received SIGTERM");
    exit();
  });

  process.on("SIGHUP", () => {
    debug("Received SIGHUP");
    exit();
  });

  process.on("exit", (code) => {
    debug(`process.exit was called with code: ${code}`);
    exit(code);
  });
}
