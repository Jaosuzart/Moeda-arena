const rateLimit = require("express-rate-limit");

module.exports = ({ identifier, ...options }) => rateLimit(options);
