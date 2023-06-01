const glob = require('tiny-glob');

async function findFiles(pattern) {
  let filePaths = [];

  for (let pattr of pattern) {
    const _filePaths = await glob(pattr, {
      filesOnly: true,
    }).catch((err) => {
      if (err.message.includes('ENOENT')) {
        throw new Error(
          `Couldn't find files for the pattern '${pattr}'. Please re-check your pattern if the files are being generated or not `
        );
      }
      throw err;
    });
    filePaths = filePaths.concat(_filePaths);
  }

  return filePaths;
}

exports.findFiles = findFiles;
