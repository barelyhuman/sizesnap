const sizeDefinitions = {};
sizeDefinitions.b = 1;
sizeDefinitions.kb = 1000 * sizeDefinitions.b;
sizeDefinitions.mb = 1000 * sizeDefinitions.kb;
sizeDefinitions.gb = 1000 * sizeDefinitions.mb;
sizeDefinitions.tb = 1000 * sizeDefinitions.gb;

const bytes = {
  pretty(toSize) {
    let sizeKey;
    const sizes = Object.keys(sizeDefinitions);
    for (const size of sizes) {
      const item = sizeDefinitions[size];
      if (toSize < item) {
        continue;
      }
      sizeKey = size;
    }
    return toSize / sizeDefinitions[sizeKey] + sizeKey.toUpperCase();
  },
  parse(toParse) {
    if (!isNaN(toParse)) {
      return Number(toParse);
    }

    const regex = /^([0-9]*[.]?[0-9]*)(b|kb|mb|gb|tb)$/i;
    if (!regex.test(toParse)) {
      throw new Error("Invalid `toParse` value provided to `parse`");
    }
    const [_, size, suffix] = regex.exec(toParse);
    return Number(size) * sizeDefinitions[suffix.toLowerCase()];
  },
};

exports.pretty = (size) => bytes.pretty(size);
exports.parse = (number_) => bytes.parse(number_);
