import path from "path";
import { spawn } from "first-base";

const bin = path.resolve(__dirname, "..", "server", "bin.js");
const runCLI = (args = [], options = {}) =>
  spawn("node", [bin, ...args], options);

export default runCLI;
