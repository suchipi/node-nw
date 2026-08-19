import makeDebug from "debug";
import makeIpc from "../shared/makeIpc";
import type {
  ServerIpcHandlers,
  ClientIpcHandlers,
} from "../shared/ipcHandlers";

const debug = makeDebug("node-nw:server/ipc");

export default makeIpc<ClientIpcHandlers, ServerIpcHandlers>({
  "stdin-raw-mode"(value) {
    debug(`received stdin-raw-mode: ${value}`);
    process.stdin.setRawMode(value);
  },
  "set-exit-code"(code) {
    debug(`received set-exit-code: ${code}`);
    if (code != null) {
      process.exitCode = code;
    }
  },
});
