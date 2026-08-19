import * as net from "net";
import * as util from "util";
import * as vm from "vm";

let repl: net.Socket;
export function setSocket(socket: net.Socket) {
  repl = socket;
}

let supportsColor: boolean;
export function setSupportsColor(bool: boolean) {
  supportsColor = bool;
}

export function start() {
  repl.setEncoding("utf-8");
  repl.on("data", function (data) {
    let result;
    try {
      result = vm.runInThisContext(data.toString("utf-8"), {
        filename: "repl",
      });
    } catch (error) {
      result = error;
    }
    try {
      result = util.inspect(result, { colors: supportsColor });
    } catch (error) {
      result = error.stack;
    }
    repl.write(result);
    repl.write("---NODE_NW_SOCKET_RESPONSE_END---");
  });
}
