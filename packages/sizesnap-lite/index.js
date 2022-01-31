const { readFileSync } = require("fs");
const zlib = require("zlib");
const { resolve } = require("path");

const bullet = (msg) => `\u001b[1m${msg}\u001b[0m`;
const dim = (msg) => `\u001b[2m${msg}\u001b[0m`;

function gzip(buffer) {
  return zlib.gzipSync(buffer, { level: 9 }).length;
}

function brotli(buffer) {
  return zlib.brotliCompressSync(buffer).length;
}

const indent = (txt) => {
  const regex = /^/gm;
  return txt.replace(regex, " ".repeat(4));
};

const prettyBytes = (bytes) => {
  return bytes > 1000 ? bytes / 1000 + "kB" : bytes + "B";
};

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    throw new Error("Provide a file for sizesnap to size");
  }

  if (args.length > 1) {
    throw new Error("Invalid args, only one argument accepted");
  }

  const file = resolve(args[0]);
  const buf = readFileSync(file);
  const normName = file.replace(__dirname, "").slice(1);
  let print = "";
  print += dim(normName) + " - ";
  print += bullet(prettyBytes(Buffer.byteLength(buf))) + " ";
  print += bullet(prettyBytes(gzip(buf))) + dim("/gz ");
  print += bullet(prettyBytes(brotli(buf))) + dim("/br ");

  console.log("\n" + indent(print) + "\n");
}

main();
