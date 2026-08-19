import * as net from "net";
import * as util from "util";
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
    socket.on("data", receive);
  }

  function receive(dataBuf: Buffer) {
    const dataStr = dataBuf.toString("utf-8");
    // TODO: handle chunked/interrupted data
    debug(`IPC received: ${dataStr}`);

    const commands = dataStr
      .split("\n")
      .filter(Boolean)
      .map((datum) => JSON.parse(datum));

    commands.forEach((command) => {
      debug(`IPC processing command: ${util.inspect(command)}`);

      const handler = (receiveHandlers as IpcHandlers)[command.name];
      if (handler) handler(command.argument);
    });
  }

  function send(name: string, argument?: any) {
    debug(`IPC sending: ${util.inspect({ name, argument })}`);

    const data = JSON.stringify({ name, argument }) + "\n";
    socket.write(data);
  }

  return { setSocket, send };
}
