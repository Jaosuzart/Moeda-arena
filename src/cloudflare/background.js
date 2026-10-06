const { waitUntil } = require("./bindings.mjs");

module.exports = (promise) => {
  waitUntil(promise);
  return promise;
};
