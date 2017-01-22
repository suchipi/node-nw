module.exports = function createHandleIpc(socket) {
  return function handleIpc(command) {
    var handler = ({
      "stdin-raw-mode:true": function() { process.stdin.setRawMode(true) },
      "stdin-raw-mode:false": function() { process.stdin.setRawMode(false) },
    })[command];
    if (handler) handler();
  }
}