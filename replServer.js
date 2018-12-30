const repl = require("repl");
const ipc = require("./ipc");

function start(socket) {
  const replServer = repl.start({
    useGlobal: true,
    writer: (output) => output,
    eval(cmd, context, filename, callback) {
      if (cmd === "\n") {
        callback("");
        return;
      }
      socket.write(cmd);
      socket.once("data", (data) => {
        // TODO: collect data split across multiple "data" events and don't callback until all are sent
        // (long console.log of util inspect is truncated).
        // Maybe debounce 0 is good enough?
        callback(data);
      });
    },
  });

  replServer.on("close", () => {
    process.exit(0);
  });

  replServer.defineCommand("devtools", {
    help: "Open Chromium DevTools",
    action() {
      this.lineParser.reset();
      this.bufferedCommand = "";
      ipc.send("open-devtools");
      this.displayPrompt();
    },
  });
}

module.exports = {
  start,
};
