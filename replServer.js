var repl = require("repl");
var ipc = require("./ipc");

function start(socket) {
  const replServer = repl.start({
    useGlobal: true,
    writer: function(output) { return output; },
    eval: function(cmd, context, filename, callback) {
      if (cmd === "\n") {
        callback("");
        return;
      }
      socket.write(cmd);
      socket.once("data", function(data) {
        callback(data);
      });
    },
  });

  replServer.on("close", function() {
    ipc.send("exit");
    setTimeout(function() {
      process.exit(0);
    }, 0);
  });

  replServer.defineCommand('devtools', {
    help: 'Open Chromium DevTools',
    action: function() {
      this.lineParser.reset();
      this.bufferedCommand = '';
      ipc.send("open-devtools");
      this.displayPrompt();
    }
  });
};

module.exports = {
  start: start,
};