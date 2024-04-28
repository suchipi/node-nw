const repl = require("repl");
const ipc = require("./ipc");
const { exit } = require("./exiting");

const SOCKET_RESPONSE_END = "---NODE_NW_SOCKET_RESPONSE_END---";

function start(socket) {
  const replServer = repl.start({
    useGlobal: true,
    writer: (output) => output,
    eval(cmd, context, filename, callback) {
      if (cmd === "\n") {
        callback(null, "");
        return;
      }
      let dataSoFar = "";
      function onData(data) {
        dataSoFar += data;
        if (dataSoFar.endsWith(SOCKET_RESPONSE_END)) {
          const dataWithoutEnd = dataSoFar.slice(
            0,
            -SOCKET_RESPONSE_END.length
          );
          callback(null, dataWithoutEnd);
          socket.removeListener("data", onData);
        }
      }
      socket.on("data", onData);
      socket.write(cmd);
    },
  });

  replServer.on("close", () => {
    exit();
  });

  replServer.defineCommand("devtools", {
    help: "Open Chromium DevTools",
    action() {
      ipc.send("open-devtools");
      this.displayPrompt();
    },
  });
}

module.exports = {
  start,
};
