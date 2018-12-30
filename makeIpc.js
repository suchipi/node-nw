module.exports = function makeIpc(receiveHandlers) {
  var socket;
  function setSocket(newSocket) {
    socket = newSocket;
    socket.on("data", function(data) {
      receive(data);
    });
  }

  function receive(data) {
    var command = JSON.parse(data);
    var handler = receiveHandlers[command.name];
    if (handler) handler(command.argument);
  }

  function send(name, argument) {
    var data = JSON.stringify({
      name: name,
      argument: argument,
    });
    socket.write(data);
  }

  return {
    setSocket: setSocket,
    send: send,
  };
};
