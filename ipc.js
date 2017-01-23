var receiveHandlers = {
  "stdin-raw-mode:true": function() { process.stdin.setRawMode(true) },
  "stdin-raw-mode:false": function() { process.stdin.setRawMode(false) },
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
