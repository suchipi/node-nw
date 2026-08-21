import * as net from "net";
import * as util from "util";
import { StringDecoder } from "string_decoder";
import makeDebug from "debug";

const debug = makeDebug("node-nw:shared/makeIpc");

export type IpcHandlers = {
  [name: string]: (argument: any) => void;
};

// What you can send is defined by the handlers on the *other* end of the
// socket, not by the ones passed to makeIpc.
export type Ipc<SendHandlers extends IpcHandlers> = {
  setSocket(newSocket: net.Socket): void;
  send<Name extends keyof SendHandlers & string>(
    name: Name,
    ...args: Parameters<SendHandlers[Name]>
  ): void;
};

export default function makeIpc<
  SendHandlers extends IpcHandlers,
  ReceiveHandlers extends IpcHandlers,
>(receiveHandlers: ReceiveHandlers): Ipc<SendHandlers> {
  let socket: net.Socket;
  function setSocket(newSocket: net.Socket) {
    socket = newSocket;
    socket.on("data", makeReceiveCallback());
  }

  function makeReceiveCallback() {
    const decoder = new StringDecoder("utf-8");
    let pending = "";

    return function receive(data: Buffer | string) {
      // if decoder.write has incomplete data, it doesn't return the incomplete
      // parts until it receives enough to make it complete.
      const dataStr = typeof data === "string" ? data : decoder.write(data);
      debug(`IPC received: ${dataStr}`);

      pending += dataStr;

      const lines = pending.split("\n");
      pending = lines.pop()!;

      const commands = lines.filter(Boolean).map((line) => JSON.parse(line));

      commands.forEach((command) => {
        debug(`IPC processing command: ${util.inspect(command)}`);

        const handler = (receiveHandlers as IpcHandlers)[command.name];
        if (handler) handler(command.argument);
      });
    };
  }

  function send(name: string, argument?: any) {
    debug(`IPC sending: ${util.inspect({ name, argument })}`);

    const data = JSON.stringify({ name, argument }) + "\n";
    socket.write(data);
  }

  return { setSocket, send };
}
