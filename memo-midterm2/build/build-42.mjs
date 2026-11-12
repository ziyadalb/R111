// بناء ملف 4.2 الواحد: فهم + قوانين + أنماط + تدريب + تلميحات + حلول + ملحق
// التشغيل: node build/build-42.mjs
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { createRequire } from 'module';
import {
  ROOT, CONTENT, EXAMS, makeMarkdown, marksChip, questionMath, mathBlockHtml, mathInlineHtml, readText, tex,
} from './lib.mjs';
import { plot, coverArt } from './plots.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = path.join(ROOT, 'out');
const HTML = path.join(OUT, 'html', '4.2.html');
const PDF = path.join(OUT, 'ريض111-4.2-الدوال-الزائدية-العكسية.pdf');
fs.mkdirSync(path.dirname(HTML), { recursive: true });

// ---------- البيانات ----------
const load = (p) => yaml.load(fs.readFileSync(p, 'utf8'));
const files = [
  [path.join(CONTENT, 'questions', '4.2-derivatives.yaml'), 'past'],
  [path.join(CONTENT, 'questions', '4.2-integrals.yaml'), 'past'],
  [path.join(CONTENT, '42', 'data', 'notes.yaml'), 'notes'],
  [path.join(CONTENT, '42', 'data', 'past-4.1.yaml'), 'past'],
];

const PATTERNS = {
  A: { title: 'دالة زائدية أو عكسية، وداخلها دالة', sec: 'المشتقات' },
  B1: { title: 'إكمال المربع تحت الجذر', sec: 'التكاملات' },
  B2: { title: 'إكمال المربع، و(x − c) مضروب برّا الجذر', sec: 'التكاملات' },
  B3: { title: 'الداخل ومشتقته موجودين', sec: 'التكاملات' },
  B4: { title: 'عوّض واكتب dx كامل', sec: 'التكاملات' },
  T41: { title: 'تكامل دالة زائدية بالتعويض (4.1)', sec: 'تكاملات 4.1' },
};
const ORDER = ['A', 'B1', 'B2', 'B3', 'B4', 'T41'];

const byId = new Map();
const byPattern = Object.fromEntries(ORDER.map((k) => [k, { past: [], ne: [], nx: [] }]));
for (const [file, kind] of files) {
  const doc = load(file);
  for (const p of doc.patterns) {
    for (const q of p.questions) {
      if (byId.has(q.id)) throw new Error('مكرر: ' + q.id);
      q.pkey = p.key;
      q.src = kind === 'past' ? 'past' : q.kind === 'example' ? 'ne' : 'nx';
      byId.set(q.id, q);
      byPattern[p.key][q.src].push(q);
    }
  }
}
const practice = ORDER.flatMap((k) => [...byPattern[k].past, ...byPattern[k].nx]);
const counts = { past: 0, ne: 0, nx: 0 };
for (const q of byId.values()) counts[q.src]++;

// ---------- رموز وأوسمة ----------
function examInfo(id) {
  const e = EXAMS[id.slice(0, 4)];
  const [, qn, part] = id.split('-');
  return { ...e, qn, part };
}
function tag(q) {
  if (q.src === 'past') {
    const e = examInfo(q.id);
    return e.year === 1447
      ? `<span class="tag tag-last">سابقات 1447 · السنة الماضية</span>`
      : `<span class="tag tag-past">سابقات ${e.year}</span>`;
  }
  return `<span class="tag tag-notes">من المذكرة</span>`;
}
function label(q) {
  if (q.src === 'past') return `<span class="qid">${q.id}</span>`;
  return `<span class="qid qid-notes">${q.ref.replace('مثال ', 'مثال ').replace('تمرين ', 'تمرين ')}</span>`;
}
function srcText(q) {
  if (q.src === 'past') {
    const e = examInfo(q.id);
    return `الفصل ${e.sem} · س${e.qn} فقرة ${e.part}`;
  }
  return `المذكرة ص${q.page}`;
}
function head(q, extra = '') {
  return `${label(q)}${tag(q)}<span class="src">${srcText(q)}</span>${marksChip(q)}${extra}`;
}

const used = new Set();
const md = makeMarkdown({ byId, used, diffHead: (q) => `${label(q)}${tag(q)}${marksChip(q)}` });

// ---------- أجزاء مكررة ----------
function answerBlock(q) {
  const why = q.domain_why ? `<div class="dom-why">${md.renderInline(q.domain_why)}</div>` : '';
  const dom = q.domain ? `<div class="domain"><span class="lbl">المجال</span><div class="dom-math">${mathBlockHtml(q.domain)}</div></div>${why}` : '';
  return `<div class="answer"><div class="ans-label">الجواب</div>${mathBlockHtml(q.answer)}</div>${dom}`;
}
function notesBlock(q) {
  let h = '';
  if (q.fix) h += box('fix', q.src === 'past' ? 'تصحيح للمفتاح المطبوع' : 'تصحيح لحل المذكرة', renderMd(q.fix));
  if (q.note) h += box('note', 'ملاحظة', renderMd(q.note));
  if (q.more) h += box('more', 'إذا احتجت', renderMd(q.more));
  return h;
}
function box(type, title, body) {
  return `<div class="box box-${type}"><div class="box-title">${title}</div><div class="box-body">${body}</div></div>`;
}
function solutionBody(q) {
  return `<div class="sol-steps">${renderMd(q.solution)}</div>${answerBlock(q)}${notesBlock(q)}`;
}

function workedExample(q) {
  used.add(q.id);
  q.worked = true;
  const lbl = q.src === 'ne' ? 'مثال محلول من المذكرة' : 'مثال كامل';
  return `<div class="example${q.src === 'ne' ? ' example-notes compact' : ''}" id="ex-${q.id}">
  <div class="ex-head"><span class="ex-label">${lbl}</span>${head(q)}</div>
  ${questionMath(q)}
  ${solutionBody(q)}
</div>`;
}

// ---------- رسوم ----------
function graphsGrid() {
  const C = '#0b5d73';
  const cells = [
    { name: '\\sinh^{-1}x', dom: '\\mathbb R', rng: '\\mathbb R', o: { xmin: -4, xmax: 4, ymin: -2.6, ymax: 2.6, curves: [{ fn: 'asinh', color: C }], ticksX: [-3, 3], ticksY: [-2, 2] } },
    { name: '\\cosh^{-1}x', dom: 'x\\ge1', rng: 'y\\ge0', o: { xmin: -1, xmax: 6, ymin: -0.8, ymax: 2.8, curves: [{ fn: 'acosh', color: C, from: 1 }], dots: [[1, 0, 'filled']], ticksX: [1, 5], ticksY: [2] } },
    { name: '\\tanh^{-1}x', dom: '|x|<1', rng: '\\mathbb R', o: { xmin: -2, xmax: 2, ymin: -3, ymax: 3, vlines: [-1, 1], curves: [{ fn: 'atanh', color: C, from: -0.9999, to: 0.9999 }], ticksX: [-1, 1], ticksY: [-2, 2] } },
    { name: '\\coth^{-1}x', dom: '|x|>1', rng: 'y\\ne0', o: { xmin: -4, xmax: 4, ymin: -3, ymax: 3, vlines: [-1, 1], curves: [{ fn: 'acoth', color: C, from: 1.0001, to: 4 }, { fn: 'acoth', color: C, from: -4, to: -1.0001 }], ticksX: [-1, 1], ticksY: [-2, 2] } },
    { name: '\\sech^{-1}x', dom: '0<x\\le1', rng: 'y\\ge0', o: { xmin: -0.5, xmax: 2, ymin: -0.6, ymax: 3.2, vlines: [1], curves: [{ fn: 'asech', color: C, from: 0.004, to: 1 }], dots: [[1, 0, 'filled']], ticksX: [1], ticksY: [2] } },
    { name: '\\csch^{-1}x', dom: 'x\\ne0', rng: 'y\\ne0', o: { xmin: -4, xmax: 4, ymin: -3, ymax: 3, curves: [{ fn: 'acsch', color: C, from: 0.0001, to: 4 }, { fn: 'acsch', color: C, from: -4, to: -0.0001 }], ticksX: [-3, 3], ticksY: [-2, 2] } },
  ];
  return `<div class="graphs">${cells.map((c, i) => `<figure class="gcell">
<div class="gname">${tex('y=' + c.name, false)}</div>
${plot({ ...c.o, w: 200, h: 128, id: 'g' + i })}
<figcaption><span>المجال ${mathInlineHtml(c.dom)}</span><span>المدى ${mathInlineHtml(c.rng)}</span></figcaption>
</figure>`).join('')}</div>`;
}

function graph41() {
  const o = { xmin: -2.6, xmax: 2.6, ymin: -3.5, ymax: 4.2, w: 260, h: 165, id: 'h', ticksX: [-2, 2], ticksY: [-2, 2, 4],
    curves: [{ fn: 'cosh', color: '#c97a10' }, { fn: 'sinh', color: '#0b5d73' }, { fn: 'tanh', color: '#7a4fc9', dash: '5 4', width: 1.8 }] };
  return `<figure class="g41">${plot(o)}<figcaption><span class="lg lg-sinh">${mathInlineHtml('\\sinh x')}</span><span class="lg lg-cosh">${mathInlineHtml('\\cosh x')}</span><span class="lg lg-tanh">${mathInlineHtml('\\tanh x')}</span></figcaption></figure>`;
}

function chart() {
  const L = (t) => mathInlineHtml(t);
  return `<div class="chart">
<div class="cq">فيه جذر في المقام؟</div>
<div class="cbranches">
  <div class="cbr">
    <div class="cans">لا</div>
    <div class="cleaf"><div class="cform">${L('a^2-u^2')}</div><div class="cres">${L('\\tfrac1a\\tanh^{-1}\\tfrac ua')}</div><div class="ccond">بشرط ${L('|u|<a')}</div></div>
    <div class="cleaf cleaf-out"><div class="cform">${L('u^2+a^2')}</div><div class="cres">${L('\\tfrac1a\\tan^{-1}\\tfrac ua')}</div><div class="ccond">مثلثية، مو 4.2</div></div>
  </div>
  <div class="cbr">
    <div class="cans">إيه</div>
    <div class="cq cq2">فيه ${L('u')} مضروبة برّا الجذر؟</div>
    <div class="cbranches cb2">
      <div class="cbr">
        <div class="cans">لا</div>
        <div class="cleaf"><div class="cform">${L('u^2+a^2')}</div><div class="cres">${L('\\sinh^{-1}\\tfrac ua')}</div></div>
        <div class="cleaf"><div class="cform">${L('u^2-a^2')}</div><div class="cres">${L('\\ln\\big|u+\\sqrt{u^2-a^2}\\big|')}</div><div class="ccond">أو ${L('\\cosh^{-1}\\tfrac ua')} لما ${L('u>a')}</div></div>
      </div>
      <div class="cbr">
        <div class="cans">إيه</div>
        <div class="cleaf"><div class="cform">${L('a^2-u^2')}</div><div class="cres">${L('-\\tfrac1a\\sech^{-1}\\tfrac{|u|}a')}</div></div>
        <div class="cleaf"><div class="cform">${L('a^2+u^2')}</div><div class="cres">${L('-\\tfrac1a\\csch^{-1}\\tfrac{|u|}a')}</div></div>
      </div>
    </div>
  </div>
</div>
</div>`;
}

// ---------- Markdown بأوامر ----------
function renderMd(text) {
  const holders = [];
  const pre = text.replace(/^([ \t]*)@(example|toc|graphs|graph41|chart|cover)(?:[ \t]+(.+?))?[ \t]*$/gm, (_, indent, cmd, arg) => {
    holders.push([cmd, arg]);
    return `\n${indent}<div class="holder" data-n="${holders.length - 1}"></div>\n\n`;
  });
  let html = md.render(pre);
  html = html.replace(/<div class="holder" data-n="(\d+)"><\/div>/g, (_, n) => {
    const [cmd, arg] = holders[Number(n)];
    if (cmd === 'example') {
      const q = byId.get(arg);
      if (!q) throw new Error('@example: غير موجود ' + arg);
      return workedExample(q);
    }
    if (cmd === 'toc') return '<nav class="toc" id="toc"></nav>';
    if (cmd === 'graphs') return graphsGrid();
    if (cmd === 'graph41') return graph41();
    if (cmd === 'chart') return chart();
    if (cmd === 'cover') return coverArt();
    return '';
  });
  // عناوين .h3 مكتوبة HTML، فنعالج الرياضيات اللي داخلها هنا
  html = html.replace(/<div class="h3([^"]*)">([^<]*(?:<(?!\/div>)[^<]*)*)<\/div>/g, (_, cls, inner) => `<div class="h3${cls}">${md.renderInline(inner)}</div>`);
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => ({
    past: counts.past, notes: counts.ne + counts.nx, practice: practice.length, total: byId.size,
  }[k] ?? `{{${k}}}`));
}

// ---------- أقسام مولّدة ----------
function practiceSection() {
  let h = '';
  for (const k of ORDER) {
    const qs = [...byPattern[k].past, ...byPattern[k].nx];
    h += `<h2 id="pr-${k}"><span class="pk">${PATTERNS[k].sec}</span>${PATTERNS[k].title}</h2>`;
    for (const q of qs) {
      h += `<div class="pcard" id="p-${q.id}">
<div class="q-head">${head(q, `<span class="ticks"><span class="tick">حليته</span><span class="tick">أعيده</span><a class="plink" href="#h-${q.id}">تلميح</a><a class="plink" href="#s-${q.id}">الحل</a></span>`)}</div>
${questionMath(q)}
</div>`;
    }
  }
  return h;
}

function examOrder() {
  const exams = ['M472', 'M471', 'M462', 'M461', 'M452', 'M451'];
  let h = '<div class="exam-grid">';
  for (const ex of exams) {
    const e = EXAMS[ex];
    const ids = practice.filter((q) => q.src === 'past' && q.id.startsWith(ex)).map((q) => q.id)
      .sort((a, b) => { const [, a1, a2] = a.split('-').map(Number); const [, b1, b2] = b.split('-').map(Number); return a1 - b1 || a2 - b2; });
    h += `<div class="exam-box${e.year === 1447 ? ' exam-last' : ''}"><div class="exam-title">${e.year} · الفصل ${e.sem}${e.year === 1447 ? ' <span class="star">السنة الماضية</span>' : ''}</div><div class="exam-ids">${ids.map((id) => `<a href="#p-${id}"><span class="qid">${id}</span></a>`).join('')}</div></div>`;
  }
  return h + '</div>';
}

function hintsSection() {
  let h = '';
  for (const k of ORDER) {
    const qs = [...byPattern[k].past, ...byPattern[k].nx];
    h += `<h2 id="hi-${k}"><span class="pk">${PATTERNS[k].sec}</span>${PATTERNS[k].title}</h2>`;
    for (const q of qs) {
      if (!q.hint) throw new Error('تلميح ناقص: ' + q.id);
      h += `<div class="hint" id="h-${q.id}"><div class="hint-head">${label(q)}${tag(q)}<a class="go" href="#s-${q.id}">الحل ←</a></div><div class="hint-body">${renderMd(q.hint)}</div></div>`;
    }
  }
  return h;
}

function solutionsSection() {
  let h = '';
  for (const k of ORDER) {
    const qs = [...byPattern[k].past, ...byPattern[k].nx];
    h += `<h2 id="so-${k}"><span class="pk">${PATTERNS[k].sec}</span>${PATTERNS[k].title}</h2>`;
    for (const q of qs) {
      const top = `<div class="ex-head"><span class="ex-label">حل</span>${head(q)}<a class="go" href="#p-${q.id}">السؤال</a></div>`;
      if (q.worked) {
        h += `<div class="solution sol-linked" id="s-${q.id}">${top}${questionMath(q)}
<p class="linked">هذا السؤال محلول خطوة بخطوة في الشرح: <a href="#ex-${q.id}">اضغط هنا وارجع للمثال الكامل</a>. وهذا جوابه للتأكد:</p>
${answerBlock(q)}</div>`;
      } else {
        h += `<div class="solution" id="s-${q.id}">${top}${questionMath(q)}${solutionBody(q)}</div>`;
      }
    }
  }
  return h;
}

// ---------- تجميع الصفحة ----------
function nm(p) { return 'file://' + path.join(ROOT, 'node_modules', p); }
function iconCss() {
  const ic = {
    recog: "<circle cx='10.5' cy='10.5' r='6.5'/><path d='M15.5 15.5L21 21'/>",
    first: "<path d='M5 21V4h11l-2 4 2 4H5'/>",
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
  };
  let css = '';
  for (const [k, inner] of Object.entries(ic)) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'>${inner}</svg>`;
    css += `.box-${k}{--icon:url("data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}")}\n`;
  }
  return css;
}

function build() {
  const dir = path.join(CONTENT, '42');
  const part = (f) => renderMd(readText(path.join(dir, f)));
  let body = '';
  body += `<section class="pg-cover">${part('00-cover.md')}</section>`;
  body += `<section class="pg-learn">${['10-basics.md', '20-derivatives.md', '30-integrals.md', '40-t41.md', '50-review.md'].map(part).join('\n')}</section>`;
  body += `<section class="pg-practice">${part('60-practice.md')}${practiceSection()}<h2 id="pr-exams">النماذج بترتيبها الأصلي</h2>${part('61-exams.md')}${examOrder()}</section>`;
  body += `<section class="pg-hints">${part('70-hints.md')}${hintsSection()}</section>`;
  body += `<section class="pg-sols">${part('80-solutions.md')}${solutionsSection()}</section>`;
  body += `<section class="pg-appx">${part('90-appendix.md')}</section>`;
  const css = readText(path.join(ROOT, 'build', 'style-42.css')) + iconCss();
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>ريض 111 · 4.2 الدوال الزائدية العكسية</title>
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
}

// ---------- الطباعة ----------
async function outline(pdfPath) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)), verbosity: 0 }).promise;
  const flat = [];
  async function walk(items) {
    for (const it of items || []) {
      let dest = it.dest;
      if (typeof dest === 'string') dest = await doc.getDestination(dest);
      const page = Array.isArray(dest) ? (await doc.getPageIndex(dest[0])) + 1 : null;
      flat.push({ title: it.title.replace(/\s+/g, ' ').trim(), page });
      await walk(it.items);
    }
  }
  await walk(await doc.getOutline());
  const n = doc.numPages;
  await doc.destroy();
  return { flat, n };
}

const html = build();
fs.writeFileSync(HTML, html);
const missing = [...byId.values()].filter((q) => q.src !== 'nx' && !used.has(q.id) && !q.worked);
if (missing.length) console.warn('ما ذُكرت في الشرح:', missing.map((q) => q.id).join(' '));
const unused = [...byId.values()].filter((q) => q.src === 'ne' && !used.has(q.id));
if (unused.length) console.warn('أمثلة مذكرة ما انعرضت:', unused.map((q) => q.id).join(' '));

const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: Math.floor((124 / 25.4) * 96), height: 900 } });
await pg.emulateMedia({ media: 'print' });
await pg.goto('file://' + HTML);
await pg.evaluate(() => document.fonts.ready);

const over = await pg.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('.eq')) if (el.scrollWidth > el.clientWidth + 3) out.push(['eq', el.dataset.tex, el.scrollWidth - el.clientWidth]);
  const W = document.body.clientWidth;
  for (const el of document.querySelectorAll('.box, .example, .solution, .pcard, .diff, .hint, table, .chart, .graphs, .exam-grid')) {
    const r = el.getBoundingClientRect();
    if (r.width > W + 1) out.push(['box', el.className, r.width - W]);
  }
  return out;
});
const heads = await pg.evaluate(() => [...document.querySelectorAll('h1[id], h2[id]')].map((h) => {
  const num = h.querySelector('.num');
  const pk = h.querySelector('.pk');
  let text = h.textContent;
  if (num) text = text.replace(num.textContent, num.textContent + ' · ');
  if (pk) text = text.replace(pk.textContent, pk.textContent + ' · ');
  return { id: h.id, lvl: h.tagName, text: text.replace(/\s+/g, ' ').trim(), html: h.innerHTML, learn: !!h.closest('.pg-learn') };
}));
const opts = { path: PDF, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true };

await pg.evaluate((heads) => {
  const nav = document.getElementById('toc');
  if (!nav) return;
  nav.innerHTML = heads.filter((h) => h.lvl === 'H1' || h.learn).map((h) => `<a class="toc-row toc-${h.lvl.toLowerCase()}" href="#${h.id}"><span class="toc-text">${h.html}</span><span class="toc-dots"></span><span class="toc-page" data-id="${h.id}">00</span></a>`).join('');
}, heads);
await pg.pdf(opts);
// عناوين Chromium في الـ outline تطلع مقلوبة الكلمات بالعربي، فنربط بالترتيب بس (نفس ترتيب العناوين في الصفحة)
const map = (flat) => {
  if (flat.length !== heads.length) throw new Error(`عدد عناصر الفهرس ${flat.length} ≠ العناوين ${heads.length}`);
  const res = {};
  heads.forEach((h, i) => { res[h.id] = flat[i].page; });
  return res;
};
const pages1 = map((await outline(PDF)).flat);
await pg.evaluate((pages) => { for (const el of document.querySelectorAll('.toc-page')) el.textContent = pages[el.dataset.id] ?? '?'; }, pages1);
await pg.pdf(opts);
const { flat, n } = await outline(PDF);
const pages2 = map(flat);
for (const k of Object.keys(pages1)) if (pages1[k] !== pages2[k]) console.warn('رقم صفحة تغير:', k);
await browser.close();

// نعيد كتابة الفهرس الجانبي (Bookmarks) بعناوين عربية صحيحة
const outlineJson = path.join(OUT, 'html', 'outline-4.2.json');
fs.writeFileSync(outlineJson, JSON.stringify(heads.map((h) => ({ title: h.text, level: h.lvl === 'H1' ? 1 : 2, page: pages2[h.id] })), null, 1));
const { execFileSync } = await import('child_process');
execFileSync('python3', [path.join(ROOT, 'build', 'outline.py'), PDF, outlineJson], { stdio: 'inherit' });

console.log(`${path.basename(PDF)}: ${n} صفحة · أسئلة: ${byId.size} (سابقات ${counts.past}، أمثلة مذكرة ${counts.ne}، تمارين مذكرة ${counts.nx}) · التدريب ${practice.length}`);
if (over.length) { console.log('تجاوز عرض:'); for (const o of over) console.log('  ', JSON.stringify(o)); }
fs.writeFileSync(path.join(OUT, 'build-4.2-report.json'), JSON.stringify({ pages: n, overflow: over, toc: pages2 }, null, 2));
