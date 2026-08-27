const fs = require('fs');

const cssPath = 'public/style.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(
    /\.btn-gamer-primary\s*{[^}]*}/,
    `.btn-gamer-primary {
  background: linear-gradient(160deg, #eab308 0%, #d97706 100%);
  color: #111827;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: var(--radius-md);
  border: none;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
  text-shadow: none;
}`
);

css = css.replace(
    /\.btn-gamer-success\s*{[^}]*}/,
    `.btn-gamer-success {
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}`
);

// also let's check hover states if any
css = css.replace(
    /\.btn-gamer-primary:hover\s*{[^}]*}/,
    `.btn-gamer-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(217, 119, 6, 0.4);
}`
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Colors adjusted.');
