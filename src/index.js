#!/usr/bin/env node

const { SizeSnap } = require("./api");
const { SNAPSHOT_FILE } = require("./constants");
const { info, success } = require("./lib/loggers");

info("Reading Config");

new SizeSnap()
  .onDone(() => {
    success(`Generated ${SNAPSHOT_FILE}`);
  })
  .generateSnapshot({ log: true })
  .writeSnapshot()
  .readConfig()
  .sizeFiles();

exports.SizeSnap = SizeSnap;
