const fs = require("fs");
const path = require("path");

const arPath = path.join(__dirname, "..", "src", "messages", "ar.json");
const enPath = path.join(__dirname, "..", "src", "messages", "en.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function flattenKeys(obj, prefix = "", out = new Set()) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    out.add(prefix);
    return out;
  }

  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    flattenKeys(value, next, out);
  }
  return out;
}

function walkValues(obj, prefix = "", out = []) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    out.push({ key: prefix, value: obj });
    return out;
  }

  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    walkValues(value, next, out);
  }
  return out;
}

function diffKeys(baseSet, compareSet) {
  const missing = [];
  for (const key of baseSet) {
    if (!compareSet.has(key)) {
      missing.push(key);
    }
  }
  return missing;
}

function isCorruptedArabicString(value) {
  if (typeof value !== "string") return false;
  if (value.includes("???")) return true;
  return /\?{2,}/.test(value);
}

const ar = readJson(arPath);
const en = readJson(enPath);

const arKeys = flattenKeys(ar);
const enKeys = flattenKeys(en);

const missingInAr = diffKeys(enKeys, arKeys);
const missingInEn = diffKeys(arKeys, enKeys);
const corruptedArEntries = walkValues(ar).filter((entry) =>
  isCorruptedArabicString(entry.value)
);

const errors = [];
if (missingInAr.length) {
  errors.push(
    `Missing keys in ar.json (${missingInAr.length}):\n- ${missingInAr.join("\n- ")}`
  );
}
if (missingInEn.length) {
  errors.push(
    `Missing keys in en.json (${missingInEn.length}):\n- ${missingInEn.join("\n- ")}`
  );
}
if (corruptedArEntries.length) {
  errors.push(
    `Corrupted Arabic values detected (${corruptedArEntries.length}):\n- ${corruptedArEntries
      .map((entry) => `${entry.key}: ${entry.value}`)
      .join("\n- ")}`
  );
}

if (errors.length) {
  console.error("i18n validation failed:\n");
  console.error(errors.join("\n\n"));
  process.exit(1);
}

console.log("i18n validation passed.");
