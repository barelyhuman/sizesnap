const pc = require("picocolors");

exports.bail = (err) => {
  danger(`\n[sizesnap] ${err.message}`);
  process.exit(1);
};

exports.warn = (msg) => {
  console.log(pc.yellow(pc.bold(msg)));
};

exports.success = (msg) => {
  console.log(pc.green("-x-"), pc.green(msg));
};

exports.info = (msg) => {
  console.log(pc.yellow(">>"), pc.bold(pc.white(msg)));
};

exports.danger = (msg) => {
  console.error(pc.red(`${msg}`));
};
