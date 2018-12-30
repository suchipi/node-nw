"use strict";
const makeIpc = require("../../makeIpc");

module.exports = makeIpc({
  "open-devtools"() {
    nw.Window.get().showDevTools();
  },
});
