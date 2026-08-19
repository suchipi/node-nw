import * as path from "path";
import {
  spawn,
  type Options,
  type NonPtyRunContext,
  type PtyRunContext,
} from "first-base";

const bin = path.resolve(
  __dirname,
  "..",
  "..",
  "dist",
  "server",
  "bin.js"
);

function runCLI(
  args: Array<string>,
  options: Options & { pty: true }
): PtyRunContext;
function runCLI(args?: Array<string>, options?: Options): NonPtyRunContext;
function runCLI(args: Array<string> = [], options: Options = {}): any {
  return spawn("node", [bin, ...args], options);
}

export default runCLI;
