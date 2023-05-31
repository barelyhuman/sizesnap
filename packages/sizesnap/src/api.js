const { readFileSync, existsSync, writeFile } = require("fs");
const { join } = require("path");
const pc = require("picocolors");
const { findFiles } = require("../../../lib/files");
const { info } = require("../../../lib/loggers");
const { pretty } = require("../../../lib/bytes");
const { brotli, gzip } = require("../../../lib/zipped");
const { SNAPSHOT_FILE } = require("./constants");

const padder = " ";

const rpad = (string_, max) =>
  string_ + padder.repeat(Math.max(max - string_.length, 0));

function SizeSnap() {
  const that = this;

  that.config = {};
  that.filePaths = [];
  that.snapshot = {};
  that.shouldPrettyPrint = false;

  // Function bindings
  that.readConfig = readConfig;
  that.generateSnapshot = generateSnapshot;
  that.sizeFiles = sizeFiles;
  that.toJSON = toJSON;
  that.writeSnapshot = writeSnapshot;
  that.onDone = onDone;
  /**
   * @deprecated , `value` is no longer required and
   * the entire builder can be simply just awaited instead.
   *
   * eg:
   * const sizeBuilder =  new SizeSnap().readConfig().sizeFiles()
   * const snapshot = await sizeBuilder
   */
  that.value = getValue;
  that.tablePrint = tablePrint;
  that.markdownTablePrint = markdownTablePrint;
  that.then = then;
  that.catch = catchFn;

  // Private keys
  that._filenameMaxTextLength = 0;
  that._gzipMaxTextLength = 0;
  that._originalMaxTextLength = 0;
  that._brotliMaxTextLength = 0;

  // Event Helpers
  that.events = {
    q: [],
  };
  that.events.keys = {
    FILE_GET: "sizesnap:file:get",
    SNAPSHOT_DONE: "sizesnap:snapshot:done",
  };
  that.events.listeners = new Map();
  that.events.flush = function flush() {
    let evt;
    while ((evt = that.events.q.shift())) {
      (that.events.listeners.get(evt.name) || []).forEach((evtHandler) => {
        evtHandler(evt.data);
      });
    }
  };
  that.events.listen = function listen(eventKey, handler) {
    const listeners = that.events.listeners.get(eventKey) || [];
    listeners.push(handler);
    that.events.listeners.set(eventKey, listeners);
    return () => {
      const _listeners = that.events.listeners
        .get(eventKey)
        .filter((x) => x !== handler);
      that.events.listeners.set(eventKey, _listeners);
    };
  };
  that.events.emit = function emit(name, data) {
    that.events.q.push({
      name,
      data,
    });
    return that;
  };

  Object.freeze(that.events);

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
        that.filePaths = [...paths];
        that.events.emit(that.events.keys.FILE_GET, {
          files: [...paths],
        });
        that.events.flush();
      })
      .catch((err) => {
        throw new Error(err);
      });

    return that;
  }

  function generateSnapshot() {
    const args = arguments;
    that.events.listen(that.events.keys.FILE_GET, () => {
      _generateSnapshot(...args);
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

    that.events.emit(that.events.keys.SNAPSHOT_DONE, {});
    that.snapshot = snapshot;
  }

  function writeSnapshot(file = SNAPSHOT_FILE) {
    that.events.listen(that.events.keys.SNAPSHOT_DONE, () => {
      writeFile(file, JSON.stringify(that.snapshot, null, 2), (err) => {
        if (err) {
          throw err;
        }
      });
    });
    return that;
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
    that.events.listen(that.events.keys.SNAPSHOT_DONE, () => {
      const headers = _snapShotHeaders();
      let print = "";
      print += `${headers.join("\t")}\n`;
      print += _snapShotBody();
      printer("\n" + print + "\n");
    });
    return that;
  }

  function markdownTablePrint(printer = console.log) {
    that.events.listen(that.events.keys.SNAPSHOT_DONE, () => {
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
    that.events.listen(that.events.keys.SNAPSHOT_DONE, () => {
      fn();
    });
  }

  function toJSON() {
    return that.snapshot;
  }

  function getValue() {
    return new Promise((resolve) => {
      that.events.listen(this.events.keys.SNAPSHOT_DONE, () => {
        resolve(that.snapshot);
      });
    });
  }

  function then(fn) {
    that.events.listen(this.events.keys.SNAPSHOT_DONE, () => {
      fn(that.snapshot);
    });
  }

  function catchFn(fn) {
    that.events.listen(this.events.keys.SNAPSHOT_DONE, () => {
      fn(that.error);
    });
  }
}

exports.SizeSnap = SizeSnap;
