#!/usr/bin/env node
/**
 * Strip Prisma CLI banners accidentally captured in migration.sql files.
 * Node.js port — Railway/Nixpacks images have Node but not always Python.
 */
const fs = require('fs');
const path = require('path');

const BOX_CHAR_RE = /[┌┐└┘│─╔╗╚╝║═▲▼◀▶]/;
const PRISMA_BANNER_RE = /^\s*(Update available|Run the following to update|This is a major update)/i;

function sanitizeContent(text) {
  const lines = text.split(/\r?\n/);
  const cleaned = [];
  let changed = false;

  for (const line of lines) {
    if (
      BOX_CHAR_RE.test(line) ||
      PRISMA_BANNER_RE.test(line) ||
      line.includes('pris.ly/d/major-version-upgrade') ||
      /npm i --save-dev prisma@latest/.test(line) ||
      /npm i @prisma\/client@latest/.test(line)
    ) {
      changed = true;
      break;
    }
    cleaned.push(line);
  }

  const result = `${cleaned.join('\n').replace(/\s+$/, '')}\n`;
  return { result, changed: changed || result !== text };
}

function walkSqlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSqlFiles(full, out);
    else if (entry.name === 'migration.sql') out.push(full);
  }
  return out.sort();
}

function sanitizeFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const { result, changed } = sanitizeContent(original);
  if (changed) fs.writeFileSync(filePath, result, 'utf8');
  return changed;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: sanitize-prisma-migrations.js <migrations-dir> [more-dirs...]');
    process.exit(1);
  }

  let total = 0;
  for (const arg of args) {
    const root = path.resolve(arg);
    if (!fs.existsSync(root)) {
      console.warn(`WARN: missing path ${root}`);
      continue;
    }
    for (const sql of walkSqlFiles(root)) {
      if (sanitizeFile(sql)) {
        total += 1;
        console.log(`Cleaned: ${sql}`);
      }
    }
  }

  console.log(`Done. ${total} migration file(s) sanitized.`);
}

main();
