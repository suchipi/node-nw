import makeDebug from "debug";
import makeIpc from "../../shared/makeIpc";
import type {
  ClientIpcHandlers,
  ServerIpcHandlers,
} from "../../shared/ipcHandlers";

const debug = makeDebug("node-nw:client/setup/ipc");

export default makeIpc<ServerIpcHandlers, ClientIpcHandlers>({
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
