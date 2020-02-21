"use strict";

const callbacks = [[], [], []];

function onExit(phase, callback) {
  callbacks[phase].unshift(callback);
}

let exiting = false;
async function exit(code) {
  if (exiting) {
    return;
  }
  exiting = true;

  for (const callbackPhase of callbacks) {
    for (const callback of callbackPhase) {
      try {
        await callback();
      } catch (err) {
        console.error("Error while running exit callback:", err);
      }
    }
  }
  process.exit(code);
}

module.exports = {
  onExit,
  exit,
};
