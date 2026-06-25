/**
 * Post-processes Expo web export for GitHub Pages deployment.
 *
 * Steps:
 * 1. Adds .nojekyll file
 * 2. Creates 404.html for SPA routing
 * 3. Injects path-restoration script into index.html
 * 4. Prefixes all absolute paths with /rout-sheregesh-altai/
 * 5. Adds font preload links + @font-face for iOS Safari
 * 6. Adds preconnect for external image CDNs
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

// 3. Inject SPA path restoration + external resources + fix paths
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.html' || ext === '.htm') {
    // SPA path restoration script (before </head>)
    const spaScript = `<script>
(function() {
  var base = '/rout-sheregesh-altai';
  var saved = sessionStorage.getItem('spa:path');
  if (saved) sessionStorage.removeItem('spa:path');
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

    // Preload fonts + preconnect for external CDNs (before </head>)
    // This ensures iOS Safari starts font downloads early (before JS runs)
    const preconnectHints = generatePreloads();
    if (!content.includes('expo-font-preloads')) {
      content = content.replace('</head>', preconnectHints + '</head>');
    }

    // Fix absolute paths in href, src, action
    content = content.replace(
      /(href|src|action)=(["'])\/(?!rout-sheregesh-altai)/g,
      '$1=$2' + PREFIX + '/'
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  return content;
}

function generatePreloads() {
  const fontDir = path.join(DIST, 'assets', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');

  // Only preload the fonts we actually use (Ionicons is the only one imported in source)
  const fontsToPreload = ['Ionicons'];

  const preloadLinks = [];
  const fontFaceRules = [];

  if (fs.existsSync(fontDir)) {
    const files = fs.readdirSync(fontDir);
    for (const file of files) {
      const match = fontsToPreload.find(fontName => file.startsWith(fontName));
      if (match) {
        const url = `${PREFIX}/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/${encodeURIComponent(file)}`;
        preloadLinks.push(
          `<link rel="preload" href="${url}" as="font" type="font/ttf" crossorigin>`
        );
        fontFaceRules.push(
          `@font-face{font-family:"${match}";src:url(${JSON.stringify(url)});font-display:swap}`
        );
      }
    }
  }

  // Add preconnect for external image sources
  const preconnects = [
    `<link rel="preconnect" href="https://images.unsplash.com">`,
  ];

  // Only inject style if we found fonts
  const styleBlock = fontFaceRules.length > 0
    ? `<style id="expo-font-preloads">${fontFaceRules.join('')}</style>`
    : '';

  return '\n' + [...preconnects, ...preloadLinks, styleBlock].filter(Boolean).join('\n') + '\n';
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

  // Fix asset paths in JS bundle
  content = content.replace(
    /(["'])\/assets\//g,
    '$1' + PREFIX + '/assets/'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ ' + path.relative(DIST, filePath) + ' (paths fixed)');
  }
}

// Walk ALL files including JS
walk(DIST);

// Verify the result
const indexContent = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const hasPrefix = indexContent.includes(PREFIX + '/favicon.ico');
const hasSpaScript = indexContent.includes('spa:path');
const hasPreloads = indexContent.includes('expo-font-preloads');

const jsFiles = fs.readdirSync(path.join(DIST, '_expo', 'static', 'js', 'web'), { recursive: true })
  .filter(f => f.endsWith('.js'))
  .map(f => path.join(DIST, '_expo', 'static', 'js', 'web', f))
  .filter(fs.existsSync.bind(fs));

let jsOk = true;
for (const jsFile of jsFiles) {
  const jsContent = fs.readFileSync(jsFile, 'utf8');
  if (jsContent.includes('"/assets/node_modules')) {
    jsOk = false;
    console.error('✗ JS bundle still has unprefixed paths: ' + path.relative(DIST, jsFile));
  }
}

if (hasPrefix && hasSpaScript && hasPreloads && jsOk) {
  console.log('✓ All paths prefixed, SPA script injected, font preloads added, JS assets fixed');
} else {
  console.error('✗ Verification failed!');
  if (!hasPrefix) console.error('  - index.html missing path prefix');
  if (!hasSpaScript) console.error('  - index.html missing SPA script');
  if (!hasPreloads) console.error('  - index.html missing font preloads');
  if (!jsOk) console.error('  - JS bundle has unprefixed asset paths');
  process.exit(1);
}
