module.exports = function makeIpc(receiveHandlers) {
  let socket;
  function setSocket(newSocket) {
    socket = newSocket;
    socket.on("data", receive);
  }

  function receive(data) {
    const command = JSON.parse(data);
    const handler = receiveHandlers[command.name];
    if (handler) handler(command.argument);
  }

  function send(name, argument) {
    const data = JSON.stringify({
      name,
      argument,
    });
    socket.write(data);
  }

  return {
    setSocket,
    send,
  };
};
