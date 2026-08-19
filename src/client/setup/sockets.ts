import * as pipeWrench from "pipe-wrench";
import pipeWrenchIdentifiers from "../../shared/pipeWrenchIdentifiers";

export default function setupSockets(pid: number) {
  const identifiers = pipeWrenchIdentifiers(pid);

  const stdout = pipeWrench.client(identifiers.stdout);
  const stderr = pipeWrench.client(identifiers.stderr);
  const stdin = pipeWrench.client(identifiers.stdin);
  const ipc = pipeWrench.client(identifiers.ipc);
  const repl = pipeWrench.client(identifiers.repl);

  return {
    stdout,
    stderr,
    stdin,
    ipc,
    repl,
  };
}
