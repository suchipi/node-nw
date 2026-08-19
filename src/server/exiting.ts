import makeDebug from "debug";

const debug = makeDebug("node-nw:server/exiting");

export type ExitPhase = 0 | 1 | 2;
export type ExitCallback = () => void | Promise<void>;

const callbacks: [
  Array<ExitCallback>,
  Array<ExitCallback>,
  Array<ExitCallback>,
] = [[], [], []];

export function onExit(phase: ExitPhase, callback: ExitCallback) {
  callbacks[phase].unshift(callback);
}

let exiting = false;
export async function exit(code?: number | null) {
  debug(`exit called with: ${code}`);

  if (exiting) {
    debug(`we're already exiting; bailing (code was ${code})`);
    return;
  }
  exiting = true;

  let phaseNum = 0;
  for (const callbackPhase of callbacks) {
    debug(`Running callbacks for exit phase ${phaseNum++}`);
    for (const callback of callbackPhase) {
      try {
        debug(`Running callback: ${callback.name || "<anonymous function>"}`);
        await callback();
      } catch (err) {
        console.error("Error while running exit callback:", err);
      }
    }
  }

  if (code == null) {
    debug(`Calling final process.exit()`);
    process.exit();
  } else {
    debug(`Calling final process.exit(${code})`);
    process.exit(code);
  }
}
