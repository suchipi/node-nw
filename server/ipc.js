var makeIpc = require("../shared/makeIpc");

module.exports = makeIpc({
  "stdin-raw-mode"(value) {
    process.stdin.setRawMode(value);
  },
});
