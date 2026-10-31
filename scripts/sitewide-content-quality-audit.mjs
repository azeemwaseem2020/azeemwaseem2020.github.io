import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skipDirs = new Set(['.git', 'node_modules']);
const files = walk(root).filter(file => file.endsWith('.html'));
const pages = [];
const duplicateGroups = new Map();

for (const absolute of files) {
  const file = path.relative(root, absolute).split(path.sep).join('/');
  const html = fs.readFileSync(absolute, 'utf8');
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  const verification = /^(?:google[a-f0-9]+|bbe1f0cb-e6f8-4328-9b7e-c48eb0951b50)\.html$/i.test(path.basename(file));
  const clean = html
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<template\b[\s\S]*?<\/template\s*>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|apos|lt|gt);/gi, ' ')
    .replace(/&#?\w+;/g, ' ');
  const words = clean.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) || [];
  const title = (html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [,''])[1].replace(/<[^>]+>/g,' ').trim();
  const descriptionTag = (html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i) || [])[0] || '';
  const description = (descriptionTag.match(/content=["']([^"']*)["']/i) || [,''])[1];
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => strip(m[1]));
  const h2 = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => strip(m[1]));
  const normalizedH2 = h2.map(x => x.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()).filter(Boolean);
  const duplicateH2 = [...new Set(normalizedH2.filter((x,i) => normalizedH2.indexOf(x) !== i))];
  const bodyParagraphs = [...clean.matchAll(/([^.!?]{35,}[.!?])/g)].map(m => m[1].toLowerCase().replace(/\s+/g,' ').trim());
  const repeatedParagraphs = [...new Set(bodyParagraphs.filter((x,i) => bodyParagraphs.indexOf(x) !== i))];
  const indexable = !noindex && !verification && !/^(?:404|google)/i.test(path.basename(file));
  const item = {
    file, indexable, wordCount: words.length, title, description,
    h1Count: h1.length, h1: h1[0] || '', h2Count: h2.length,
    duplicateH2, repeatedParagraphCount: repeatedParagraphs.length,
    hasFaq: /frequently asked questions|\bfaq\b/i.test(html),
    hasAuthor: /<meta\b[^>]*name=["']author["']/i.test(html),
    hasCanonical: /<link\b[^>]*rel=["']canonical["']/i.test(html),
    hasOpenGraphTitle: /<meta\b[^>]*property=["']og:title["']/i.test(html),
    hasTwitterCard: /<meta\b[^>]*name=["']twitter:card["']/i.test(html),
    hasInternalRelatedLinks: /href=["'][^"'#]*(?:calculator|calculators|hub)[^"'#]*\.html/i.test(html)
  };
  pages.push(item);
  if (indexable && title) {
    if (!duplicateGroups.has(title)) duplicateGroups.set(title, []);
    duplicateGroups.get(title).push(file);
  }
}
const indexablePages = pages.filter(p => p.indexable);
const report = {
  generatedAt: new Date().toISOString(),
  scope: 'All local HTML pages; word counts exclude scripts, styles, templates, comments and markup.',
  totals: {
    htmlFiles: pages.length, indexablePages: indexablePages.length,
    under250Words: indexablePages.filter(p => p.wordCount < 250).length,
    '250to399Words': indexablePages.filter(p => p.wordCount >= 250 && p.wordCount < 400).length,
    '400to499Words': indexablePages.filter(p => p.wordCount >= 400 && p.wordCount < 500).length,
    500PlusWords: indexablePages.filter(p => p.wordCount >= 500).length,
    missingTitle: indexablePages.filter(p => !p.title).length,
    missingDescription: indexablePages.filter(p => !p.description).length,
    missingH1: indexablePages.filter(p => p.h1Count === 0).length,
    multipleH1: indexablePages.filter(p => p.h1Count > 1).length,
    missingAuthor: indexablePages.filter(p => !p.hasAuthor).length,
    missingCanonical: indexablePages.filter(p => !p.hasCanonical).length,
    missingOpenGraphTitle: indexablePages.filter(p => !p.hasOpenGraphTitle).length,
    missingTwitterCard: indexablePages.filter(p => !p.hasTwitterCard).length,
    duplicateHeadingPages: indexablePages.filter(p => p.duplicateH2.length).length,
    repeatedParagraphPages: indexablePages.filter(p => p.repeatedParagraphCount).length,
    pagesWithoutFaq: indexablePages.filter(p => !p.hasFaq).length,
    pagesWithoutRelatedLinks: indexablePages.filter(p => !p.hasInternalRelatedLinks).length,
    duplicateTitleGroups: [...duplicateGroups.values()].filter(group => group.length > 1)
  },
  reviewQueue: indexablePages
    .filter(p => p.wordCount < 400 || p.duplicateH2.length || p.repeatedParagraphCount || !p.description || !p.h1Count || p.h1Count > 1)
    .sort((a,b) => a.wordCount-b.wordCount)
};
fs.mkdirSync(path.join(root,'audit-reports'),{recursive:true});
fs.writeFileSync(path.join(root,'audit-reports/sitewide-content-quality-latest.json'),JSON.stringify(report,null,2)+'\n');
console.log('CALCORA SITEWIDE CONTENT QUALITY AUDIT');
console.log(JSON.stringify({totals:report.totals,reviewQueue:report.reviewQueue.slice(0,100)},null,2));

function strip(value) {
  return value.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
}
function walk(dir) {
  const found=[];
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (skipDirs.has(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else found.push(full);
  }
  return found;
}
