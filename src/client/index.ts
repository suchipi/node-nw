// NW.js runs this file as the app's main script, in a context that has
// `require` and `module` but no `exports` binding. TypeScript's ES module emit
// starts with `Object.defineProperty(exports, ...)`, which would throw there,
// so this file has to stay free of import/export syntax.

require("./setup");

const { getTarget } =
  require("../shared/argv") as typeof import("../shared/argv");

const [target, arg] = getTarget(
  process.argv.slice(1),
  Boolean(process.stdin.isTTY)
);

switch (target) {
  case "eval": {
    eval(arg);
    break;
  }
  case "require": {
    require(arg);
    break;
  }
  case "repl": {
    const replClient = require("./replClient") as typeof import("./replClient");
    replClient.start();
    break;
  }
}
