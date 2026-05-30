import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const contentRoot = new URL("src/content/", root);
const contentPath = fileURLToPath(contentRoot);

async function listMarkdown(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdown(full);
    return entry.name.endsWith(".md") ? [full] : [];
  }));
  return files.flat();
}

function slugFor(file, collection) {
  return relative(join(contentPath, collection), file)
    .replace(/\\/g, "/")
    .replace(/\.md$/, "");
}

function frontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  return match?.[1] ?? "";
}

function scalarNumber(fm, key) {
  const match = fm.match(new RegExp(`^${key}:\\s*(\\d+)`, "m"));
  return match ? Number(match[1]) : undefined;
}

function stringList(fm, key) {
  const lines = fm.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `${key}:`);
  if (start === -1) return [];
  const values = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\S/.test(line)) break;
    const item = line.match(/^\s*-\s*(.+?)\s*$/);
    if (item) values.push(item[1].replace(/^"|"$/g, ""));
  }
  return values;
}

const conceptFiles = await listMarkdown(join(contentPath, "concepts"));
const conceptSlugs = new Set(conceptFiles.map((file) => slugFor(file, "concepts")));
const gradeFiles = await listMarkdown(join(contentPath, "grades"));
const failures = [];

for (const file of gradeFiles) {
  const raw = await readFile(file, "utf8");
  const fm = frontmatter(raw);
  const expected = scalarNumber(fm, "sourceConceptCount");
  const equivalents = stringList(fm, "equivalentConceptSlugs");
  if (expected !== undefined && equivalents.length !== expected) {
    failures.push(`${slugFor(file, "grades")}: expected ${expected} concepts, found ${equivalents.length} slugs`);
  }
  for (const slug of equivalents) {
    if (!conceptSlugs.has(slug)) failures.push(`${slugFor(file, "grades")}: missing concept file ${slug}.md`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${gradeFiles.length} grade pathway(s) and ${conceptFiles.length} concept file(s).`);
