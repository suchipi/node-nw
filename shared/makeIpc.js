const util = require("util");
const debug = require("debug")("node-nw:shared/makeIpc");

module.exports = function makeIpc(receiveHandlers) {
  let socket;
  function setSocket(newSocket) {
    socket = newSocket;
    socket.on("data", receive);
  }

  function receive(data) {
    // TODO: handle chunked/interrupted data
    debug(`IPC received: ${data}`);

    const commands = data
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

    const data =
      JSON.stringify({
        name,
        argument,
      }) + "\n";
    socket.write(data);
  }

  return {
    setSocket,
    send,
  };
};
