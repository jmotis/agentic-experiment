#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const htmlPath = path.resolve(__dirname, "GamingtheGreatPlague.html");
const outPath = path.resolve(__dirname, "passages.json");

const html = fs.readFileSync(htmlPath, "utf-8");

// Match every <tw-passagedata ...>...</tw-passagedata> element.
// The inner content can span many lines, so we use [\s\S]*? (non-greedy).
const re = /<tw-passagedata\s+([^>]*)>([\s\S]*?)<\/tw-passagedata>/g;

const passages = [];
let m;
while ((m = re.exec(html)) !== null) {
  const attrString = m[1];
  const content = m[2]; // exact verbatim inner text

  // Parse individual attributes from the opening tag.
  const attr = {};
  const attrRe = /(\w[\w-]*)="([^"]*)"/g;
  let a;
  while ((a = attrRe.exec(attrString)) !== null) {
    attr[a[1]] = a[2];
  }

  passages.push({
    pid: attr.pid,
    name: attr.name,
    tags: attr.tags || "",
    position: attr.position || "",
    size: attr.size || "",
    content: content,
  });
}

fs.writeFileSync(outPath, JSON.stringify(passages, null, 2), "utf-8");
console.log(`Extracted ${passages.length} passages to ${outPath}`);
