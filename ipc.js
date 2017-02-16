var makeIpc = require("./makeIpc");

module.exports = makeIpc({
  "stdin-raw-mode": function(value) { process.stdin.setRawMode(value) }
});
