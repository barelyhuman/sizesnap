const pc = require("picocolors");

exports.bail = (err) => {
  danger(`\n[sizesnap] ${err.message}`);
  process.exit(1);
};

exports.success = (msg) => {
  console.log(pc.green("-x-"), pc.green(msg));
};

exports.info = (msg) => {
  console.log(pc.white("==>"), pc.cyan(msg));
};

exports.danger = (msg) => {
  console.error(pc.red(`<==>${msg}`));
};
