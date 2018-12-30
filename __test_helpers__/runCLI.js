import path from "path";
import start from "./start";

const bin = path.resolve(__dirname, "..", "server", "bin.js");
const runCLI = (args = [], options = {}) =>
  start("node", [bin, ...args], options);

export default runCLI;
