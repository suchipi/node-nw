var makeIpc = require("./makeIpc");

module.exports = makeIpc({
  "stdin-raw-mode:true": function() { process.stdin.setRawMode(true) },
  "stdin-raw-mode:false": function() { process.stdin.setRawMode(false) },
});
