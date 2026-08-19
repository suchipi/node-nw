"use strict";
const util = require("util");

// It's not safe to try to inspect any of Chrome's Private APIs;
// some of them blow up because they try to use an internal
// chrome.developerPrivate.inspect to print themselves, but they
// call it with the wrong arguments.
function patchChrome(chrome) {
  function customInspect(recurseTimes, options) {
    const propertiesForInspect = {};
    for (const key in this) {
      if (
        key.includes("Private") ||
        key === "userScripts" ||
        key === "extension"
      ) {
        Object.defineProperty(propertiesForInspect, key, {
          get() {
            return this[key];
          },
        });
      } else {
        propertiesForInspect[key] = this[key];
      }
    }
    return propertiesForInspect;
  }

  // Prefer the Symbol util.inspect.custom where
  // available, but on old node versions, use "inspect"
  if (util.inspect.custom) {
    chrome[util.inspect.custom] = customInspect;
  } else {
    chrome.inspect = customInspect;
  }
}

patchChrome(window.chrome);
