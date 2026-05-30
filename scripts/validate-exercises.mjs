import fs from "node:fs";
import path from "node:path";
import generatedIxl from "../src/data/generated/ixlPublicPages.json" with { type: "json" };

const root = process.cwd();
const distRoot = path.join(root, "dist");
const subjectPrefixes = ["/math/", "/ela/", "/science/", "/social-studies/", "/spanish/"];
const intentionallyGenericModes = new Set([]);

function isSubjectLeaf(page) {
  const route = page.path;
  if (!subjectPrefixes.some((prefix) => route.startsWith(prefix))) return false;
  if (route.includes("/skill-plans/")) return false;
  if (page.skillSections?.length) return false;
  if (/\/(videos|games|lessons|skills)$/.test(route)) return false;
  const depth = route.split("/").filter(Boolean).length;
  return route.startsWith("/spanish/") ? depth >= 2 : depth >= 3;
}

function htmlFileForRoute(route) {
  const parts = route.split("/").filter(Boolean);
  return path.join(distRoot, ...parts, "index.html");
}

function decodeHtml(value) {
  return value
    .replaceAll("&quot;", "\"")
    .replaceAll("&#34;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractExerciseSet(html, route) {
  const payloadId = `practice-data-${route.replace(/[^a-z0-9]+/gi, "-")}`;
  const pattern = new RegExp(`<script[^>]+id=["']${payloadId}["'][^>]*>([\\s\\S]*?)<\\/script>`);
  const match = html.match(pattern);
  if (!match) return undefined;
  return JSON.parse(decodeHtml(match[1]));
}

function valuesEqual(left, right) {
  return String(left) === String(right);
}

const pages = generatedIxl.pages.filter(isSubjectLeaf);
const errors = [];
const modeCounts = new Map();
const modeSamples = new Map();
const genericRoutes = [];

for (const page of pages) {
  const file = htmlFileForRoute(page.path);
  if (!fs.existsSync(file)) {
    errors.push(`${page.path}: missing built HTML at ${path.relative(root, file)}`);
    continue;
  }

  const html = fs.readFileSync(file, "utf8");
  if (!html.includes("data-practice-engine")) {
    errors.push(`${page.path}: missing practice engine`);
    continue;
  }

  let exerciseSet;
  try {
    exerciseSet = extractExerciseSet(html, page.path);
  } catch (error) {
    errors.push(`${page.path}: invalid practice payload JSON (${error.message})`);
    continue;
  }

  if (!exerciseSet) {
    errors.push(`${page.path}: missing practice payload`);
    continue;
  }

  const mode = exerciseSet.mode || "UNSET";
  modeCounts.set(mode, (modeCounts.get(mode) ?? 0) + 1);
  if (!modeSamples.has(mode)) modeSamples.set(mode, []);
  if (modeSamples.get(mode).length < 5) modeSamples.get(mode).push(page.path);

  if (mode === "Skill practice" || mode.endsWith(" practice") && !intentionallyGenericModes.has(mode)) {
    genericRoutes.push(page.path);
  }

  if (!Array.isArray(exerciseSet.questions) || exerciseSet.questions.length === 0) {
    errors.push(`${page.path}: generator returned zero questions`);
    continue;
  }

  for (const question of exerciseSet.questions) {
    const type = question.type || "choice";
    if (!["choice", "input", "order", "multiSelect"].includes(type)) {
      errors.push(`${page.path}: ${question.id ?? "question"} has unsupported type ${type}`);
      continue;
    }
    if (question.answer === undefined || question.answer === null || String(question.answer).trim() === "") {
      errors.push(`${page.path}: ${question.id ?? "question"} has no answer`);
    }
    if (type === "input") continue;

    if (!Array.isArray(question.choices) || question.choices.length === 0) {
      errors.push(`${page.path}: ${question.id ?? "question"} has no choices`);
      continue;
    }
    const choiceValues = question.choices.map((choice) => choice.value);
    if (type === "multiSelect" || type === "order") {
      const answerParts = String(question.answer).split("|").filter(Boolean);
      for (const answerPart of answerParts) {
        if (!choiceValues.some((value) => valuesEqual(value, answerPart))) {
          errors.push(`${page.path}: ${question.id ?? "question"} answer part is not present in choices`);
        }
      }
    } else if (!choiceValues.some((value) => valuesEqual(value, question.answer))) {
      errors.push(`${page.path}: ${question.id ?? "question"} answer is not present in choices`);
    }
    if (new Set(choiceValues.map(String)).size !== choiceValues.length) {
      errors.push(`${page.path}: ${question.id ?? "question"} has duplicate choice values`);
    }
  }
}

if (genericRoutes.length > 0) {
  errors.push(`Unreviewed generic fallback routes: ${genericRoutes.length}\n${genericRoutes.slice(0, 50).join("\n")}`);
}

const sortedModes = [...modeCounts.entries()].sort((a, b) => b[1] - a[1]);

console.log(`Exercise coverage report`);
console.log(`- Total subject leaf routes: ${pages.length}`);
console.log(`- Classified routes: ${pages.length - genericRoutes.length}`);
console.log(`- Unreviewed generic fallback routes: ${genericRoutes.length}`);
console.log(`- Exercise variations: ${sortedModes.length}`);
for (const [mode, count] of sortedModes) {
  console.log(`  - ${mode}: ${count}`);
  for (const sample of modeSamples.get(mode) ?? []) {
    console.log(`    sample: ${sample}`);
  }
}

if (errors.length > 0) {
  console.error(`\nExercise validation failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 100)) {
    console.error(`- ${error}`);
  }
  if (errors.length > 100) console.error(`...and ${errors.length - 100} more`);
  process.exit(1);
}

console.log("Exercise validation passed.");
