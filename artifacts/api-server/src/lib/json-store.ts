import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), ".data");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readJson<T>(filename: string, fallback: T): Promise<T> {
  await ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw err;
  }
}

const fileLocks = new Map<string, Promise<unknown>>();

async function rawWrite<T>(filename: string, value: T): Promise<void> {
  await ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  const tmp = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tmp, filePath);
}

export async function writeJson<T>(filename: string, value: T): Promise<void> {
  return withFileLock(filename, () => rawWrite(filename, value));
}

/**
 * Serializes the entire callback per filename so that load → modify → save
 * cycles cannot interleave and lose updates.
 */
export async function withFileLock<R>(filename: string, fn: () => Promise<R>): Promise<R> {
  const previous = fileLocks.get(filename) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(fn);
  fileLocks.set(filename, next);
  try {
    return await next;
  } finally {
    if (fileLocks.get(filename) === next) fileLocks.delete(filename);
  }
}
