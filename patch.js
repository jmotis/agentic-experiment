#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const htmlPath = path.resolve(__dirname, "GamingtheGreatPlague.html");
const jsonPath = path.resolve(__dirname, "passages.json");
const outPath = htmlPath; // overwrite in place

const html = fs.readFileSync(htmlPath, "utf-8");
const passages = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

// Build a map of pid -> new content from the JSON file.
const contentByPid = new Map();
for (const p of passages) {
  contentByPid.set(p.pid, p.content);
}

// For each <tw-passagedata pid="X" ...>...</tw-passagedata>, replace the inner
// text if the pid is present in the JSON.  Attributes and surrounding HTML are
// left completely untouched — we only swap the captured group for the content.
const re = /(<tw-passagedata\s+pid="(\d+)"[^>]*>)([\s\S]*?)(<\/tw-passagedata>)/g;

const result = html.replace(re, (match, openTag, pid, _oldContent, closeTag) => {
  if (contentByPid.has(pid)) {
    return openTag + contentByPid.get(pid) + closeTag;
  }
  return match; // unchanged
});

fs.writeFileSync(outPath, result, "utf-8");
console.log(`Patched ${contentByPid.size} passages back into ${outPath}`);
