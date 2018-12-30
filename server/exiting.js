"use strict";

const callbacks = [];

function onExit(callback) {
  callbacks.unshift(callback);
}

let exiting = false;
async function exit(code) {
  if (exiting) {
    return;
  }
  exiting = true;

  for (const callback of callbacks) {
    try {
      await callback();
    } catch (err) {
      console.error("Error while running cleanup handler:", err);
    }
  }
  process.exit(code);
}

module.exports = {
  onExit,
  exit,
};
