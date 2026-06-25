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
    // This runs BEFORE the main JS bundle (which has defer) so Expo Router
    // sees a clean root pathname (/) instead of /rout-sheregesh-altai/
    const spaScript = `<script>
(function() {
  var base = '/rout-sheregesh-altai';
  var saved = sessionStorage.getItem('spa:path');
  if (saved) sessionStorage.removeItem('spa:path');

  // Strip baseUrl so Expo Router sees clean routes.
  // If we were redirected from 404.html, use the saved path instead.
  var path = saved || window.location.pathname;
  if (path.startsWith(base)) {
    path = path.substring(base.length) || '/';
  }

  history.replaceState(null, '', path + window.location.search + window.location.hash);
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

// Walk all files and fix paths
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (/\.html?$/i.test(entry.name)) {
      processFile(fullPath);
      console.log('✓ ' + path.relative(DIST, fullPath));
    } else if (/\.js$/i.test(entry.name)) {
      fixJsAssetPaths(fullPath);
    }
  }
}

function fixJsAssetPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix asset paths in JS bundle:
  // Replace "assets/... → "rout-sheregesh-altai/assets/...
  // Only match absolute paths starting with "/assets/ (not ./assets/)
  // Use lookbehind to ensure it's preceded by a quote with no dot before it
  content = content.replace(
    /(["'])\/assets\//g,
    '$1' + PREFIX + '/assets/'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ ' + path.relative(DIST, filePath) + ' (paths fixed)');
  }
}

walk(DIST);

// Verify the result
const indexContent = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const hasPrefix = indexContent.includes(PREFIX + '/favicon.ico');
const hasSpaScript = indexContent.includes('spa:path');

// Also verify JS bundle
const jsFiles = fs.readdirSync(path.join(DIST, '_expo', 'static', 'js', 'web'), { recursive: true })
  .filter(f => f.endsWith('.js'))
  .map(f => path.join(DIST, '_expo', 'static', 'js', 'web', f))
  .filter(fs.existsSync.bind(fs));

let jsOk = true;
for (const jsFile of jsFiles) {
  const jsContent = fs.readFileSync(jsFile, 'utf8');
  // Check that assets paths are prefixed (sample check)
  if (jsContent.includes('"/assets/node_modules')) {
    jsOk = false;
    console.error('✗ JS bundle still has unprefixed paths: ' + path.relative(DIST, jsFile));
  }
}

if (hasPrefix && hasSpaScript && jsOk) {
  console.log('✓ All paths prefixed, SPA script injected, JS assets fixed');
} else {
  console.error('✗ Verification failed!');
  if (!hasPrefix) console.error('  - index.html missing path prefix');
  if (!hasSpaScript) console.error('  - index.html missing SPA script');
  if (!jsOk) console.error('  - JS bundle has unprefixed asset paths');
  process.exit(1);
}
