#!/usr/bin/env node

const { SizeSnap } = require("./api");
const { SNAPSHOT_FILE } = require("./constants");
const { info, success, warn } = require("../../../lib/loggers");

function generate({
  log = true,
  table = false,
  write = true,
  markdown = false,
} = {}) {
  const args = process.argv.slice(2);

  // deprecations
  if (args.indexOf("table") > -1) {
    warn("\nDeprecated, use `--table` instead\n");
  }

  info("Reading Config");

  const sizeSnap = new SizeSnap().readConfig().sizeFiles();

  if (args.indexOf("table") > -1 || args.indexOf("--table") > -1) {
    log = false;
    table = true;
  }

  if (args.indexOf("--markdown") > -1) {
    markdown = true;
  }

  sizeSnap.generateSnapshot({ log });

  if (table && !markdown) {
    sizeSnap.tablePrint();
  }

  if (markdown && table) {
    sizeSnap.markdownTablePrint();
  }

  if (write) {
    sizeSnap.writeSnapshot();
    sizeSnap.onDone(() => {
      success(`Generated ${SNAPSHOT_FILE}`);
    });
  }
}

exports.SizeSnap = SizeSnap;
exports.generate = generate;

if (require.main === module) {
  generate();
}
