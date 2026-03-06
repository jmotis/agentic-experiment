#!/usr/bin/env node
/**
 * Extracts passage IDs and user-facing text from decoded passage files.
 * Strips SugarCube macros, HTML tags, comments, and code to leave only
 * the narrative text a player would see.
 *
 * Usage: node extract-passage-text.js
 * Output: passage-data.md
 */

const fs = require('fs');
const path = require('path');

const index = JSON.parse(fs.readFileSync('passage-index.json', 'utf8'));

// Passages that are purely programmatic / never shown to the player directly
const SYSTEM_PASSAGE_NAMES = new Set([
  'StoryInit', 'PassageHeader', 'StoryCaption', 'StoryInterface',
  'storyLogo', 'gameTitle', 'storyAuthor', 'storyMenu',
  '$args[0', 'empty'
]);

function stripUserFacingText(raw) {
  let text = raw;

  // Remove SugarCube block comments  /* ... */
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove <<nobr>> / <</nobr>>
  text = text.replace(/<<\/?nobr>>/g, '');

  // Remove <<gate ...>> / <</gate>>
  text = text.replace(/<<gate\b[^>]*>>/g, '');
  text = text.replace(/<<\/gate>>/g, '');

  // Remove <<set ...>> (single-line macro calls)
  text = text.replace(/<<set\b[^>]*>>/g, '');

  // Remove <<run ...>>
  text = text.replace(/<<run\b[^>]*>>/g, '');

  // Remove <<print ...>>  but try to keep what it prints if simple
  text = text.replace(/<<print\b[^>]*>>/g, '');

  // Remove <<unset ...>>
  text = text.replace(/<<unset\b[^>]*>>/g, '');

  // Remove <<include ...>>
  text = text.replace(/<<include\b[^>]*>>/g, '');

  // Remove <<widget ...>> / <</widget>>
  text = text.replace(/<<\/?widget\b[^>]*>>/g, '');

  // Remove <<replace ...>> / <</replace>>
  text = text.replace(/<<\/?replace\b[^>]*>>/g, '');

  // Remove <<append ...>> / <</append>>
  text = text.replace(/<<\/?append\b[^>]*>>/g, '');

  // Remove <<prepend ...>> / <</prepend>>
  text = text.replace(/<<\/?prepend\b[^>]*>>/g, '');

  // Remove <<timed ...>> / <</timed>>
  text = text.replace(/<<\/?timed\b[^>]*>>/g, '');

  // Remove <<listbox ...>> / <</listbox>>
  text = text.replace(/<<\/?listbox\b[^>]*>>/g, '');

  // Remove <<optionsfrom ...>>
  text = text.replace(/<<optionsfrom\b[^>]*>>/g, '');

  // Remove <<checkbox ...>>
  text = text.replace(/<<checkbox\b[^>]*>>/g, '');

  // Remove <<radiobutton ...>>
  text = text.replace(/<<radiobutton\b[^>]*>>/g, '');

  // Remove <<textbox ...>>
  text = text.replace(/<<textbox\b[^>]*>>/g, '');

  // Remove <<textarea ...>>
  text = text.replace(/<<\/?textarea\b[^>]*>>/g, '');

  // Remove <<button ...>> / <</button>>
  text = text.replace(/<<\/?button\b[^>]*>>/g, '');

  // Remove <<script>> / <</script>> blocks entirely
  text = text.replace(/<<script>>[\s\S]*?<<\/script>>/g, '');

  // Remove <<silently>> / <</silently>> blocks entirely
  text = text.replace(/<<silently>>[\s\S]*?<<\/silently>>/g, '');

  // Convert <<link "text">> ... <</link>> — extract link display text
  text = text.replace(/<<link\s+"([^"]*)"[^>]*>>/g, '$1 ');
  text = text.replace(/<<link\s+'([^']*)'[^>]*>>/g, '$1 ');
  text = text.replace(/<<\/?link>>/g, '');

  // Convert [[display text->target]] and [[display text|target]] to just display text
  text = text.replace(/\[\[([^\]|>]+)->[^\]]*\]\]/g, '[$1]');
  text = text.replace(/\[\[([^\]|>]+)\|[^\]]*\]\]/g, '[$1]');
  // Plain [[text]] links
  text = text.replace(/\[\[([^\]]*)\]\]/g, '[$1]');

  // Remove <<if ...>>, <<elseif ...>>, <<else>>, <</if>>
  text = text.replace(/<<\/?if\b[^>]*>>/g, '');
  text = text.replace(/<<elseif\b[^>]*>>/g, '');
  text = text.replace(/<<else>>/g, '');

  // Remove <<for ...>> / <</for>>
  text = text.replace(/<<\/?for\b[^>]*>>/g, '');

  // Remove <<switch ...>> / <<case ...>> / <</switch>>
  text = text.replace(/<<\/?switch\b[^>]*>>/g, '');
  text = text.replace(/<<case\b[^>]*>>/g, '');
  text = text.replace(/<<default>>/g, '');

  // Remove any remaining custom widget calls <<widget-name>> or <<widget-name args>>
  // These are invocations like <<december-1664-helper>>, <<defPlague "plague">>
  // For definition macros <<defXxx "display text">>, extract the display text
  text = text.replace(/<<def\w+\s+"([^"]*)"[^>]*>>/g, '$1');
  text = text.replace(/<<def\w+\s+'([^']*)'[^>]*>>/g, '$1');

  // Remove any remaining << ... >> macros
  text = text.replace(/<<[^>]*>>/g, '');

  // Convert <br> / <br/> to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Convert </li> and </ul> and </ol> to newlines
  text = text.replace(/<\/li>/gi, '');
  text = text.replace(/<\/?[uo]l>/gi, '\n');

  // Convert <li> to bullet
  text = text.replace(/<li>/gi, '- ');

  // Remove <img ...> tags but note them
  text = text.replace(/<img\b[^>]*>/gi, '[image]');

  // Remove <span> tags (keep content)
  text = text.replace(/<\/?span[^>]*>/gi, '');

  // Remove other HTML tags but keep content
  text = text.replace(/<\/?[a-z][a-z0-9]*[^>]*>/gi, '');

  // Remove SugarCube italic markers //text// -> text
  text = text.replace(/\/\/([^/]+)\/\//g, '$1');

  // Remove SugarCube bold markers ''text'' -> text
  text = text.replace(/''([^']+)''/g, '$1');

  // Remove variable display references like $variable or _variable in isolation
  // (keep them if embedded in narrative text since they represent dynamic values)
  // Actually, keep $-prefixed words as [variable] placeholders
  text = text.replace(/\$(\w+(?:\.\w+)*(?:\[\w+\])*)/g, '[$1]');
  text = text.replace(/\b_(\w+)\b/g, '[$1]');

  // Clean up extra whitespace
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n[ \t]+/g, '\n');
  text = text.replace(/[ \t]+\n/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

// Build the markdown output
const lines = [];
lines.push('# Passage Data: Gaming the Great Plague');
lines.push('');
lines.push('This file contains the passage ID, name, tags, and extracted user-facing text for each passage in the game.');
lines.push('');
lines.push('> **Note:** User-facing text has been extracted by stripping SugarCube macros, HTML tags, and code logic.');
lines.push('> Dynamic content (variables, conditional branches) may result in multiple text variants shown together.');
lines.push('> Widget and system passages are included but marked as such.');
lines.push('');
lines.push('---');
lines.push('');

for (const entry of index) {
  const { pid, name, tags, filename, size } = entry;
  const isWidget = tags.includes('widget');
  const isSystem = SYSTEM_PASSAGE_NAMES.has(name);

  lines.push(`## Passage ${pid}: ${name}`);
  lines.push('');
  if (tags) {
    lines.push(`**Tags:** ${tags}`);
    lines.push('');
  }
  if (isWidget) {
    lines.push('*This is a widget passage (code/logic only — not directly displayed to players).*');
    lines.push('');
  }
  if (isSystem) {
    lines.push('*This is a system passage (engine infrastructure — not narrative content).*');
    lines.push('');
  }

  // Read passage file
  const filePath = path.join('passages', filename);
  if (!fs.existsSync(filePath)) {
    lines.push('*(passage file not found)*');
    lines.push('');
    lines.push('---');
    lines.push('');
    continue;
  }

  const raw = fs.readFileSync(filePath, 'utf8');

  if (size === 0 || raw.trim() === '') {
    lines.push('*(empty passage)*');
    lines.push('');
    lines.push('---');
    lines.push('');
    continue;
  }

  const userText = stripUserFacingText(raw);

  if (userText.length === 0) {
    lines.push('*(no user-facing text — code/logic only)*');
  } else {
    lines.push('```');
    lines.push(userText);
    lines.push('```');
  }

  lines.push('');
  lines.push('---');
  lines.push('');
}

const output = lines.join('\n');
fs.writeFileSync('passage-data.md', output, 'utf8');
console.log(`Wrote passage-data.md (${(output.length / 1024).toFixed(1)} KB, ${index.length} passages)`);
