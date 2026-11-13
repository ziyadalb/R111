// بناء ملف 5.1 و5.2 (A4): شرح + أنماط + تدريب + تلميحات + حلول + ملحق
// التشغيل: node build/build-5x.mjs
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { createRequire } from 'module';
import { ROOT, CONTENT, makeMarkdown, marksChip, questionMath, mathBlockHtml, readText, tex } from './lib.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = path.join(ROOT, 'out');
const HTML = path.join(OUT, 'html', '5x.html');
const PDF = path.join(OUT, 'ريض111-5.1-5.2-التجزئة-والتكاملات-المثلثية.pdf');
fs.mkdirSync(path.dirname(HTML), { recursive: true });

// ---------- البيانات ----------
const load = (p) => yaml.load(fs.readFileSync(p, 'utf8'));
const files = [
  path.join(CONTENT, 'questions', '5.1.yaml'),
  path.join(CONTENT, 'questions', '5.2.yaml'),
  path.join(CONTENT, '5x', 'data', 'finals.yaml'),
  path.join(CONTENT, '5x', 'data', 'notes51.yaml'),
  path.join(CONTENT, '5x', 'data', 'notes52.yaml'),
];
const PATTERNS = load(path.join(CONTENT, '5x', 'patterns.yaml')).patterns;
PATTERNS.forEach((p, i) => { p.n = i + 1; });
const titleHtml = (p) => p.titleHtml ?? (p.titleHtml = md.renderInline(p.title));
const PAT = Object.fromEntries(PATTERNS.map((p) => [p.key, p]));

const byId = new Map();
for (const file of files) {
  const doc = load(file);
  for (const p of doc.patterns) {
    for (const q of p.questions) {
      if (byId.has(q.id)) throw new Error('مكرر: ' + q.id);
      q.sec = doc.section;
      q.src = q.id[0] === 'F' ? 'fin' : q.id[0] === 'M' ? 'mid' : q.kind === 'example' ? 'ne' : 'nx';
      byId.set(q.id, q);
    }
  }
}
for (const p of PATTERNS) {
  p.qs = p.ids.map((id) => {
    const q = byId.get(id);
    if (!q) throw new Error(`النمط ${p.key}: سؤال غير موجود ${id}`);
    if (q.pat) throw new Error(`السؤال ${id} في نمطين`);
    q.pat = p;
    return q;
  });
}
for (const q of byId.values()) if (!q.pat) throw new Error('سؤال بدون نمط: ' + q.id);
const practice = PATTERNS.flatMap((p) => p.qs);
const counts = { mid: 0, fin: 0, ne: 0, nx: 0 };
for (const q of byId.values()) counts[q.src]++;

// ---------- رموز وأوسمة ----------
function examInfo(id) {
  const year = 1400 + Number(id.slice(1, 3));
  const sem = id[3] === '1' ? 'الأول' : 'الثاني';
  const [, qn, part] = id.split('-');
  return { year, sem, qn, part, fin: id[0] === 'F' };
}
const isPast = (q) => q.src === 'mid' || q.src === 'fin';
function tag(q) {
  if (isPast(q)) {
    const e = examInfo(q.id);
    const kind = e.fin ? 'نهائي' : 'فصلي';
    const cls = e.fin ? 'tag-fin' : 'tag-past';
    return e.year === 1447
      ? `<span class="tag tag-last">${kind} 1447 · السنة الماضية</span>`
      : `<span class="tag ${cls}">${kind} ${e.year}</span>`;
  }
  return `<span class="tag tag-notes">من المذكرة</span>`;
}
function label(q) {
  if (isPast(q)) return `<span class="qid${q.src === 'fin' ? ' qid-fin' : ''}">${q.id}</span>`;
  return `<span class="qid qid-notes">${q.sec} · ${q.ref}</span>`;
}
function srcText(q) {
  if (isPast(q)) {
    const e = examInfo(q.id);
    return `الفصل ${e.sem} · س${e.qn} فقرة ${e.part}`;
  }
  return `المذكرة ص${q.page}`;
}
function head(q, extra = '') {
  return `${label(q)}${tag(q)}<span class="src">${srcText(q)}</span>${marksChip(q)}${extra}`;
}

const CAME = { mid: 'جاء في الفصلي الثاني', fin: 'جاء في النهائي', notes: 'المذكرة بس' };
function patternMeta(p) {
  const past = p.qs.filter(isPast).length;
  const notes = p.qs.length - past;
  const tags = p.came.map((c) => `<span class="came came-${c}">${CAME[c]}</span>`).join('');
  const cnt = past ? `${p.qs.length} سؤال: ${past} سابقات و${notes} مذكرة` : `${p.qs.length} أسئلة من المذكرة`;
  return `<div class="pat-meta">${tags}<span class="pat-count">${cnt}</span><a class="plink" href="#pr-${p.key}">تدريبه</a></div>`;
}
const pk = (p) => `<span class="pk">${p.sec} · النمط ${p.n}</span>`;

const used = new Set();
const md = makeMarkdown({ byId, used, diffHead: (q) => `${label(q)}${tag(q)}${marksChip(q)}` });

// الخانات الأربع في سطر واحد (u, dv, du, v) تنعرض شبكة 2×2 عشان تدخل في عمود المعادلات
const FOUR = /^\s*u=(.+?),\\qquad dv=(.+?),\\qquad du=(.+?),\\qquad v=(.+?)\s*$/s;
md.renderer.rules.math_block = (tokens, idx) => {
  let t = tokens[idx].content;
  const m = t.match(FOUR);
  if (m) t = `\\begin{aligned}u&=${m[1]},&\\qquad dv&=${m[2]}\\\\du&=${m[3]},&\\qquad v&=${m[4]}\\end{aligned}`;
  return mathBlockHtml(t) + '\n';
};

// ---------- أجزاء مكررة ----------
function box(type, title, body) {
  return `<div class="box box-${type}"><div class="box-title">${title}</div><div class="box-body">${body}</div></div>`;
}
function answerBlock(q) {
  const why = q.domain_why ? `<div class="dom-why">${md.renderInline(q.domain_why)}</div>` : '';
  const dom = q.domain ? `<div class="dom-chip"><span class="lbl">المجال</span><span class="m">${tex(q.domain, false)}</span></div>` : '';
  return `<div class="answer"><div class="ans-label">الجواب</div>${mathBlockHtml(q.answer)}${dom}</div>${why}`;
}
function notesBlock(q) {
  let h = '';
  if (q.fix) h += box('fix', isPast(q) ? 'تصحيح للمفتاح المطبوع' : 'تصحيح لحل المذكرة', renderMd(q.fix));
  if (q.note) h += box('note', 'ملاحظة', renderMd(q.note));
  if (q.more) h += box('more', 'إذا احتجت', renderMd(q.more));
  return h;
}
function solutionBody(q) {
  return `<div class="sol-steps">${renderMd(q.solution)}</div>${answerBlock(q)}${notesBlock(q)}`;
}
function workedExample(q) {
  used.add(q.id);
  q.worked = true;
  const lbl = 'مثال كامل';
  return `<div class="example${isPast(q) ? '' : ' example-notes'}" id="ex-${q.id}">
  <div class="ex-top"><div class="ex-head"><span class="ex-label">${lbl}</span>${head(q)}</div><div class="ex-q">${mathBlockHtml(q.q)}</div></div>
  ${solutionBody(q)}
</div>`;
}

// ---------- رسمة الغلاف: sin وcos والمساحة تحت sin ----------
function coverArt() {
  const w = 520, h = 230, ox = 40, oy = 118, sx = 52, sy = 62;
  const P = (x, y) => `${(ox + x * sx).toFixed(1)},${(oy - y * sy).toFixed(1)}`;
  const curve = (f, a, b) => {
    let d = '';
    for (let i = 0; i <= 240; i++) { const x = a + ((b - a) * i) / 240; d += `${i ? 'L' : 'M'}${P(x, f(x))}`; }
    return d;
  };
  let area = `M${P(0, 0)}`;
  for (let i = 0; i <= 120; i++) { const x = (Math.PI * i) / 120; area += `L${P(x, Math.sin(x))}`; }
  area += `L${P(Math.PI, 0)}Z`;
  const xmax = (w - ox - 16) / sx;
  return `<svg class="cover-art" viewBox="0 0 ${w} ${h}" aria-hidden="true">
<defs>
<linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f1f4"/><stop offset="1" stop-color="#f7efe1"/></linearGradient>
<linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c97a10" stop-opacity="0.45"/><stop offset="1" stop-color="#c97a10" stop-opacity="0.12"/></linearGradient>
</defs>
<rect x="0" y="0" width="${w}" height="${h}" rx="18" fill="url(#cg)"/>
<g stroke="#9fb7c0" stroke-width="1">
<line x1="${ox - 20}" y1="${oy}" x2="${w - 14}" y2="${oy}"/>
<line x1="${ox}" y1="${h - 14}" x2="${ox}" y2="14"/>
</g>
${[1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<line x1="${ox + ((k * Math.PI) / 2) * sx}" y1="${oy - 4}" x2="${ox + ((k * Math.PI) / 2) * sx}" y2="${oy + 4}" stroke="#9fb7c0"/>`).join('')}
<path d="${area}" fill="url(#ag)" stroke="none"/>
<path d="${curve(Math.cos, -0.6, xmax)}" fill="none" stroke="#7a4fc9" stroke-width="2.4" stroke-dasharray="7 5" stroke-linecap="round"/>
<path d="${curve(Math.sin, -0.6, xmax)}" fill="none" stroke="#0b5d73" stroke-width="3.4" stroke-linecap="round"/>
<circle cx="${ox}" cy="${oy}" r="3" fill="#0b5d73"/>
<circle cx="${ox + Math.PI * sx}" cy="${oy}" r="4.5" fill="#c97a10" stroke="#fff" stroke-width="1.5"/>
</svg>`;
}

// ---------- Markdown بأوامر ----------
function renderMd(text) {
  const holders = [];
  const pre = text.replace(/^([ \t]*)@(example|toc|cover|pattern|formula)(?:[ \t]+(.+?))?[ \t]*$/gm, (_, indent, cmd, arg) => {
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
    if (cmd === 'pattern') {
      const p = PAT[arg];
      if (!p) throw new Error('@pattern: غير موجود ' + arg);
      return `<h2 id="pat-${p.key}">${pk(p)}${titleHtml(p)}</h2>${patternMeta(p)}`;
    }
    if (cmd === 'toc') return '<nav class="toc" id="toc"></nav>';
    if (cmd === 'cover') return coverArt();
    if (cmd === 'formula') return `<div class="cover-formula">${tex('\\int u\\,dv=uv-\\int v\\,du', true)}</div>`;
    return '';
  });
  // عناوين .h3 مكتوبة HTML، فنعالج الرياضيات اللي داخلها هنا
  html = html.replace(/<div class="h3([^"]*)">([^<]*(?:<(?!\/div>)[^<]*)*)<\/div>/g, (_, cls, inner) => `<div class="h3${cls}">${md.renderInline(inner)}</div>`);
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => ({
    past: counts.mid + counts.fin, mid: counts.mid, fin: counts.fin, notes: counts.ne + counts.nx,
    practice: practice.length, total: byId.size, patterns: PATTERNS.length,
  }[k] ?? `{{${k}}}`));
}

// ---------- أقسام مولّدة ----------
function patHead(p, prefix) {
  return `<h2 id="${prefix}-${p.key}">${pk(p)}${titleHtml(p)}</h2>`;
}
function practiceSection() {
  let h = '';
  for (const p of PATTERNS) {
    h += patHead(p, 'pr');
    h += '<div class="pgrid">';
    for (const q of p.qs) {
      h += `<div class="pcard${q.worked ? ' pcard-worked' : ''}" id="p-${q.id}">
<div class="q-head">${label(q)}${tag(q)}${marksChip(q)}</div>
${questionMath(q)}
<div class="ticks"><span class="tick">حليته</span><span class="tick">أعيده</span><span class="links"><a class="plink" href="#h-${q.id}">تلميح</a><a class="plink" href="#s-${q.id}">الحل</a></span></div>
</div>`;
    }
    h += '</div>';
  }
  return h;
}

function examOrder() {
  const group = (prefix, title) => {
    const exams = [`${prefix}472`, `${prefix}471`, `${prefix}462`, `${prefix}461`, `${prefix}452`, `${prefix}451`];
    let h = `<div class="h3">${title}</div><div class="exam-grid">`;
    for (const ex of exams) {
      const e = examInfo(ex + '-0-0');
      const ids = practice.filter((q) => isPast(q) && q.id.startsWith(ex)).map((q) => q.id)
        .sort((a, b) => { const [, a1, a2] = a.split('-').map(Number); const [, b1, b2] = b.split('-').map(Number); return a1 - b1 || a2 - b2; });
      if (!ids.length) continue;
      h += `<div class="exam-box${e.year === 1447 ? ' exam-last' : ''}"><div class="exam-title">${e.year} · الفصل ${e.sem}${e.year === 1447 ? ' <span class="star">السنة الماضية</span>' : ''}</div><div class="exam-ids">${ids.map((id) => `<a href="#p-${id}"><span class="qid${id[0] === 'F' ? ' qid-fin' : ''}">${id}</span></a>`).join('')}</div></div>`;
    }
    return h + '</div>';
  };
  return group('M', 'الفصلي الثاني') + group('F', 'النهائي');
}

function hintsSection() {
  let h = '';
  for (const p of PATTERNS) {
    h += patHead(p, 'hi');
    h += '<div class="hgrid">';
    for (const q of p.qs) {
      if (!q.hint) throw new Error('تلميح ناقص: ' + q.id);
      // رابط الحل في آخر سطر من التلميح (يوفّر سطر في كل بطاقة)
      let body = renderMd(q.hint).trim();
      const link = ` <a class="go-inline" href="#s-${q.id}">الحل ←</a>`;
      body = body.endsWith('</p>') ? body.slice(0, -4) + link + '</p>' : body + `<p class="go-line">${link}</p>`;
      h += `<div class="hint" id="h-${q.id}"><div class="hint-head">${label(q)}<span class="hint-q">${tex(q.q, false)}</span></div><div class="hint-body">${body}</div></div>`;
    }
    h += '</div>';
  }
  return h;
}

function solutionsSection() {
  let h = '';
  for (const p of PATTERNS) {
    h += patHead(p, 'so');
    for (const q of p.qs) {
      const top = `<div class="sol-top"><div class="ex-head"><span class="ex-label">حل</span>${head(q)}<a class="go" href="#p-${q.id}">السؤال</a></div><div class="sol-q">${mathBlockHtml(q.q)}</div></div>`;
      if (q.worked) {
        h += `<div class="solution sol-linked" id="s-${q.id}">${top}
<p class="linked">محلول خطوة بخطوة في الشرح: <a href="#ex-${q.id}">اضغط هنا وارجع للمثال الكامل</a>. وهذا جوابه للتأكد:</p>
${answerBlock(q)}</div>`;
      } else {
        h += `<div class="solution" id="s-${q.id}">${top}${solutionBody(q)}</div>`;
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
    scope: "<rect x='4' y='4' width='16' height='16' rx='2'/><path d='M8 9h8M8 13h8M8 17h5'/>",
  };
  let css = '';
  for (const [k, inner] of Object.entries(ic)) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'>${inner}</svg>`;
    css += `.box-${k}{--icon:url("data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}")}\n`;
  }
  return css;
}

const LEARN = ['10-parts.md', '11-p1.md', '12-p2.md', '13-p3.md', '14-p4.md', '15-p5.md',
  '20-trig.md', '21-q1.md', '22-q2.md', '23-q3.md', '24-q4.md', '25-q5.md', '30-review.md'];

function build() {
  const dir = path.join(CONTENT, '5x');
  const part = (f) => renderMd(readText(path.join(dir, f)));
  let body = '';
  body += `<section class="pg-cover">${part('00-cover.md')}</section>`;
  body += `<section class="pg-start">${part('05-start.md')}</section>`;
  body += `<section class="pg-learn">${LEARN.map(part).join('\n')}</section>`;
  body += `<section class="pg-practice">${part('60-practice.md')}${practiceSection()}<h2 id="pr-exams">النماذج بترتيبها الأصلي</h2>${part('61-exams.md')}${examOrder()}</section>`;
  body += `<section class="pg-hints">${part('70-hints.md')}${hintsSection()}</section>`;
  body += `<section class="pg-sols">${part('80-solutions.md')}${solutionsSection()}</section>`;
  body += `<section class="pg-appx">${part('90-appendix.md')}</section>`;
  const css = readText(path.join(ROOT, 'build', 'style-5x.css')) + iconCss();
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>ريض 111 · 5.1 و5.2 التجزئة والتكاملات المثلثية</title>
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
const missing = [...byId.values()].filter((q) => isPast(q) && !used.has(q.id));
if (missing.length) console.warn('أسئلة سابقات ما انذكرت في الشرح:', missing.map((q) => q.id).join(' '));

const browser = await chromium.launch();
// عرض منطقة الكتابة في A4 = 210 − 2×15 = 180mm
const pg = await browser.newPage({ viewport: { width: Math.floor((180 / 25.4) * 96), height: 1100 } });
await pg.emulateMedia({ media: 'print' });
await pg.goto('file://' + HTML);
await pg.evaluate(() => document.fonts.ready);

// الخطوات: السبب يمين والمعادلات يسار في نفس السطر، والمعادلة الطويلة تاخذ العرض كامل
const layout = await pg.evaluate(() => {
  let grid = 0, stacked = 0;
  for (const li of document.querySelectorAll('.sol-steps ol > li')) {
    const kids = [...li.childNodes];
    const isEq = (n) => n.nodeType === 1 && n.classList.contains('eq');
    const blank = (n) => n.nodeType === 3 && !n.textContent.trim();
    const first = kids.findIndex(isEq);
    if (first <= 0) continue;
    const lead = kids.slice(0, first);
    if (lead.every(blank)) continue;
    const rest = kids.slice(first);
    if (!rest.every((n) => isEq(n) || blank(n))) continue;
    const why = document.createElement('div');
    why.className = 'st-why';
    const eqs = document.createElement('div');
    eqs.className = 'st-eqs';
    lead.forEach((n) => why.appendChild(n));
    rest.filter(isEq).forEach((n) => eqs.appendChild(n));
    rest.filter(blank).forEach((n) => n.remove());
    li.append(why, eqs);
    li.classList.add('st-grid');
    grid++;
  }
  for (const li of document.querySelectorAll('li.st-grid')) {
    const why0 = li.querySelector('.st-why');
    const tooWide = [...li.querySelectorAll('.st-eqs .eq')].some((el) => el.scrollWidth > el.clientWidth + 2)
      || why0.scrollWidth > why0.clientWidth + 2
      || [...why0.querySelectorAll('.m')].some((m) => m.getBoundingClientRect().width > why0.clientWidth);
    const longWhy = li.querySelector('.st-why').getBoundingClientRect().height > 4.2 * parseFloat(getComputedStyle(li).lineHeight || 20);
    if (tooWide || longWhy) { li.classList.remove('st-grid'); li.classList.add('st-stack'); stacked++; }
  }
  return { grid, stacked };
});

const over = await pg.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('.eq')) if (el.scrollWidth > el.clientWidth + 3) out.push(['eq', el.dataset.tex, el.scrollWidth - el.clientWidth]);
  const W = document.body.clientWidth;
  for (const el of document.querySelectorAll('.box, .example, .solution, .pcard, .diff, .hint, table, .exam-grid')) {
    const r = el.getBoundingClientRect();
    if (r.width > W + 1) out.push(['box', el.className, r.width - W]);
  }
  return out;
});
const heads = await pg.evaluate(() => [...document.querySelectorAll('h1[id], h2[id]')].map((h) => {
  const num = h.querySelector('.num');
  const pkEl = h.querySelector('.pk');
  let text = h.textContent;
  if (num) text = text.replace(num.textContent, num.textContent + ' · ');
  if (pkEl) text = text.replace(pkEl.textContent, pkEl.textContent + ' · ');
  return { id: h.id, lvl: h.tagName, text: text.replace(/\s+/g, ' ').trim(), html: h.innerHTML, learn: !!h.closest('.pg-learn') };
}));
const opts = { path: PDF, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true };

await pg.evaluate((heads) => {
  const nav = document.getElementById('toc');
  if (!nav) return;
  nav.innerHTML = heads.filter((h) => h.lvl === 'H1' || h.learn).map((h) => `<a class="toc-row toc-${h.lvl.toLowerCase()}" href="#${h.id}"><span class="toc-text">${h.html}</span><span class="toc-dots"></span><span class="toc-page" data-id="${h.id}">00</span></a>`).join('');
}, heads);
await pg.pdf(opts);
// عناوين Chromium في الـ outline تطلع مقلوبة الكلمات بالعربي، فنربط بالترتيب بس
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
const outlineJson = path.join(OUT, 'html', 'outline-5x.json');
fs.writeFileSync(outlineJson, JSON.stringify(heads.map((h) => ({ title: h.text, level: h.lvl === 'H1' ? 1 : 2, page: pages2[h.id] })), null, 1));
const { execFileSync } = await import('child_process');
execFileSync('python3', [path.join(ROOT, 'build', 'outline.py'), PDF, outlineJson], { stdio: 'inherit' });

const sections = Object.fromEntries(heads.filter((h) => h.lvl === 'H1').map((h) => [h.text, pages2[h.id]]));
console.log(`${path.basename(PDF)}: ${n} صفحة · أسئلة: ${byId.size} (فصلي ${counts.mid}، نهائي ${counts.fin}، أمثلة مذكرة ${counts.ne}، تمارين مذكرة ${counts.nx}) · خطوات بعمودين ${layout.grid - layout.stacked}، بسطر كامل ${layout.stacked}`);
console.log('بداية الأقسام:', JSON.stringify(sections));
if (over.length) { console.log('تجاوز عرض:'); for (const o of over) console.log('  ', JSON.stringify(o)); }
fs.writeFileSync(path.join(OUT, 'build-5x-report.json'), JSON.stringify({ pages: n, overflow: over, toc: pages2, layout }, null, 2));
