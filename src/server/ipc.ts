const debug = require("debug")("node-nw:server/ipc");
const makeIpc = require("../shared/makeIpc");

module.exports = makeIpc({
  "stdin-raw-mode"(value) {
    debug(`received stdin-raw-mode: ${value}`);
    process.stdin.setRawMode(value);
  },
  "set-exit-code"(code) {
    debug(`received set-exit-code: ${code}`);
    if (code != null) {
      process.exitCode = code;
    }
  },
});
