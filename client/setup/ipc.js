"use strict";
const makeIpc = require("../../shared/makeIpc");

module.exports = makeIpc({
  "open-devtools"() {
    nw.Window.get().showDevTools();
  },
});
