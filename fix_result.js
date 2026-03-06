import fs from 'fs';
const file = '/Users/madhunepal/Documents/Codes/ElectionNepal/nepal-election-dashboard/src/pages/result.astro';
let content = fs.readFileSync(file, 'utf8');

// The issue is `${candidates.map((c, i) => { ... }).join('')}` inside the <script> block.
// Astro tries to evaluate ${...} server-side inside <script> blocks!
// We must escape them as \${...} or separate the strings.

content = content.replace(
  "${candidates.map((c, i) => {",
  "\\${candidates.map((c, i) => {"
);

// We should just use a normal string concatenation or be careful.
// Let's replace the whole renderCandidatesList function to not use ${} that Astro might misinterpret.
// Actually, Astro only parses ${} if it's not a `is:inline` script, but it is a regular script so we can just add `is:inline`.

content = content.replace("<script>", "<script is:inline>");

fs.writeFileSync(file, content);
console.log('Fixed file');
