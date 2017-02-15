var makeIpc = require("../../makeIpc");

module.exports = makeIpc({
  "open-devtools": function() { nw.Window.get().showDevTools(); }
});
