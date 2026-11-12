// بناء ملفات PDF الثلاثة: المذكرة، أسئلة التدريب، التلميحات والحلول.
// التشغيل: node build/build.mjs   (أو: npm run build)
// اختياري: node build/build.mjs memo   لبناء ملف واحد فقط (memo | practice | solutions)
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import {
  ROOT, CONTENT, EXAMS, EXCLUDED, loadSections, indexQuestions, sourceLine,
  makeMarkdown, qidChip, marksChip, questionMath, mathBlockHtml, readText, tex,
} from './lib.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = path.join(ROOT, 'out');
const HTML_DIR = path.join(OUT, 'html');
fs.mkdirSync(HTML_DIR, { recursive: true });

const FILES = {
  memo: { pdf: '1-مذكرة-التعلم.pdf', html: 'memo.html', title: 'ريض 111 · مذكرة التعلم' },
  practice: { pdf: '2-أسئلة-التدريب.pdf', html: 'practice.html', title: 'ريض 111 · أسئلة التدريب' },
  solutions: { pdf: '3-التلميحات-والحلول.pdf', html: 'solutions.html', title: 'ريض 111 · التلميحات والحلول' },
};

const sections = loadSections();
const byId = indexQuestions(sections);
const allIds = [...byId.keys()];
if (allIds.length !== 58) throw new Error(`عدد الأسئلة ${allIds.length} والمفروض 58`);

const used = new Set();
const md = makeMarkdown({ byId, used });

// ---------- أجزاء مشتركة ----------
function sourceText(q) {
  const s = sourceLine(q.id);
  return `${s.year} · الفصل ${s.sem} · س${s.q} فقرة ${s.part} · ص${q.page}`;
}

function answerBlock(q) {
  const why = q.domain_why ? `<div class="dom-why">${md.renderInline(q.domain_why)}</div>` : '';
  const dom = q.domain ? `<div class="domain"><span class="lbl">المجال</span><span class="m-ltr">${mathBlockHtml(q.domain)}</span></div>${why}` : '';
  return `<div class="answer"><div class="ans-label">الجواب</div>${mathBlockHtml(q.answer)}</div>${dom}`;
}

function notesBlock(q) {
  let h = '';
  if (q.fix) h += `<div class="box box-fix"><div class="box-title">تصحيح للمفتاح المطبوع</div><div class="box-body">${renderMd(q.fix)}</div></div>`;
  if (q.note) h += `<div class="box box-note"><div class="box-title">ملاحظة</div><div class="box-body">${renderMd(q.note)}</div></div>`;
  if (q.more) h += `<div class="box box-more"><div class="box-title">إذا احتجت</div><div class="box-body">${renderMd(q.more)}</div></div>`;
  return h;
}

function solutionBody(q) {
  return `<div class="sol-steps">${renderMd(q.solution)}</div>${answerBlock(q)}${notesBlock(q)}`;
}

function workedExample(q) {
  used.add(q.id);
  return `<div class="example">
  <div class="ex-head"><span class="ex-label">مثال كامل</span>${qidChip(q.id)}<span class="src">${sourceText(q)}</span>${marksChip(q)}</div>
  ${questionMath(q)}
  ${solutionBody(q)}
</div>`;
}

// ---------- قالب HTML ----------
function nm(p) { return 'file://' + path.join(ROOT, 'node_modules', p); }
function page(kind, title, body) {
  const css = readText(path.join(ROOT, 'build', 'style.css'));
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="stylesheet" href="${nm('katex/dist/katex.min.css')}">
<link rel="stylesheet" href="${nm('@fontsource/ibm-plex-sans-arabic/400.css')}">
<link rel="stylesheet" href="${nm('@fontsource/ibm-plex-sans-arabic/600.css')}">
<link rel="stylesheet" href="${nm('@fontsource/ibm-plex-sans-arabic/700.css')}">
<style>${css}</style>
</head>
<body class="doc-${kind}">
${body}
</body>
</html>`;
}

// المحتوى المكتوب بـ Markdown مع أوامر: @example ID ، @toc ، @tri مقابل|مجاور|وتر
function renderMd(text) {
  const holders = [];
  const pre = text.replace(/^([ \t]*)@(example|toc|tri)(?:[ \t]+(.+?))?[ \t]*$/gm, (_, indent, cmd, arg) => {
    holders.push([cmd, arg]);
    return `\n${indent}<div class="holder" data-n="${holders.length - 1}"></div>\n\n`;
  });
  let html = md.render(pre);
  html = html.replace(/<div class="holder" data-n="(\d+)"><\/div>/g, (_, n) => {
    const [cmd, arg] = holders[Number(n)];
    if (cmd === 'example') {
      const q = byId.get(arg);
      if (!q) throw new Error('@example: سؤال غير موجود ' + arg);
      return workedExample(q);
    }
    if (cmd === 'toc') return '<nav class="toc" id="toc"></nav>';
    if (cmd === 'tri') return triangle(arg);
    return '';
  });
  return html;
}

// مثلث قائم: الزاوية θ تحت يسار، والقائمة تحت يمين
function triangle(spec) {
  const [opp, adj, hyp] = spec.split('|').map((t) => t.trim());
  return `<div class="tri" dir="ltr">
<svg viewBox="0 0 200 110" width="200" height="110" aria-hidden="true">
<polygon points="20,92 160,92 160,18" fill="#eef6f8" stroke="#0e5a6f" stroke-width="1.7"/>
<polyline points="150,92 150,82 160,82" fill="none" stroke="#0e5a6f" stroke-width="1.1"/>
<path d="M 48 92 A 28 28 0 0 0 44.7 78.9" fill="none" stroke="#a35a00" stroke-width="1.4"/>
</svg>
<span class="tri-l tri-opp">${tex(opp, false)}</span>
<span class="tri-l tri-adj">${tex(adj, false)}</span>
<span class="tri-l tri-hyp">${tex(hyp, false)}</span>
<span class="tri-l tri-th">${tex('\\theta', false)}</span>
</div>`;
}

function mdFiles(dir) {
  const d = path.join(CONTENT, dir);
  return fs.readdirSync(d).filter((f) => f.endsWith('.md')).sort().map((f) => path.join(d, f));
}

// ---------- 1) المذكرة ----------
function buildMemo() {
  const parts = mdFiles('memo').map((f) => renderMd(readText(f)));
  return page('memo', FILES.memo.title, parts.join('\n'));
}

// ---------- 2) أسئلة التدريب ----------
function buildPractice() {
  const dir = path.join(CONTENT, 'practice');
  let body = renderMd(readText(path.join(dir, 'cover.md')));
  body += '<h1 class="part" id="part1">الجزء الأول: حسب الدرس والنمط</h1>';
  body += renderMd(readText(path.join(dir, 'part1.md')));
  for (const s of sections) {
    body += `<h1 id="p-${s.slug}"><span class="secno">${s.section}</span>${s.title}</h1>`;
    for (const p of s.patterns) {
      body += `<h2 id="p-${s.slug}-${p.key}">${p.title}</h2>`;
      for (const q of p.questions) {
        body += `<div class="qcard" id="pq-${q.id}">
  <div class="q-head">${qidChip(q.id)}<span class="src">${sourceText(q)}</span>${marksChip(q)}<span class="ticks"><span class="tick">حليته</span><span class="tick">أعيده</span></span></div>
  ${questionMath(q)}
  <div class="space"></div>
</div>`;
      }
    }
  }
  body += '<h1 class="part" id="part2">الجزء الثاني: النماذج بترتيبها الأصلي</h1>';
  body += renderMd(readText(path.join(dir, 'part2.md')));
  for (const exam of Object.keys(EXAMS)) {
    const e = EXAMS[exam];
    const ids = allIds.filter((id) => id.startsWith(exam)).sort(cmpId);
    body += `<h2 id="exam-${exam}">${e.year} · الفصل ${e.sem}</h2>`;
    for (const id of ids) {
      const q = byId.get(id);
      body += `<div class="qline"><div class="q-head">${qidChip(id)}${marksChip(q)}</div>${questionMath(q)}</div>`;
    }
    const ex = EXCLUDED[exam];
    if (ex.length) body += `<p class="excluded">محذوف من هالنموذج لأنه من الدرس السابق: ${ex.map((i) => `<span class="qid">${i}</span>`).join('، ')}.</p>`;
  }
  return page('practice', FILES.practice.title, body);
}

function cmpId(a, b) {
  const pa = a.split('-').map((x, i) => (i ? Number(x) : x));
  const pb = b.split('-').map((x, i) => (i ? Number(x) : x));
  return pa[0] === pb[0] ? (pa[1] - pb[1] || pa[2] - pb[2]) : (pa[0] < pb[0] ? -1 : 1);
}

// ---------- 3) التلميحات والحلول ----------
function buildSolutions() {
  const dir = path.join(CONTENT, 'solutions');
  let body = renderMd(readText(path.join(dir, 'cover.md')));
  body += '<h1 class="part" id="hints">القسم الأول: التلميحات</h1>';
  body += renderMd(readText(path.join(dir, 'hints.md')));
  for (const s of sections) {
    body += `<h2 id="h-${s.slug}"><span class="secno">${s.section}</span>${s.title}</h2>`;
    for (const p of s.patterns) {
      body += `<div class="hint-group"><div class="hint-pattern">${p.title}</div>`;
      for (const q of p.questions) {
        body += `<div class="hint" id="hint-${q.id}"><div class="hint-head">${qidChip(q.id, 'sol-' + q.id)}<a class="go" href="#sol-${q.id}">الحل الكامل</a></div><div class="hint-body">${renderMd(q.hint)}</div></div>`;
      }
      body += '</div>';
    }
  }
  body += '<h1 class="part" id="solutions">القسم الثاني: الحلول الكاملة</h1>';
  body += renderMd(readText(path.join(dir, 'solutions.md')));
  for (const s of sections) {
    body += `<h1 id="s-${s.slug}"><span class="secno">${s.section}</span>${s.title}</h1>`;
    for (const p of s.patterns) {
      body += `<h2 id="s-${s.slug}-${p.key}">${p.title}</h2>`;
      for (const q of p.questions) {
        body += `<div class="solution" id="sol-${q.id}">
  <div class="ex-head"><span class="ex-label">حل</span>${qidChip(q.id, 'hint-' + q.id)}<span class="src">${sourceText(q)}</span>${marksChip(q)}</div>
  ${questionMath(q)}
  ${solutionBody(q)}
</div>`;
      }
    }
  }
  body += renderMd(readText(path.join(dir, 'appendix.md')));
  return page('solutions', FILES.solutions.title, body);
}

// ---------- الطباعة إلى PDF ----------
const CONTENT_WIDTH_PX = (124 / 25.4) * 96; // عرض النص في صفحة A5 بعد الهوامش

async function outlinePages(pdfPath) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data, verbosity: 0 }).promise;
  const outline = (await doc.getOutline()) || [];
  const flat = [];
  async function walk(items) {
    for (const it of items) {
      let dest = it.dest;
      if (typeof dest === 'string') dest = await doc.getDestination(dest);
      let pageNo = null;
      if (Array.isArray(dest)) pageNo = (await doc.getPageIndex(dest[0])) + 1;
      flat.push({ title: it.title.trim(), page: pageNo });
      if (it.items && it.items.length) await walk(it.items);
    }
  }
  await walk(outline);
  const numPages = doc.numPages;
  await doc.destroy();
  return { flat, numPages };
}

async function printPdf(browser, kind) {
  const f = FILES[kind];
  const htmlPath = path.join(HTML_DIR, f.html);
  const pdfPath = path.join(OUT, f.pdf);
  const pg = await browser.newPage({ viewport: { width: Math.floor(CONTENT_WIDTH_PX), height: 900 } });
  await pg.emulateMedia({ media: 'print' });
  await pg.goto('file://' + htmlPath);
  await pg.evaluate(() => document.fonts.ready);

  // فحص: معادلات أو صناديق أعرض من الصفحة
  const overflow = await pg.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('.eq')) {
      if (el.scrollWidth > el.clientWidth + 1) out.push({ tex: el.dataset.tex, over: el.scrollWidth - el.clientWidth });
    }
    const W = document.body.clientWidth;
    for (const el of document.querySelectorAll('.box, .example, .solution, .qcard, .diff, .hint, table')) {
      const r = el.getBoundingClientRect();
      if (r.width > W + 1) out.push({ box: el.className, over: r.width - W });
    }
    return out;
  });

  // جمع العناوين لفهرس المحتويات
  const heads = await pg.evaluate(() => [...document.querySelectorAll('h1[id], h2[id]')].map((h) => ({ id: h.id, level: h.tagName, text: h.textContent.trim(), html: h.innerHTML })));
  const tocWanted = await pg.evaluate(() => !!document.getElementById('toc'));

  const opts = { path: pdfPath, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true };
  if (tocWanted) {
    // الجولة الأولى: فهرس بأرقام مؤقتة
    await pg.evaluate((heads) => {
      const nav = document.getElementById('toc');
      nav.innerHTML = '<div class="toc-title">المحتوى</div>' + heads.filter((h) => h.level === 'H1').map((h) => `<a class="toc-row" href="#${h.id}"><span class="toc-text">${h.html}</span><span class="toc-dots"></span><span class="toc-page" data-id="${h.id}">00</span></a>`).join('');
    }, heads);
    await pg.pdf(opts);
    const { flat } = await outlinePages(pdfPath);
    const pages = mapHeadingsToPages(heads, flat);
    await pg.evaluate((pages) => {
      for (const el of document.querySelectorAll('.toc-page')) el.textContent = pages[el.dataset.id] ?? '?';
    }, pages);
    await pg.pdf(opts);
    const second = mapHeadingsToPages(heads, (await outlinePages(pdfPath)).flat);
    for (const k of Object.keys(pages)) if (pages[k] !== second[k]) console.warn(`تحذير: رقم صفحة ${k} تغير بين الجولتين`);
  } else {
    await pg.pdf(opts);
  }
  const { numPages } = await outlinePages(pdfPath);
  await pg.close();
  return { pdfPath, numPages, overflow };
}

function mapHeadingsToPages(heads, flat) {
  const res = {};
  let j = 0;
  for (const h of heads) {
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    let k = j;
    while (k < flat.length && norm(flat[k].title) !== norm(h.text)) k++;
    if (k < flat.length) { res[h.id] = flat[k].page; j = k + 1; }
  }
  return res;
}

// ---------- التشغيل ----------
const only = process.argv[2];
const kinds = only ? [only] : ['memo', 'practice', 'solutions'];
const builders = { memo: buildMemo, practice: buildPractice, solutions: buildSolutions };

for (const k of kinds) {
  const html = builders[k]();
  fs.writeFileSync(path.join(HTML_DIR, FILES[k].html), html);
}

if (!only || only === 'memo') {
  const missing = allIds.filter((id) => !used.has(id));
  if (missing.length) console.warn('أسئلة ما ذُكرت في المذكرة: ' + missing.join(' '));
}

const browser = await chromium.launch();
const report = {};
for (const k of kinds) {
  const r = await printPdf(browser, k);
  report[k] = { pages: r.numPages, overflow: r.overflow };
  console.log(`${FILES[k].pdf}: ${r.numPages} صفحة` + (r.overflow.length ? ` — تجاوز عرض: ${r.overflow.length}` : ''));
  for (const o of r.overflow) console.log('   ', JSON.stringify(o));
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'build-report.json'), JSON.stringify(report, null, 2));
