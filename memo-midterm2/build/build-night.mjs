// ملف «ليلة الاختبار» (A4): خريطة الفصلي الثاني من آخر 6 اختبارات، والقوانين بس، وتدريب «أول حركة» بأجوبته.
// التشغيل: node build/build-night.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { ROOT, CONTENT, makeMarkdown, readText } from './lib.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = path.join(ROOT, 'out');
const HTML = path.join(OUT, 'html', 'night.html');
const PDF = path.join(OUT, 'ريض111-ليلة-الفصلي-الثاني.pdf');
fs.mkdirSync(path.dirname(HTML), { recursive: true });

const md = makeMarkdown({});
function renderMd(text) {
  let html = md.render(text);
  html = html.replace(/<div class="h3([^"]*)">([^<]*(?:<(?!\/div>)[^<]*)*)<\/div>/g, (_, cls, inner) => `<div class="h3${cls}">${md.renderInline(inner)}</div>`);
  html = html.replace(/<p class="lede">([\s\S]*?)<\/p>/g, (_, inner) => `<p class="lede">${md.renderInline(inner)}</p>`);
  return html;
}
function iconCss() {
  const ic = {
    recog: "<circle cx='10.5' cy='10.5' r='6.5'/><path d='M15.5 15.5L21 21'/>",
    steps: "<path d='M9 6h11M9 12h11M9 18h11'/><path d='M4 6h1M4 12h1M4 18h1'/>",
    why: "<path d='M9 18h6M10 21h4'/><path d='M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z'/>",
    warn: "<path d='M12 3L2 20h20L12 3z'/><path d='M12 10v4M12 17h.01'/>",
    fix: "<path d='M4 20l4-1 11-11-3-3L5 16l-1 4z'/><path d='M14 6l3 3'/>",
    short: "<path d='M13 2L4 14h7l-1 8 9-12h-7l1-8z'/>",
    more: "<circle cx='12' cy='12' r='9'/><path d='M12 8v8M8 12h8'/>",
    alg: "<path d='M4 7h6M7 4v6M14 7h6M4 17h6M14 15h6M14 19h6'/>",
    law: "<path d='M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z'/><path d='M4 19a2 2 0 0 1 2-2h13'/>",
    note: "<circle cx='12' cy='12' r='9'/><path d='M12 11v6M12 7.5h.01'/>",
    use: "<path d='M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7L12 3z'/>",
    scope: "<rect x='4' y='4' width='16' height='16' rx='2'/><path d='M8 9h8M8 13h8M8 17h5'/>",
    plan: "<path d='M4 6h16M4 12h10M4 18h6'/><circle cx='19' cy='17' r='3'/>",
    exam: "<rect x='5' y='3' width='14' height='18' rx='2'/><path d='M9 8h6M9 12h6M9 16h3'/>",
    check: "<circle cx='12' cy='12' r='9'/><path d='M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.5M12 17h.01'/>",
  };
  let css = '';
  for (const [k, inner] of Object.entries(ic)) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'>${inner}</svg>`;
    css += `.box-${k}{--icon:url("data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}")}\n`;
  }
  return css;
}

const nm = (p) => 'file://' + path.join(ROOT, 'node_modules', p);
const dir = path.join(CONTENT, 'night');
const parts = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
const body = parts.map((f) => `<section class="pg-learn s-${f.replace('.md', '')}">${renderMd(readText(path.join(dir, f)))}</section>`).join('\n');
const css = ['style-5x.css', 'style-61.css', 'style-5x2.css', 'style-night.css'].map((f) => readText(path.join(ROOT, 'build', f))).join('\n') + iconCss();
const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>ريض 111 · ليلة الفصلي الثاني</title>
<link rel="stylesheet" href="${nm('katex/dist/katex.min.css')}">
<link rel="stylesheet" href="${nm('@fontsource/ibm-plex-sans-arabic/400.css')}">
<link rel="stylesheet" href="${nm('@fontsource/ibm-plex-sans-arabic/500.css')}">
<link rel="stylesheet" href="${nm('@fontsource/ibm-plex-sans-arabic/600.css')}">
<link rel="stylesheet" href="${nm('@fontsource/ibm-plex-sans-arabic/700.css')}">
<style>${css}</style>
</head>
<body>
${body}
</body>
</html>`;
fs.writeFileSync(HTML, html);

const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: Math.floor((180 / 25.4) * 96), height: 1100 } });
await pg.emulateMedia({ media: 'print' });
await pg.goto('file://' + HTML);
await pg.evaluate(() => document.fonts.ready);
const over = await pg.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('.eq')) if (el.scrollWidth > el.clientWidth + 3) out.push(['eq', el.dataset.tex, el.scrollWidth - el.clientWidth]);
  const W = document.body.clientWidth;
  for (const el of document.querySelectorAll('.box, table, .drill li')) {
    const r = el.getBoundingClientRect();
    if (r.width > W + 1 || el.scrollWidth > el.clientWidth + 3) out.push(['box', el.className || el.tagName, Math.round(Math.max(r.width - W, el.scrollWidth - el.clientWidth))]);
  }
  return out;
});
await pg.pdf({ path: PDF, preferCSSPageSize: true, printBackground: true, tagged: true });
await browser.close();
const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(PDF)), verbosity: 0 }).promise;
console.log(`${path.basename(PDF)}: ${doc.numPages} صفحة`);
if (over.length) { console.log('تجاوز عرض:'); for (const o of over) console.log('  ', JSON.stringify(o)); }
