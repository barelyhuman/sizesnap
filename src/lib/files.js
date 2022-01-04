const globule = require("globule");

function findFiles(pattern) {
  const filepaths = globule.find(pattern);
  return filepaths;
}

exports.findFiles = findFiles;
