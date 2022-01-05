const { findFiles } = require("./lib/files");
const { readFileSync, existsSync, writeFile } = require("fs");
const { join } = require("path");
const { info } = require("./lib/loggers");
const { pretty } = require("./lib/bytes");
const { brotli, gzip } = require("./lib/zipped");
const { SNAPSHOT_FILE } = require("./constants");
const pc = require("picocolors");

const _promiseStates = {
  pending: 0,
  done: 1,
  failed: 2,
};

const padder = " ";
const tableHeader = (m) => pc.bold(pc.dim(pc.underline(m)));
const tableData = (m, italic) => pc.white(italic ? pc.italic(m) : m);
const rpad = (str, max) => str + padder.repeat(max - str.length);

function SizeSnap() {
  const that = this;
  that.config = {};
  that.filePaths = [];
  that.fileGetter = _promiseStates.pending;
  that.snapshot = {};
  that.generated = false;
  this.shouldPrettyPrint = false;

  that.readConfig = readConfig;
  that.generateSnapshot = generateSnapshot;
  that.sizeFiles = sizeFiles;
  that.toJSON = toJSON;
  that.writeSnapshot = writeSnapshot;
  that.onDone = onDone;
  that.prettyPrint = prettyPrint;

  function readConfig(path = "package.json") {
    const pkgData =
      (existsSync(path) &&
        readFileSync(join(process.cwd(), path)).toString()) ||
      "{}";
    const pkg = JSON.parse(pkgData);
    that.config = (pkg && pkg.sizesnap) || {};
    return that;
  }

  function sizeFiles(filePattern = []) {
    if (filePattern.length === 0 && that.config && that.config.files) {
      filePattern = that.config.files;
    }
    findFiles(filePattern)
      .then((paths) => {
        that.fileGetter = _promiseStates.done;
        that.filePaths = paths.slice();
      })
      .catch((err) => {
        that.fileGetterDone = _promiseStates.failed;
      });
    return that;
  }

  function generateSnapshot() {
    const args = arguments;
    return waitForFileReader(() => _generateSnapshot(...args));
  }

  function waitForFileReader(toExec) {
    const id = setInterval(() => {
      if (that.fileGetter !== _promiseStates.pending) {
        clearInterval(id);
      }
      if (that.fileGetter === _promiseStates.done) {
        toExec();
      }
    }, 0);
    return that;
  }
  function waitForSnapshot(toExec) {
    const id = setInterval(() => {
      if (that.generated) {
        clearInterval(id);
        toExec();
      }
    });
    return that;
  }

  function _generateSnapshot({ log = false } = {}) {
    const snapshot = {};
    (that.filePaths || []).forEach((file) => {
      !that.shouldPrettyPrint && log && info(`Sizing ${file}`);
      const buf = readFileSync(file);
      snapshot[file] = {
        size: pretty(Buffer.byteLength(buf)),
        brotli: pretty(brotli(buf)),
        gzip: pretty(gzip(buf)),
      };
    });
    that.snapshot = snapshot;
    that.generated = true;
  }

  function writeSnapshot(file = SNAPSHOT_FILE) {
    return waitForFileReader(() => {
      writeFile(file, JSON.stringify(that.snapshot, null, 2), (err) => {
        if (err) {
          throw err;
        }
      });
    });
  }

  function prettyPrint() {
    that.shouldPrettyPrint = true;
    waitForSnapshot(() => {
      let fileNameSize = 0;
      let gzipSize = 0;
      let originalSize = 0;
      let brotliSize = 0;
      const items = [];

      Object.keys(that.snapshot).forEach((fileKey) => {
        const snapItem = that.snapshot[fileKey];
        fileNameSize = Math.max(fileKey.length, fileNameSize);
        gzipSize = Math.max(snapItem.gzip.length, gzipSize);
        originalSize = Math.max(snapItem.size.length, originalSize);
        brotliSize = Math.max(snapItem.brotli.length, brotliSize);
        items.push({
          path: fileKey,
          gzip: snapItem.gzip,
          size: snapItem.size,
          brotli: snapItem.brotli,
        });
      });

      let print = "";

      const headers = [
        tableHeader(rpad("filepath", fileNameSize)),
        tableHeader(rpad("size", originalSize)),
        tableHeader(rpad("gzip", gzipSize)),
        tableHeader(rpad("brotli", brotliSize)),
      ];

      print += `${headers.join("\t")}\n`;

      items.forEach((item) => {
        const tData = [
          tableData(rpad(item.path, fileNameSize)),
          tableData(rpad(item.size, originalSize), true),
          tableData(rpad(item.gzip, gzipSize), true),
          tableData(rpad(item.brotli, brotliSize), true),
        ];
        print += `${tData.join("\t")}\n`;
      });

      console.log("\n" + print + "\n");
    });
    return that;
  }

  function onDone(fn) {
    return waitForSnapshot(fn);
  }

  function toJSON() {
    return that.snapshot;
  }
}

exports.SizeSnap = SizeSnap;
