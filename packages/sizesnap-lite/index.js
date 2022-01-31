const { readFileSync } = require("fs");
const zlib = require("zlib");
const { resolve } = require("path");

const bullet = (msg) => `\u001b[1m${msg}\u001b[0m`;
const dim = (msg) => `\u001b[2m${msg}\u001b[0m`;
const danger = (msg) => bullet(`\u001b[31m${msg}\u001b[0m`);

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

async function cli() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    return console.error(danger("Provide a file for sizesnap to size"));
  }

  if (args.length > 1) {
    return console.error(danger("Invalid args, only one argument accepted"));
  }

  const sizeString = await lite(resolve(args[0]));
  console.log("\n" + indent(sizeString) + "\n");
}

async function lite(file) {
  const buf = readFileSync(file);
  const normName = (name) => {
    name = name.replace(__dirname, "");
    return (name.startsWith("/") && name.slice(1)) || name;
  };
  let print = "";
  print += dim(normName(file)) + " - ";
  print += bullet(prettyBytes(Buffer.byteLength(buf))) + " ";
  print += bullet(prettyBytes(gzip(buf))) + dim("/gz ");
  print += bullet(prettyBytes(brotli(buf))) + dim("/br ");

  return print;
}

if (require.main === module) {
  cli();
}

module.exports = lite;
