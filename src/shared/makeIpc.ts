const util = require("util");
const debug = require("debug")("node-nw:shared/makeIpc");

module.exports = function makeIpc(receiveHandlers) {
  let socket;
  function setSocket(newSocket) {
    socket = newSocket;
    socket.on("data", receive);
  }

  function receive(dataBuf) {
    const dataStr = dataBuf.toString("utf-8");
    // TODO: handle chunked/interrupted data
    debug(`IPC received: ${dataStr}`);

    const commands = dataStr
      .toString("utf-8")
      .split("\n")
      .filter(Boolean)
      .map((datum) => JSON.parse(datum));

    commands.forEach((command) => {
      debug(`IPC processing command: ${util.inspect(command)}`);

      const handler = receiveHandlers[command.name];
      if (handler) handler(command.argument);
    });
  }

  function send(name, argument) {
    debug(`IPC sending: ${util.inspect({ name, argument })}`);

    const data = JSON.stringify({ name, argument }) + "\n";
    socket.write(data);
  }

  return { setSocket, send };
};
