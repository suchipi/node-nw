module.exports = function(pid) {
  return {
    stdout: "node-nw-stdout-" + pid,
    stderr: "node-nw-stderr-" + pid,
    stdin: "node-nw-stdin-" + pid,
    ipc: "node-nw-ipc-" + pid,
    repl: "node-nw-repl-" + pid,
  };
};
