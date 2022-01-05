#!/usr/bin/env node

const { SizeSnap } = require("./api");
const { SNAPSHOT_FILE } = require("./constants");
const { info, success } = require("./lib/loggers");

info("Reading Config");

const sizeSnap = new SizeSnap()
  .readConfig()
  .sizeFiles()
  .generateSnapshot({ log: true })
  .writeSnapshot();

const args = process.argv.slice(2);

if (args.indexOf("pretty") > -1) {
  sizeSnap.prettyPrint();
}

sizeSnap.onDone(() => {
  success(`Generated ${SNAPSHOT_FILE}`);
});

exports.SizeSnap = SizeSnap;
