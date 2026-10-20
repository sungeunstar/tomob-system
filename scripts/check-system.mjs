#!/usr/bin/env node
// Structural validation only; this does not run agents or approve product decisions.
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, resolve, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const expected = new Set(
  ["prototyper", "builder", "sweeper", "grower", "maintainer", "arc"].map(
    (x) => "tomob-" + x,
  ),
);
const agentDir = resolve(root, ".claude/agents");
const names = new Set();
const files = await readdir(agentDir);
for (const file of files.filter((x) => x.endsWith(".md"))) {
  const source = await readFile(resolve(agentDir, file), "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
  if (!match) {
    errors.push(file + ": missing frontmatter/body");
    continue;
  }
  const fields = Object.fromEntries(
    match[1].split(/\r?\n/).map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
  );
  if (!/^[a-z][a-z0-9-]+$/.test(fields.name || ""))
    errors.push(file + ": invalid name");
  if (names.has(fields.name)) errors.push(file + ": duplicate name");
  names.add(fields.name);
  if (!fields.description) errors.push(file + ": missing description");
  if (fields.model !== "inherit")
    errors.push(file + ": unexpected model override");
  if (fields.name === "tomob-arc" && fields.tools !== "Read, Grep, Glob")
    errors.push(file + ": Arc must remain read-only");
  if (!match[2].includes("system_root/TOMOB_SYSTEM.md"))
    errors.push(file + ": missing operating contract");
  if (!match[2].includes("system_root/templates/HANDOFF.md"))
    errors.push(file + ": missing handoff reference");
}
for (const name of expected)
  if (!names.has(name)) errors.push("Missing agent: " + name);
for (const name of names)
  if (!expected.has(name)) errors.push("Unexpected agent: " + name);
async function walk(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if ([".git", "archive", "node_modules"].includes(entry.name)) continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(path)));
    else found.push(path);
  }
  return found;
}
const paths = await walk(root);
let links = 0;
const html = await readFile(resolve(root, "index.html"), "utf8");
const idList = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
const ids = new Set(idList);
if (ids.size !== idList.length) errors.push("Duplicate HTML IDs");
for (const path of paths.filter((x) => [".md", ".html"].includes(extname(x)))) {
  const text = await readFile(path, "utf8");
  const refs =
    extname(path) === ".html"
      ? [...text.matchAll(/\bhref="([^"]+)"/g)].map((m) => m[1])
      : [...text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(ref)) continue;
    links++;
    if (ref.startsWith("#")) {
      if (path === resolve(root, "index.html") && !ids.has(ref.slice(1)))
        errors.push("Missing anchor " + ref);
      continue;
    }
    const local = decodeURIComponent(ref.split("#")[0]);
    const target = resolve(dirname(path), local);
    if (relative(root, target).startsWith("..")) {
      errors.push("Outside repository: " + ref);
      continue;
    }
    try {
      await stat(target);
    } catch {
      errors.push(relative(root, path) + ": missing " + ref);
    }
  }
}
for (const path of [
  "AGENTS.md",
  "CLAUDE.md",
  "TOMOB_SYSTEM.md",
  "README.md",
  "docs/EXPERIENCE.md",
  "docs/DECISIONS.md",
  "docs/ROLES.md",
  "docs/MIGRATION.md",
  "docs/VALIDATION.md",
  "templates/PRODUCT.md",
  "templates/REVIEW.md",
  "templates/HANDOFF.md",
  "archive/v7.html",
]) {
  try {
    await stat(resolve(root, path));
  } catch {
    errors.push("Missing required file: " + path);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "PASS: " +
      names.size +
      " role definitions, " +
      links +
      " local links, unique page anchors and required documents. No agent/model execution performed.",
  );
