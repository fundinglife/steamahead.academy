import { mkdir, writeFile } from "node:fs/promises";

const base = "https://www.ixl.com";
const seeds = [
  "/",
  "/math",
  "/ela",
  "/science",
  "/social-studies",
  "/spanish",
  "/recommendations",
  "/skill-plans",
  "/awards",
  "/diagnostic",
  "/analytics",
  "/takeoff",
  "/inspiration",
  "/membership",
  "/signin",
  "/company",
  "/careers",
  "/help-center",
  "/userguides",
  "/feedback",
  "/testimonials",
  "/contact",
  "/termsofservice",
  "/privacypolicy",
  "/math/pre-k",
  "/math/kindergarten",
  "/math/grade-1",
  "/math/grade-2",
  "/math/grade-3",
  "/math/grade-4",
  "/math/grade-5",
  "/math/grade-6",
  "/math/grade-7",
  "/math/grade-8",
  "/math/algebra-1",
  "/math/geometry",
  "/math/algebra-2",
  "/math/precalculus",
  "/math/calculus"
];

const userAgent = "Mozilla/5.0 (compatible; SteamAheadRouteMapper/1.0; +https://github.com/fundinglife/steamahead.academy)";

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html) {
  return decodeEntities(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

function sameSitePath(href) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return undefined;
  try {
    const url = new URL(href, base);
    if (url.hostname !== "www.ixl.com") return undefined;
    if (/\.(png|jpg|jpeg|svg|webp|gif|css|js|ico|pdf|zip)$/i.test(url.pathname)) return undefined;
    return url.pathname.replace(/\/$/, "") || "/";
  } catch {
    return undefined;
  }
}

function extractLinks(html) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const path = sameSitePath(match[1]);
    if (!path) continue;
    const label = stripTags(match[2]);
    if (!label) continue;
    links.push({ label, path });
  }
  return links;
}

function extractTitle(html, fallback) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return stripTags(title[1]).replace(/\s*\|\s*IXL.*$/i, "");
  return fallback;
}

function classify(path) {
  if (path.startsWith("/math/")) return "Math pathway";
  if (path === "/math" || path === "/ela" || path === "/science" || path === "/social-studies" || path === "/spanish") return "Subject";
  if (path === "/" || path === "/learning" || path === "/assessment" || path === "/analytics" || path === "/takeoff" || path === "/inspiration") return "Core";
  if (path.includes("policy") || path.includes("terms")) return "Legal";
  if (path.includes("help") || path.includes("guide") || path.includes("feedback") || path.includes("contact")) return "Support";
  return "Public page";
}

function extractMathIndex(html) {
  const text = stripTags(html);
  const pattern = /(Pre-K|Kindergarten|First grade|Second grade|Third grade|Fourth grade|Fifth grade|Sixth grade|Seventh grade|Eighth grade|Algebra 1|Geometry|Algebra 2|Precalculus|Calculus|Integrated 1|Integrated 2|Integrated 3)\s+See all\s+(\d+)\s+skills/gi;
  const sections = [];
  for (const match of text.matchAll(pattern)) {
    sections.push({ title: match[1], sourceSkillCount: Number(match[2]) });
  }
  return sections;
}

function extractSkillSections(html, currentPath) {
  const sections = [];
  const categoryPattern = /<div[^>]*class=["'][^"']*(?:skill-tree-category|skill-tree-supercategory-category)[^"']*["'][^>]*>([\s\S]*?)(?=<div[^>]*class=["'][^"']*(?:skill-tree-category|skill-tree-supercategory-category)[^"']*["'][^>]*>|<\/section>)/gi;
  for (const categoryMatch of html.matchAll(categoryPattern)) {
    const block = categoryMatch[1];
    const heading = block.match(/<h2[^>]*class=["'][^"']*category-code-and-name[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i);
    const simpleHeading = block.match(/<h2[^>]*class=["'][^"']*skill-tree-skills-header[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i);
    if (!heading && !simpleHeading) continue;
    const code = heading ? stripTags(heading[1].match(/<span[^>]*class=["'][^"']*category-code[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "") : "";
    const title = heading
      ? stripTags(heading[1].match(/<span[^>]*class=["'][^"']*category-name[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "")
      : stripTags(simpleHeading[1]);
    const skills = [];
    const skillPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*class=["'][^"']*skill-tree-skill-link[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    for (const skillMatch of block.matchAll(skillPattern)) {
      const path = sameSitePath(skillMatch[1]);
      if (!path || !path.startsWith(`${currentPath}/`)) continue;
      const label = stripTags(skillMatch[2]);
      if (!label) continue;
      skills.push({ label, path });
    }
    if (title || skills.length) sections.push({ code, title, skills });
  }
  return sections;
}

async function fetchPage(path) {
  const response = await fetch(`${base}${path}`, { headers: { "user-agent": userAgent } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

const queue = [...seeds];
const seen = new Set();
const pages = [];
const maxPages = Number(process.env.IXL_DISCOVERY_LIMIT || 250);

while (queue.length && pages.length < maxPages) {
  const path = queue.shift();
  if (!path || seen.has(path)) continue;
  seen.add(path);
  try {
    const html = await fetchPage(path);
    const links = extractLinks(html);
    const title = extractTitle(html, path);
    const page = {
      path,
      localPath: path === "/" ? "/" : path,
      title,
      navGroup: classify(path),
      sourceUrl: `${base}${path}`,
      links,
      mathSections: path === "/math" ? extractMathIndex(html) : [],
      skillSections: extractSkillSections(html, path)
    };
    pages.push(page);
    for (const link of links) {
      if (pages.length + queue.length >= maxPages) break;
      if (!seen.has(link.path) && /^\/(math|ela|science|social-studies|spanish|recommendations|skill-plans|awards|diagnostic|analytics|takeoff|inspiration|membership|signin|company|careers|help-center|userguides|feedback|testimonials|contact|termsofservice|privacypolicy)(\/|$)/.test(link.path)) {
        queue.push(link.path);
      }
    }
  } catch (error) {
    pages.push({
      path,
      localPath: path,
      title: path,
      navGroup: classify(path),
      sourceUrl: `${base}${path}`,
      error: error.message,
      links: [],
      mathSections: []
    });
  }
}

await mkdir("src/data/generated", { recursive: true });
await writeFile("src/data/generated/ixlPublicPages.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), pages }, null, 2)}\n`);
console.log(`Discovered ${pages.length} public page records.`);
