/**
 * Post-processes Expo web export for GitHub Pages deployment.
 *
 * Steps:
 * 1. Adds .nojekyll file
 * 2. Creates 404.html for SPA routing
 * 3. Injects path-restoration script into index.html
 * 4. Prefixes all absolute paths with /rout-sheregesh-altai/
 */

const fs = require('fs');
const path = require('path');

const PREFIX = '/rout-sheregesh-altai';
const DIST = path.join(__dirname, '..', 'dist');

// 1. .nojekyll
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
console.log('✓ .nojekyll');

// 2. 404.html
const notFoundHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    sessionStorage.setItem('spa:path', window.location.pathname.replace(/^\\/[^/]+/, '') + window.location.search + window.location.hash);
    window.location.replace('/rout-sheregesh-altai/');
  </script>
</head>
<body></body>
</html>`;
fs.writeFileSync(path.join(DIST, '404.html'), notFoundHtml);
console.log('✓ 404.html');

// 3. Inject SPA path restoration + fix absolute paths in HTML files
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.html' || ext === '.htm') {
    // Inject SPA path restoration script before </head>
    const spaScript = `<script>
(function() {
  var saved = sessionStorage.getItem('spa:path');
  if (saved && saved !== '/') {
    sessionStorage.removeItem('spa:path');
    var base = '/rout-sheregesh-altai';
    history.replaceState(null, '', base + saved);
  }
})();
</script>`;
    if (!content.includes('spa:path')) {
      content = content.replace('</head>', spaScript + '</head>');
    }

    // Fix absolute paths in href, src, action (regex uses negative lookahead
    // to avoid double-prefixing already-prefixed paths)
    content = content.replace(
      /(href|src|action)=(["'])\/(?!rout-sheregesh-altai)/g,
      '$1=$2' + PREFIX + '/'
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  return content;
}

// Only index.html needs processing in our case, but walk all HTML just in case
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (/\.html?$/i.test(entry.name)) {
      processFile(fullPath);
      console.log('✓ ' + path.relative(DIST, fullPath));
    }
  }
}

walk(DIST);

// Verify the result
const indexContent = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const hasPrefix = indexContent.includes(PREFIX + '/favicon.ico');
const hasSpaScript = indexContent.includes('spa:path');

if (hasPrefix && hasSpaScript) {
  console.log('✓ All paths prefixed and SPA script injected');
} else {
  console.error('✗ Verification failed!');
  console.error('  hasPrefix:', hasPrefix);
  console.error('  hasSpaScript:', hasSpaScript);
  process.exit(1);
}
