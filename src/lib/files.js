const glob = require("tiny-glob");

async function findFiles(pattern) {
  let filePaths = [];
  const promises = pattern.map(async (pattr) => {
    const _filePaths = await glob(pattr, {
      filesOnly: true,
    });
    filePaths = filePaths.concat(_filePaths);
    return true;
  });
  await Promise.all(promises);
  return filePaths;
}

exports.findFiles = findFiles;
