import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = 'https://azeemwaseem2020.github.io';
const htmlFiles = walk(ROOT).filter(file => file.endsWith('.html') && !file.split(path.sep).includes('.git'));
const knownFiles = new Set(htmlFiles.map(file => path.relative(ROOT, file).split(path.sep).join('/')));
const report = {
  htmlFiles: htmlFiles.length,
  metadata: { missingTitle: [], missingDescription: [], missingCanonical: [], noindex: [], duplicateTitles: [], duplicateCanonicals: [] },
  imagesMissingAlt: [],
  brokenInternalLinks: [],
  sitemap: [],
  errors: []
};

function walk(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else found.push(full);
  }
  return found;
}
function attr(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp("\\b" + escaped + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i"));
  return match ? (match[1] ?? match[2] ?? match[3] ?? '').trim() : '';
}
function decodeEntities(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function relFile(fromFile, href) {
  const raw = decodeEntities(href).trim();
  if (!raw || raw.startsWith('#') || /^(?:https?:|mailto:|tel:|javascript:|data:|blob:|sms:)/i.test(raw)) return null;
  const pathname = raw.split(/[?#]/, 1)[0];
  if (!pathname) return null;
  let resolved;
  if (pathname.startsWith('/')) resolved = pathname.slice(1);
  else resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), pathname));
  if (resolved === '.' || resolved === '') resolved = 'index.html';
  if (!path.posix.extname(resolved)) resolved = path.posix.join(resolved, 'index.html');
  return resolved;
}
function addUnique(map, key, file) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(file);
}
const titles = new Map();
const canonicals = new Map();
const noindexFiles = new Set();

for (const abs of htmlFiles) {
  const file = path.relative(ROOT, abs).split(path.sep).join('/');
  const html = fs.readFileSync(abs, 'utf8');
  const title = (html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i) || [])[1]?.replace(/\s+/g, ' ').trim() || '';
  const descriptionTag = (html.match(/<meta\b[^>]*\bname\s*=\s*(?:"description"|'description'|description)[^>]*>/i) || [])[0] || '';
  const description = attr(descriptionTag, 'content');
  const canonicalTag = (html.match(/<link\b[^>]*\brel\s*=\s*(?:"canonical"|'canonical'|canonical)[^>]*>/i) || [])[0] || '';
  const canonical = attr(canonicalTag, 'href');
  const robotsTags = [...html.matchAll(/<meta\b[^>]*\bname\s*=\s*(?:"robots"|'robots'|robots)[^>]*>/gi)].map(m => attr(m[0], 'content').toLowerCase());
  const isNoindex = robotsTags.some(value => /\bnoindex\b/.test(value));
  const isVerificationOrErrorFile = file === '404.html' || /^(?:google[a-f0-9]+\.html|bbe1f0cb-e6f8-4328-9b7e-c48eb0951b50\.html)$/i.test(file);
  if (isNoindex) { report.metadata.noindex.push(file); noindexFiles.add(file); }

  // Only indexable content pages need SEO metadata. Verification files, the 404 page,
  // and noindex redirect/alias pages are intentionally excluded from missing-meta checks.
  if (!isNoindex && !isVerificationOrErrorFile) {
    if (!title) report.metadata.missingTitle.push(file); else addUnique(titles, title, file);
    if (!description) report.metadata.missingDescription.push(file);
    if (!canonical) report.metadata.missingCanonical.push(file); else addUnique(canonicals, canonical, file);
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i.test(match[0])) report.imagesMissingAlt.push({ file, tag: match[0].slice(0, 180) });
  }
  // Parse attributes only from actual HTML element start tags; searching the entire
  // document for "href=" also mistakes JavaScript strings and download code for links.
  for (const match of html.matchAll(/<(a|link|img|script|iframe|source|video|audio)\b[^>]*>/gi)) {
    const tagName = match[1].toLowerCase();
    const value = attr(match[0], ['a', 'link'].includes(tagName) ? 'href' : 'src');
    const target = relFile(file, value);
    if (!target || /\.(?:png|jpe?g|webp|gif|svg|ico|css|js|xml|txt|pdf|woff2?|ttf|mp4|webm|json|map)$/i.test(target)) continue;
    if (!knownFiles.has(target) && !fs.existsSync(path.join(ROOT, target))) report.brokenInternalLinks.push({ file, href: value, target });
  }
}
for (const [title, files] of titles) if (files.length > 1) report.metadata.duplicateTitles.push({ title, files });
for (const [canonical, files] of canonicals) {
  const indexableFiles = files.filter(file => !noindexFiles.has(file) && file !== '404.html' && !/^(?:google[a-f0-9]+\.html|bbe1f0cb-e6f8-4328-9b7e-c48eb0951b50\.html)$/i.test(file));
  if (indexableFiles.length > 1) report.metadata.duplicateCanonicals.push({ canonical, files: indexableFiles });
}

for (const sitemapFile of ['sitemap.xml', 'sitemap-pakistan-priority.xml']) {
  if (!fs.existsSync(path.join(ROOT, sitemapFile))) {
    report.errors.push('Missing sitemap file: ' + sitemapFile);
    continue;
  }
  const xml = fs.readFileSync(path.join(ROOT, sitemapFile), 'utf8');
  const locs = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(match => decodeEntities(match[1].trim()));
  const duplicates = [...new Set(locs.filter((url, index) => locs.indexOf(url) !== index))];
  const noindexSitemapUrls = locs.filter(url => {
    if (!url.startsWith(BASE)) return false;
    const pathname = url.slice(BASE.length).split(/[?#]/, 1)[0].replace(/^\//, '');
    return noindexFiles.has(pathname || 'index.html');
  });
  const missingFiles = locs.filter(url => {
    if (!url.startsWith(BASE)) return true;
    const pathname = url.slice(BASE.length).split(/[?#]/, 1)[0].replace(/^\//, '');
    const target = pathname || 'index.html';
    return !knownFiles.has(target);
  });
  const invalidLastmod = [...xml.matchAll(/<lastmod>([\s\S]*?)<\/lastmod>/gi)].map(match => match[1].trim()).filter(value => !/^\d{4}-\d{2}-\d{2}(?:T.*Z)?$/.test(value));
  report.sitemap.push({ file: sitemapFile, urlCount: locs.length, duplicateUrls: duplicates, noindexUrls: noindexSitemapUrls, missingLocalFiles: [...new Set(missingFiles)], invalidLastmod });
  if (!/^\s*<\?xml\s+version=/i.test(xml) || !/<urlset\b/i.test(xml) || !/<\/urlset>\s*$/i.test(xml)) report.errors.push('Malformed sitemap structure: ' + sitemapFile);
  if (duplicates.length) report.errors.push('Duplicate URLs in ' + sitemapFile);
  if (noindexSitemapUrls.length) console.warn('WARNING: noindex URLs listed in ' + sitemapFile + ': ' + noindexSitemapUrls.join(', '));
  if (missingFiles.length) report.errors.push('Sitemap URLs do not map to local files in ' + sitemapFile);
}
const summary = {
  htmlFilesScanned: report.htmlFiles,
  missingTitle: report.metadata.missingTitle.length,
  missingDescription: report.metadata.missingDescription.length,
  missingCanonical: report.metadata.missingCanonical.length,
  noindexPages: report.metadata.noindex,
  duplicateTitleGroups: report.metadata.duplicateTitles.length,
  duplicateCanonicalGroups: report.metadata.duplicateCanonicals.length,
  imagesMissingAlt: report.imagesMissingAlt.length,
  brokenInternalLinks: report.brokenInternalLinks.length,
  sitemap: report.sitemap,
  findings: {
    missingTitle: report.metadata.missingTitle,
    missingDescription: report.metadata.missingDescription,
    missingCanonical: report.metadata.missingCanonical,
    duplicateTitleGroups: report.metadata.duplicateTitles,
    duplicateCanonicalGroups: report.metadata.duplicateCanonicals,
    imagesMissingAlt: report.imagesMissingAlt,
    brokenInternalLinks: report.brokenInternalLinks,
    noindexPages: report.metadata.noindex
  },
  blockingErrors: report.errors
};
console.log('CALCORA SEO INTEGRITY AUDIT');
console.log(JSON.stringify(summary, null, 2));
fs.mkdirSync(path.join(ROOT, 'audit-reports'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'audit-reports/seo-integrity-latest.json'), JSON.stringify(report, null, 2) + '\n');
if (report.errors.length) process.exitCode = 1;
