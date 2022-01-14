#!/usr/bin/env node

const { SizeSnap } = require("./api");
const { SNAPSHOT_FILE } = require("./constants");
const { info, success } = require("./lib/loggers");

function generate({ log = true, table = false, write = true } = {}) {
  info("Reading Config");

  const sizeSnap = new SizeSnap().readConfig().sizeFiles();

  const args = process.argv.slice(2);

  if (args.indexOf("table") > -1) {
    log = false;
    table = true;
  }

  sizeSnap.generateSnapshot({ log });

  if (table) {
    sizeSnap.tablePrint();
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
