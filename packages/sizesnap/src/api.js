const { readFileSync, existsSync, writeFile } = require("fs");
const { join } = require("path");
const pc = require("picocolors");
const { findFiles } = require("../../../lib/files");
const { info } = require("../../../lib/loggers");
const { pretty } = require("../../../lib/bytes");
const { brotli, gzip } = require("../../../lib/zipped");
const { SNAPSHOT_FILE } = require("./constants");

const _promiseStates = {
  pending: 0,
  done: 1,
  failed: 2,
};

const padder = " ";

const rpad = (string_, max) =>
  string_ + padder.repeat(Math.max(max - string_.length, 0));

function SizeSnap() {
  const that = this;
  that.config = {};
  that.filePaths = [];
  that.fileGetter = _promiseStates.pending;
  that.snapshot = {};
  that.generated = false;
  that.shouldPrettyPrint = false;

  // Function bindings
  that.readConfig = readConfig;
  that.generateSnapshot = generateSnapshot;
  that.sizeFiles = sizeFiles;
  that.toJSON = toJSON;
  that.writeSnapshot = writeSnapshot;
  that.onDone = onDone;
  that.value = getValue;
  that.tablePrint = tablePrint;
  that.markdownTablePrint = markdownTablePrint;

  // Private keys
  that._filenameMaxTextLength = 0;
  that._gzipMaxTextLength = 0;
  that._originalMaxTextLength = 0;
  that._brotliMaxTextLength = 0;

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
        that.filePaths = [...paths];
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
    for (const file of that.filePaths || []) {
      const buf = readFileSync(file);
      log &&
        info(`Sizing ${file} - ${pc.yellow(pretty(Buffer.byteLength(buf)))}`);
      snapshot[file] = {
        size: pretty(Buffer.byteLength(buf)),
        brotli: pretty(brotli(buf)),
        gzip: pretty(gzip(buf)),
      };
    }

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

  function _snapShotHeaders({ markdown = false } = { markdown: false }) {
    const tableHeader = (m) => (markdown ? m : pc.bold(pc.dim(m)));

    // Basically means this function was run already and the sizes already exist
    // do not recalculate the size
    if (
      that._filenameMaxTextLength > 0 &&
      that._gzipMaxTextLength > 0 &&
      that._originalMaxTextLength > 0 &&
      that._brotliMaxTextLength > 0
    ) {
      return;
    }

    // Find maximum text lengths for each header
    for (const fileKey of Object.keys(that.snapshot)) {
      const snapItem = that.snapshot[fileKey];
      that._filenameMaxTextLength = Math.max(
        fileKey.length,
        that._filenameMaxTextLength
      );
      that._gzipMaxTextLength = Math.max(
        snapItem.gzip.length,
        that._gzipMaxTextLength
      );
      that._originalMaxTextLength = Math.max(
        snapItem.size.length,
        that._originalMaxTextLength
      );
      that._brotliMaxTextLength = Math.max(
        snapItem.brotli.length,
        that._brotliMaxTextLength
      );
    }

    const headers = [
      tableHeader(rpad("filepath".toUpperCase(), that._filenameMaxTextLength)),
      tableHeader(rpad("size".toUpperCase(), that._originalMaxTextLength)),
      tableHeader(rpad("gzip".toUpperCase(), that._gzipMaxTextLength)),
      tableHeader(rpad("brotli".toUpperCase(), that._brotliMaxTextLength)),
    ];

    return headers;
  }

  function _snapShotBody({ markdown = false } = { markdown: false }) {
    const tableData = (m, italic, color) =>
      markdown ? m : pc[color || "white"](italic ? pc.italic(m) : m);

    const rows = [];

    for (const fileKey of Object.keys(that.snapshot)) {
      const snapItem = that.snapshot[fileKey];
      let print = [];

      print.push(tableData(rpad(fileKey, that._filenameMaxTextLength), true));
      print.push(
        tableData(
          rpad(snapItem.size, that._originalMaxTextLength),
          false,
          "yellow"
        )
      );
      print.push(
        tableData(rpad(snapItem.gzip, that._gzipMaxTextLength), false, "yellow")
      );
      print.push(
        tableData(
          rpad(snapItem.brotli, that._brotliMaxTextLength),
          false,
          "yellow"
        )
      );
      let delimeter = markdown ? "|" : "\t";

      rows.push(print.join(delimeter));
    }

    return rows;
  }

  function tablePrint(printer = console.log) {
    that.shouldPrettyPrint = true;
    waitForSnapshot(() => {
      const headers = _snapShotHeaders();
      let print = "";
      print += `${headers.join("\t")}\n`;
      print += _snapShotBody();
      printer("\n" + print + "\n");
    });
    return that;
  }

  function markdownTablePrint(printer = console.log) {
    waitForSnapshot(() => {
      const headers = _snapShotHeaders({ markdown: true });
      let print = "";
      print += `|${headers.join("|")}|\n`;
      print += `|${headers
        .map((x) => x.replace(/.*/, "-".repeat(x.length)))
        .join("|")}|\n`;
      print += "|" + _snapShotBody({ markdown: true }) + "|";
      printer("\n" + print + "\n");
    });
    return that;
  }

  function onDone(fn) {
    return waitForSnapshot(fn);
  }

  function toJSON() {
    return that.snapshot;
  }

  function getValue() {
    return new Promise((resolve) => {
      waitForSnapshot(() => {
        resolve(that.snapshot);
      });
    });
  }
}

exports.SizeSnap = SizeSnap;
