const makeIpc = require("../shared/makeIpc");

module.exports = makeIpc({
  "stdin-raw-mode"(value) {
    process.stdin.setRawMode(value);
  },
  "set-exit-code"(code) {
    if (code != null) {
      process.exitCode = code;
    }
  },
});
