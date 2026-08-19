export type PipeWrenchIdentifiers = {
  stdout: string;
  stderr: string;
  stdin: string;
  ipc: string;
  repl: string;
};

export default function pipeWrenchIdentifiers(
  pid: number
): PipeWrenchIdentifiers {
  return {
    stdout: "node-nw-stdout-" + pid,
    stderr: "node-nw-stderr-" + pid,
    stdin: "node-nw-stdin-" + pid,
    ipc: "node-nw-ipc-" + pid,
    repl: "node-nw-repl-" + pid,
  };
}
