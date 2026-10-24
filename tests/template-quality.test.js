const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const index = read('index.html');
const scripts = read('static/js/scripts.js');
const mainCss = read('static/css/main.css');
const config = read('contents/config.yml');
const gitignore = read('.gitignore');

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

assert.equal(index.includes('polyfill.io'), false, 'polyfill.io must not be loaded');
assert.equal(countMatches(index, /id="MathJax-script"/g), 1, 'MathJax should be loaded exactly once');
assert.equal(countMatches(index, /mathjax@3\/es5\/tex-[^"]+\.js/g), 1, 'Only one MathJax component bundle should be loaded');
assert.equal(
  /<link[^>]+static\/css\/styles\.css/.test(index) && /@import\s+["']\.\/styles\.css["']/.test(mainCss),
  false,
  'styles.css should not be loaded both directly and through main.css'
);
assert.equal(index.includes(' mt5 '), false, 'invalid mt5 class should not be used');
assert.equal(index.includes(' md5'), false, 'invalid md5 class should not be used');
const profileImage = index.match(/<img\b[^>]*\bsrc="static\/assets\/img\/photo\.png"[^>]*>/);
assert.ok(profileImage, 'page should retain the existing profile image');
assert.match(profileImage[0], /\balt="[^"]+"/, 'profile image should include descriptive alt text');
assert.equal(mainCss.includes('background-size: fill'), false, 'background-size: fill is invalid CSS');
assert.equal(index.includes('github.com/senli1073'), false, 'template should not hard-code the original author GitHub URL');
assert.equal(/<section[^>]+class="[^"]*\btop-section\b[^"]*"[^>]+style=/.test(index), false, 'hero background should not be defined with inline styles');
assert.match(config, /backgrounds:/, 'background images should be configured in config.yml');
assert.match(config, /static\/assets\/background\//, 'configured backgrounds should use the background directory');
const configuredBackgrounds = [...config.matchAll(/^\s+-\s+(static\/assets\/background\/\S+)$/gm)].map((match) => match[1]);
assert.ok(configuredBackgrounds.length > 0, 'at least one background image should be configured');
configuredBackgrounds.forEach((background) => {
  assert.equal(fs.existsSync(path.join(root, background)), true, `configured background should exist: ${background}`);
});
assert.match(scripts, /function\s+initBackgroundSlideshow/, 'background slideshow should be initialized from JS');
assert.match(mainCss, /prefers-reduced-motion:\s*reduce/, 'slideshow should respect reduced motion preferences');
assert.equal(/<img\b[^>]*\bsrc="static\/assets\/img\/photo\.png"[^>]*\bwidth=/.test(index), false, 'avatar image should not force a fixed width attribute');
assert.equal(/<img\b[^>]*\bsrc="static\/assets\/img\/photo\.png"[^>]*\bheight=/.test(index), false, 'avatar image should not force a fixed height attribute');
assert.match(mainCss, /#avatar img[\s\S]*height:\s*auto/, 'avatar CSS should preserve the original image ratio');
assert.match(gitignore, /^\.superpowers\/$/m, '.superpowers companion artifacts should be ignored');
assert.equal(/getElementById\(key\)\.innerHTML\s*=\s*yml\[key\]/.test(scripts), false, 'YAML config values should not be injected with innerHTML');
assert.match(scripts, /typesetPromise/, 'MathJax should be invoked with typesetPromise');
assert.equal(/MathJax\.typeset\(\)/.test(scripts), false, 'MathJax.typeset() should not be called repeatedly per section');
assert.equal(/const\s+section_names\s*=/.test(scripts), false, 'section list should come from configuration instead of a JS constant');
assert.equal(/^nav:\s*$/m.test(config), false, 'navigation should be derived from sections instead of a separate nav list');
assert.match(config, /sections:\n\s+-\s+id:\s+home/, 'sections should use object entries with ids');
assert.equal(/sections:\n(?:\s+-\s+\w+\n?)+$/m.test(config), false, 'sections should not be a plain string list');
assert.match(index, /<main id="sections"><\/main>/, 'content sections should be rendered into a single sections container');
assert.match(config, /sections:\n\s+-\s+id:\s+home[\s\S]*title:/, 'section entries should define display titles');
assert.match(config, /id:\s+publications[\s\S]*icon:\s+bi-file-text-fill/, 'section icon should be configured as a Bootstrap Icons class');
assert.match(config, /id:\s+awards[\s\S]*icon:\s+bi-award-fill/, 'award icon should be configured as a Bootstrap Icons class');
assert.match(scripts, /function\s+renderSections/, 'sections should be generated from configuration');
assert.match(index, /<body[^>]*class="site-loading"/, 'page should start in a loading state before async content is ready');
assert.match(index, /id="page-skeleton"/, 'page should include skeleton placeholders for initial async loading');
assert.match(mainCss, /@keyframes\s+skeleton-shimmer/, 'skeleton placeholders should use a shimmer animation');
assert.match(mainCss, /animation:\s*skeleton-shimmer/, 'skeleton placeholders should show a moving shimmer while loading');
assert.match(mainCss, /prefers-reduced-motion:\s*reduce[\s\S]*\.skeleton-block/, 'skeleton animation should respect reduced motion preferences');
assert.match(scripts, /function\s+markSiteReady/, 'JS should expose a loading completion transition');
assert.match(scripts, /\.finally\(\(\)\s*=>\s*markSiteReady\(\)\)/, 'site should leave loading state even if content loading fails');
assert.match(mainCss, /\.skeleton-block\s*\{[\s\S]*max-width:\s*100%/, 'skeleton blocks should never overflow their container');

const configuredSections = [...config.matchAll(/^\s+-\s+id:\s+(\S+)$/gm)].map((match) => match[1]);
configuredSections.forEach((section) => {
  assert.equal(fs.existsSync(path.join(root, 'contents', section + '.md')), true, `configured section should have a Markdown source: ${section}`);
});

console.log('template quality checks passed');
