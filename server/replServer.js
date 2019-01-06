const repl = require("repl");
const ipc = require("./ipc");
const { exit } = require("./exiting");

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
        if (data === "---NODE_NW_SOCKET_RESPONSE_END---") {
          callback(null, dataSoFar);
          socket.removeListener("data", onData);
        } else {
          dataSoFar += data;
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
