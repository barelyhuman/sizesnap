import { promises as fs } from "fs";
import { resolve } from "path";

const { readdir } = fs;

export const deepReadDir = async (dir) => {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? deepReadDir(res) : res;
    })
  );
  return Array.prototype.concat(...files);
};
