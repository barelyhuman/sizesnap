const zlib = require("zlib");
const brotli = require("brotli-size");

function gzipSizeSync(buffer) {
  return zlib.gzipSync(buffer, { level: 9 }).length;
}

function brotliSizeSync(buffer) {
  if (zlib.brotliCompressSync) {
    return zlib.brotliCompressSync(buffer).length;
  }
  return brotli.sync(buffer);
}

exports.gzip = (buffer) => {
  return gzipSizeSync(buffer);
};

exports.brotli = (buffer) => {
  return brotliSizeSync(buffer);
};
