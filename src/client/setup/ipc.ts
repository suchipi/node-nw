/* global chrome */
"use strict";
const debug = require("debug")("node-nw:client/setup/ipc");
const makeIpc = require("../../shared/makeIpc");

module.exports = makeIpc({
  "open-devtools"() {
    debug("received open-devtools");
    // https://github.com/nwjs/nw.js/issues/4578
    chrome.developerPrivate.openDevTools({
      renderViewId: -1,
      renderProcessId: -1,
      extensionId: chrome.runtime.id,
    });
  },
});
