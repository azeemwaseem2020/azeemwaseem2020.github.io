import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKIP = new Set(['.git', 'node_modules', 'audit-reports']);
const files = walk(ROOT).filter(file => file.endsWith('.html'));
const pages = [];
const issues = {
  titleLengthReview: [], descriptionLengthReview: [], duplicateDescriptions: [],
  missingOpenGraph: [], duplicateSocialTags: [], missingImageAlt: [],
  emptyImageAltReview: [], filenameLikeAltText: [], genericAnchorText: [],
  anchorsWithoutAccessibleName: [], headingHierarchyReview: [],
  searchStrategyLeakage: [], missingApplicationSchemaReview: [], multipleH1Review: []
};

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
function attr(tag, name) {
  const escaped = name.replace(/[.*+?^$|()[\]\\]/g, '\\$&');
  const m = tag.match(new RegExp("\\b" + escaped + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i"));
  return m ? (m[1] ?? m[2] ?? m[3] ?? '').trim() : '';
}
function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
}
function strip(s) {
  return decode(s.replace(/<script\b[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<template\b[\s\S]*?<\/template\s*>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}
function tags(html, pattern) { return [...html.matchAll(pattern)].map(m => m[0]); }
function metaContent(html, key, attrName = 'name') {
  const found = tags(html, /<meta\b[^>]*>/gi).filter(tag => attr(tag, attrName).toLowerCase() === key.toLowerCase());
  return { count: found.length, values: found.map(tag => attr(tag, 'content')) };
}
function addDuplicate(map, value, file) {
  const key = value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(file);
}

const descriptions = new Map();
for (const absolute of files) {
  const file = path.relative(ROOT, absolute).split(path.sep).join('/');
  const html = fs.readFileSync(absolute, 'utf8');
  const robotTags = tags(html, /<meta\b[^>]*>/gi).filter(tag => attr(tag, 'name').toLowerCase() === 'robots');
  const noindex = robotTags.some(tag => /\bnoindex\b/i.test(attr(tag, 'content')));
  const verification = /^(?:google[a-f0-9]+|bbe1f0cb-e6f8-4328-9b7e-c48eb0951b50)\.html$/i.test(path.basename(file));
  if (noindex || verification || /^404(?:\.|$)/i.test(path.basename(file))) continue;

  const title = (html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i) || [,''])[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const descriptionMeta = metaContent(html, 'description');
  const description = descriptionMeta.values[0] || '';
  const ogTitle = metaContent(html, 'og:title', 'property');
  const ogDescription = metaContent(html, 'og:description', 'property');
  const ogImage = metaContent(html, 'og:image', 'property');
  const twitterCard = metaContent(html, 'twitter:card');
  const twitterTitle = metaContent(html, 'twitter:title');
  const twitterDescription = metaContent(html, 'twitter:description');
  const twitterImage = metaContent(html, 'twitter:image');
  const h1 = tags(html, /<h1\b[^>]*>/gi);
  const headings = tags(html, /<h[1-6]\b[^>]*>/gi).map(tag => Number((tag.match(/^<h([1-6])/i) || [,'0'])[1]));
  const jsonLd = tags(html, /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script\s*>/gi);
  const schemaTypes = [];
  for (const block of jsonLd) {
    try {
      const parsed = JSON.parse(block.replace(/^<script\b[^>]*>/i, '').replace(/<\/script\s*>$/i, '').trim());
      const collect = value => {
        if (!value || typeof value !== 'object') return;
        if (Array.isArray(value)) return value.forEach(collect);
        const type = value['@type'];
        if (Array.isArray(type)) schemaTypes.push(...type);
        else if (type) schemaTypes.push(type);
        if (value['@graph']) collect(value['@graph']);
      };
      collect(parsed);
    } catch {}
  }
  pages.push({ file, title, titleLength: title.length, description, descriptionLength: description.length, h1Count: h1.length, schemaTypes });

  if (title.length < 30 || title.length > 65) issues.titleLengthReview.push({ file, length: title.length, title });
  if (description.length < 120 || description.length > 170) issues.descriptionLengthReview.push({ file, length: description.length, description });
  if (description) addDuplicate(descriptions, description, file);
  if (!ogTitle.count || !ogDescription.count || !ogImage.count) issues.missingOpenGraph.push({ file, missing: [!ogTitle.count && 'og:title', !ogDescription.count && 'og:description', !ogImage.count && 'og:image'].filter(Boolean) });
  const socialCounts = { description: descriptionMeta.count, 'og:title': ogTitle.count, 'og:description': ogDescription.count, 'og:image': ogImage.count, 'twitter:card': twitterCard.count, 'twitter:title': twitterTitle.count, 'twitter:description': twitterDescription.count, 'twitter:image': twitterImage.count };
  for (const [name, count] of Object.entries(socialCounts)) if (count > 1) issues.duplicateSocialTags.push({ file, tag: name, count });
  if (h1.length > 1) issues.multipleH1Review.push({ file, count: h1.length });

  const markup = html.replace(/<script\b[\s\S]*?<\/script\s*>/gi, ' ').replace(/<style\b[\s\S]*?<\/style\s*>/gi, ' ');
  for (const img of tags(markup, /<img\b[^>]*>/gi)) {
    const alt = attr(img, 'alt');
    if (!/\balt\s*=/i.test(img)) issues.missingImageAlt.push({ file, src: attr(img, 'src') });
    else if (!alt && !/role\s*=\s*["']presentation["']/i.test(img) && !/aria-hidden\s*=\s*["']true["']/i.test(img)) issues.emptyImageAltReview.push({ file, src: attr(img, 'src') });
    else if (alt && /(?:^|[\s/_-])(?:img|image|photo|picture)[\s_-]*\d*|\.jpe?g$|\.png$|\.webp$/i.test(alt)) issues.filenameLikeAltText.push({ file, alt, src: attr(img, 'src') });
  }
  for (const anchor of markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)) {
    const openTag = '<a' + anchor[1] + '>';
    const accessible = attr(openTag, 'aria-label') || attr(openTag, 'title');
    const textContent = strip(anchor[2]);
    const imageAlt = tags(anchor[2], /<img\b[^>]*>/gi).map(img => attr(img, 'alt')).filter(Boolean).join(' ');
    const name = (textContent || imageAlt || accessible).trim();
    if (!name) issues.anchorsWithoutAccessibleName.push({ file, href: attr(openTag, 'href') });
    else if (!accessible && /^(?:click here|here|read more|learn more|more|this link|view more)$/i.test(name)) issues.genericAnchorText.push({ file, href: attr(openTag, 'href'), text: name });
  }
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      issues.headingHierarchyReview.push({ file, previous: headings[i - 1], current: headings[i] });
      break;
    }
  }
  if (/search intent covered|search gap expansion|global\/search intent|semantic keyword targets|primary keyword:|supporting keywords:/i.test(strip(markup))) issues.searchStrategyLeakage.push(file);
  if (!schemaTypes.some(type => /WebApplication|SoftwareApplication|Product|Service/i.test(String(type)))) issues.missingApplicationSchemaReview.push({ file, schemaTypes });
}
for (const [description, filesForDescription] of descriptions) {
  if (filesForDescription.length > 1) issues.duplicateDescriptions.push({ description, files: filesForDescription });
}
const totals = Object.fromEntries(Object.entries(issues).map(([key, value]) => [key, value.length]));
const report = {
  generatedAt: new Date().toISOString(),
  scope: 'Static review signals for indexable HTML pages. Length ranges and schema-presence checks are heuristics, not Google ranking rules.',
  pageCount: pages.length,
  totals,
  issues
};
fs.mkdirSync(path.join(ROOT, 'audit-reports'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'audit-reports/seo-onpage-opportunity-latest.json'), JSON.stringify(report, null, 2) + '\n');
console.log('CALCORA ON-PAGE & SERP READINESS REVIEW');
console.log(JSON.stringify({ pageCount: pages.length, totals, report: 'audit-reports/seo-onpage-opportunity-latest.json' }, null, 2));
