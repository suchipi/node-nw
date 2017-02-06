var makeIpc = require("../../makeIpc");

module.exports = makeIpc({
  "exit": function() { process.exit(0); },
  "open-devtools": function() { nw.Window.get().showDevTools(); }
});
