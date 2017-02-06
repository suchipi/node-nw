module.exports = function makeIpc(receiveHandlers) {
  var socket;
  function setSocket(newSocket) {
    socket = newSocket;
    socket.on("data", function(data) {
      receive(data);
    });
  }

  function receive(command) {
    var handler = receiveHandlers[command];
    if (handler) handler();
  }

  function send(command) {
    socket.write(command);
  }

  return {
    setSocket: setSocket,
    send: send,
  };
}
