#!/usr/bin/env node

const fs = require("fs");
const bytes = require("bytes");
const { findFiles } = require("./lib/files");
const { brotli, gzip } = require("./lib/zipped");
const pc = require("picocolors");
const path = require("path");

const SNAPSHOT_FILE = ".sizesnap.json";

const bail = (err) => {
  danger(`\n[sizesnap] ${err.message}`);
  process.exit(1);
};

const success = (msg) => {
  console.log(pc.green(msg));
};

const info = (msg) => {
  console.log(pc.white("==>"), pc.cyan(msg));
};

const danger = (msg) => {
  console.error(pc.red(`<==>${msg}`));
};

const pretty = (size) => bytes(size);

const readConfig = () => {
  const pkgData =
    (fs.existsSync("package.json") &&
      fs.readFileSync(path.join(process.cwd(), "package.json")).toString()) ||
    "{}";
  return JSON.parse(pkgData);
};

async function run() {
  try {
    const pkg = readConfig();

    if (!pkg.sizesnap) {
      throw new Error("couldn't find `sizesnap` config in package.json");
    }

    const filePaths = (pkg.sizesnap && pkg.sizesnap.files) || [];
    if (!filePaths.length) {
      info(`No Files to size`);
    }
    const filesToSize = await findFiles(filePaths);
    const snapshot = {};
    filesToSize.forEach((file) => {
      info(`Sizing ${file}`);
      const buf = fs.readFileSync(file);
      snapshot[file] = {
        size: pretty(Buffer.byteLength(buf)),
        brotli: pretty(brotli(buf)),
        gzip: pretty(gzip(buf)),
      };
    });
    writeSnapshot(snapshot);
  } catch (err) {
    bail(err);
  }
}

function writeSnapshot(snapshot = {}) {
  fs.writeFile(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), (err) => {
    if (err) {
      throw err;
    }
  });
}

async function main() {
  info("Reading Config");
  await run();
  success(`Generated ${SNAPSHOT_FILE}`);
}

main();
