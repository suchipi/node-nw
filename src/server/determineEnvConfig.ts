import makeDebug from "debug";
import supportsColor from "supports-color";
import type { EnvConfig } from "../shared/envConfig";

const debug = makeDebug("node-nw:server/determineEnvConfig");

export default function determineEnvConfig(cwd: string): EnvConfig {
  const envConfig: EnvConfig = {
    cwd,
    pid: process.pid,
    supportsColor: Boolean(supportsColor),
    stdinIsTTY: Boolean(process.stdin.isTTY),
    stdoutIsTTY: Boolean(process.stdout.isTTY),
  };

  debug("envConfig: %o", envConfig);

  return envConfig;
}
