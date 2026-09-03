const fs = require('fs');

let css = fs.readFileSync('public/style.css', 'utf8');

css = css.replace(/\/\*[\s\S]*?\*\//g, '');

css = css.replace(/!important/g, '');

let lines = css.split('\n');
let newLines = [];
for (let line of lines) {
  if (line.includes('@media') && line.includes('max-width')) {
    newLines.push(line);
  } else if (line.includes('max-width')) {
    let modifiedLine = line.replace(/max-width\s*:\s*[^;}]+;?/g, '');
    newLines.push(modifiedLine);
  } else {
    newLines.push(line);
  }
}

fs.writeFileSync('public/style.css', newLines.join('\n'));
console.log('CSS modified successfully');
