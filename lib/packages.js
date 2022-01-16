import { createReadStream, mkdirSync, readdirSync, readFileSync } from "fs";
import { deepReadDir } from "./directories";
import got from "got";
import os from "os";
import { join, resolve } from "path";
import tar from "tar";
import { pretty } from "./bytes";
import { brotli, gzip } from "./zipped";

const REGISTRY = "https://registry.npmjs.org/";

const pkgMemo = new Map();

export const getTempDirectory = (pkgName) => {
  const dir = os.tmpdir("");
  const path = join(dir, pkgName);
  mkdirSync(path, { recursive: true });
  return path;
};

/**
 * @name generateSnapshot
 * @description takes in generated pkg data with tarball and generates list of files and their sizes,
 * @param {*} pkgData
 * @returns
 */
export const generateSnapshot = async (pkgData) => {
  if (!pkgData) {
    return [];
  }
  const tmpContainer = getTempDirectory(pkgData.pkg);
  console.log({ tmpContainer });

  const downStream = got.stream(pkgData.tarballUrl).pipe(
    tar.x({
      strip: 1,
      cwd: tmpContainer, // alias for cwd:'some-dir', also ok
    })
  );

  await new Promise((resolve) => {
    downStream.on("end", () => {
      resolve();
    });
  });

  const files = await deepReadDir(tmpContainer);

  const snapshot = [];
  files.forEach((file) => {
    const buf = readFileSync(file);

    const fname = file.replace(tmpContainer, ".");
    snapshot.push({
      file: fname,
      size: pretty(Buffer.byteLength(buf)),
      brotli: pretty(brotli(buf)),
      gzip: pretty(gzip(buf)),
    });
  });
  console.log({ snapshot });

  return snapshot;
};

/**
 * @name getPackageFiles
 * @description will get a normalized data on the package, with scoped name and version
 * @example
 * - sizesnap => {pkg:sizesnap,version:"0.1.0",tarballUrl:"https://registry.npmjs.org/sizesnap/-/sizesnap-0.1.0.tgz"}
 * - sizesnap@0.0.1 => {pkg:sizesnap,version:"0.0.1",tarballUrl:"https://registry.npmjs.org/sizesnap/-/sizesnap-0.0.1.tgz"}
 * - @barelyhuman/conch => {pkg:@barelyhuman/conch,scoped:true,version:"0.0.1",tarballUrl:"https://registry.npmjs.org/@barelyreaper/conch/-/conch-0.0.1.tgz"}
 */
export const getPackageData = async (name) => {
  try {
    if (pkgMemo.has(name)) {
      return pkgMemo.get(name);
    }
    const scoped = String(name).startsWith("@");
    const normlizedName = scoped ? name.slice(1) : name;
    const _pkgSplits = normlizedName.split("@").filter((x) => x);

    const pkgName = scoped ? "@" + _pkgSplits[0] : _pkgSplits[0],
      version = _pkgSplits[1] || "latest";

    let response = await got(REGISTRY + pkgName);
    response = JSON.parse(response.body);

    let tagRef = response["dist-tags"][version];

    if (!tagRef) {
      tagRef = Object.keys(response.versions).find((x) => x == version);
    }

    const versionData = response.versions[tagRef];

    const pkgData = {
      pkg: pkgName,
      scoped,
      version: tagRef,
      tarballUrl: versionData.dist.tarball,
      size: versionData.dist.unpackedSize || null,
    };

    pkgMemo.set(name, pkgData);
    return pkgData;
  } catch (err) {
    return false;
  }
};
