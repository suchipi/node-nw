var callbacks = [];

function onExit(callback) {
  callbacks.push(callback);
}

var exiting = false;
function exit(code) {
  if (exiting) {
    return;
  } // guard against multiple exit requests
  exiting = true;
  callbacks.forEach(function(callback) {
    try {
      callback();
    } catch (err) {
      console.error("Error while running cleanup handler:", err);
    }
  });
  process.exit(code);
}

module.exports = {
  onExit: onExit,
  exit: exit,
};
