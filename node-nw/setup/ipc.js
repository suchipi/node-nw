var receiveHandlers = {
  "exit": function() { process.exit(0); },
  "open-devtools": function() { nw.Window.get().showDevTools(); }
};

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

module.exports = {
  setSocket: setSocket,
  send: send,
};
