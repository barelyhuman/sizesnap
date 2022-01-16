const bytes = require("bytes");
exports.pretty = (size) => bytes(size);
exports.parse = (num) => bytes.parse(num);
