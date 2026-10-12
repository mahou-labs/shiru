#!/usr/bin/env node
// dist-manifest <dir> prints one JSON line: every file under <dir> as
// {"path":"/a/b.html","size":123,"hash":"<32 hex>"}, sorted by path.
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const [dir] = process.argv.slice(2);
if (!dir) {
  console.error("usage: dist-manifest <dir>");
  process.exit(2);
}

const entries = await readdir(dir, { recursive: true, withFileTypes: true });
const manifest = [];
for (const entry of entries) {
  if (!entry.isFile()) continue;
  const file = path.join(entry.parentPath, entry.name);
  const bytes = await readFile(file);
  // The asset store keys content type by hash, so equal bytes under two
  // extensions must hash differently. Wrangler mixes in the extension too.
  const hash = createHash("sha256")
    .update(bytes)
    .update(path.extname(file).slice(1))
    .digest("hex")
    .slice(0, 32);
  manifest.push({ path: `/${path.relative(dir, file)}`, size: bytes.length, hash });
}
manifest.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
process.stdout.write(`${JSON.stringify(manifest)}\n`);
