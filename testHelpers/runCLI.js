import path from "path";
import start from "./start";

const bin = path.resolve(path.join(__dirname, "../bin.js"));
const runCLI = (args = [], options = {}) =>
  start("node", [bin, ...args], options);

export default runCLI;
