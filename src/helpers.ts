import * as fs from "fs";
import { createHash } from "crypto";
import { promisify } from "util";

export const stat = promisify(fs.stat);
export const mkdir = promisify(fs.mkdir);
export const unlink = promisify(fs.unlink);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);

export function md5(data: string) {
  return createHash('md5').update(data).digest("hex");
}

export function safeDate() {
  return new Date().toLocaleString().replace(/[\.:]/g, '').replace(/ /, '-');
}

export async function exists(path): Promise<fs.Stats | false> {
  try {
    return await stat(path);
  } catch (err) {
    return false;
  }
}

export async function createDir(path: string, force = false) {
  let stats = await exists(path) as fs.Stats;

  if (stats) {
    if (!stats.isDirectory()) {
      if (force) {
        await unlink(path);
        stats = null;
      } else {
        throw new Error(`${path} is already exists but it is not a directory!`);
      }
    }
  }

  if (!stats) {
    await mkdir(path);
  }
}
