import * as path from "path";
import yargsParser from "yargs-parser";

export type Target =
  | ["version"]
  | ["help"]
  | ["eval", string]
  | ["repl"]
  | ["require", string];

export function getTarget(argv: Array<string>, stdinIsTTY: boolean): Target {
  const config = yargsParser(argv, {
    alias: {
      version: ["v"],
      help: ["h"],
      eval: ["e"],
      interactive: ["i"],
    },
  });

  const firstPositional = config._[0];

  if (config.version) {
    return ["version"];
  } else if (config.help) {
    return ["help"];
  } else if (config.eval) {
    return ["eval", config.eval];
  } else if (config.interactive) {
    return ["repl"];
  } else if (firstPositional) {
    return ["require", path.resolve(process.cwd(), String(firstPositional))];
  } else {
    if (stdinIsTTY) {
      return ["repl"];
    } else {
      return ["help"];
    }
  }
}
