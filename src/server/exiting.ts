"use strict";
const debug = require("debug")("node-nw:server/exiting");

const callbacks = [[], [], []];

function onExit(phase, callback) {
  callbacks[phase].unshift(callback);
}

let exiting = false;
async function exit(code) {
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

module.exports = {
  onExit,
  exit,
};
