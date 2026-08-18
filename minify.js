const fs = require('fs');
const path = require('path');

function minifyJS(code) {
  let inString = null; 
  let inComment = null; 
  let inRegex = false;
  let esc = false;
  let out = "";

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const next = code[i + 1] || "";

    if (inComment) {
      if (inComment === '//' && (char === '\n' || char === '\r')) {
        inComment = null;
        out += char;
      } else if (inComment === '/*' && char === '*' && next === '/') {
        inComment = null;
        i++; 
      }
      continue;
    }

    if (inString) {
      out += char;
      if (char === '\\') {
        esc = !esc;
      } else {
        if (char === inString && !esc) {
          inString = null;
        }
        esc = false;
      }
      continue;
    }

    if (char === '/' && next === '/' && !inRegex) {
      inComment = '//';
      i++;
      continue;
    }
    if (char === '/' && next === '*' && !inRegex) {
      inComment = '/*';
      i++;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      out += char;
      esc = false;
      continue;
    }

    out += char;
  }

  return out
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function runMinify() {
  try {
    const publicDir = path.join(__dirname, 'public');

    const css = fs.readFileSync(path.join(publicDir, 'style.css'), 'utf8');
    const minifiedCSS = minifyCSS(css);
    fs.writeFileSync(path.join(publicDir, 'style.min.css'), minifiedCSS, 'utf8');

    const js = fs.readFileSync(path.join(publicDir, 'main.js'), 'utf8');
    const minifiedJS = minifyJS(js);
    fs.writeFileSync(path.join(publicDir, 'main.min.js'), minifiedJS, 'utf8');

    return {
      cssOriginal: css.length,
      cssMinified: minifiedCSS.length,
      jsOriginal: js.length,
      jsMinified: minifiedJS.length
    };
  } catch (err) {
    throw err;
  }
}

module.exports = { runMinify };

if (require.main === module) {
  console.log('Running minification...');
  try {
    const res = runMinify();
    console.log(`style.css minified. Size reduced from ${res.cssOriginal} to ${res.cssMinified} bytes.`);
    console.log(`main.js minified. Size reduced from ${res.jsOriginal} to ${res.jsMinified} bytes.`);
    console.log('Minification complete!');
  } catch (err) {
    console.error('Error during minification:', err);
    process.exit(1);
  }
}
