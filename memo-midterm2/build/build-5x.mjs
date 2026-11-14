// بناء ملف 5.1 و5.2 (A4): التكامل بالتجزئة والتكاملات المثلثية
// التشغيل: node build/build-5x.mjs
// نفس نظام ملف 5.3: بدون صفحة تلميحات، والتدريب تحت كل نمط، وكل سؤال له رابط لحله الكامل والحل فيه رابط يرجعك.
// والحلول بحيل بدل u وdu: القوة العكسية، خمّن واشتق، وجدول التجزئة (@di).
// أسئلة الاختبارات كلها، ومن المذكرة 3 مسائل بس (اللي في patterns.yaml).
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
const PCONF = load(path.join(CONTENT, '5x', 'patterns.yaml'));
const PATTERNS = PCONF.patterns;
const SAME = PCONF.same || {};
const CHECKS = load(path.join(CONTENT, '5x', 'checks.yaml')).groups;
PATTERNS.forEach((p, i) => { p.n = i + 1; });
const titleHtml = (p) => p.titleHtml ?? (p.titleHtml = md.renderInline(p.title));
const PAT = Object.fromEntries(PATTERNS.map((p) => [p.key, p]));
const dupOf = new Map();
for (const [main, dups] of Object.entries(SAME)) for (const d of dups) dupOf.set(d, main);

// نأخذ بس الأسئلة اللي في الأنماط (ومسائل المذكرة الباقية تبقى في ملفاتها متحقق منها، بس ما تنعرض)
const WANTED = new Set(PATTERNS.flatMap((p) => p.ids));
const byId = new Map();
for (const file of files) {
  const doc = load(file);
  for (const p of doc.patterns) {
    for (const q of p.questions) {
      if (dupOf.has(q.id) || !WANTED.has(q.id)) continue; // مكرر بالضبط، أو مسألة مذكرة ما اخترناها
      if (byId.has(q.id)) throw new Error('مكرر: ' + q.id);
      q.src = q.id[0] === 'F' ? 'fin' : q.id[0] === 'M' ? 'mid' : q.kind === 'example' ? 'ne' : 'nx';
      q.same = SAME[q.id] || [];
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
// الأمثلة الكاملة نعرفها من ملفات الشرح قبل الرسم
const WORKED = new Set();
for (const f of fs.readdirSync(path.join(CONTENT, '5x')).filter((f) => f.endsWith('.md'))) {
  for (const m of fs.readFileSync(path.join(CONTENT, '5x', f), 'utf8').matchAll(/^[ \t]*@example[ \t]+(\S+)/gm)) WORKED.add(m[1]);
}
const counts = { mid: 0, fin: 0, ne: 0, nx: 0 };
for (const q of byId.values()) counts[q.src]++;
const dupCount = { mid: 0, fin: 0 };
for (const d of dupOf.keys()) dupCount[d[0] === 'F' ? 'fin' : 'mid']++;

// ---------- رموز وأوسمة ----------
function examInfo(id) {
  const year = 1400 + Number(id.slice(1, 3));
  const sem = id[3] === '1' ? 'الأول' : 'الثاني';
  const [, qn, part] = id.split('-');
  return { year, sem, qn, part, fin: id[0] === 'F' };
}
const isPast = (q) => q.src === 'mid' || q.src === 'fin';
const examName = (q) => { const e = examInfo(q.id); return `${e.fin ? 'نهائي' : 'فصلي'} ${e.year}`; };
function tag(q) {
  if (!isPast(q)) return '';
  const e = examInfo(q.id);
  return e.year === 1447
    ? `<span class="tag tag-last">${examName(q)} · السنة الماضية</span>`
    : `<span class="tag tag-past">${examName(q)}</span>`;
}
const sameText = (q) => (q.same.length ? `<span class="same">ونفسه بالضبط: ${q.same.map((d) => `<span class="qid">${d}</span>`).join(' ')}</span>` : '');
function label(q) {
  if (isPast(q)) return `<span class="qid">${q.id}</span>`;
  return `<span class="qid qid-notes">${q.ref}</span>`;
}
function srcText(q) {
  if (isPast(q)) {
    const e = examInfo(q.id);
    return `الفصل ${e.sem} · س${e.qn} فقرة ${e.part}`;
  }
  return `المذكرة ص${q.page}`;
}
function head(q, extra = '') {
  return `${label(q)}${tag(q)}<span class="src">${srcText(q)}</span>${marksChip(q)}${sameText(q)}${extra}`;
}
function marksText(q) {
  if (q.marks == null) return '';
  const m = Number(q.marks);
  return m === 1 ? 'درجة' : m === 2 ? 'درجتين' : m >= 3 && m <= 10 && Number.isInteger(m) ? `${m} درجات` : `${m} درجة`;
}

const countText = (n) => (n === 1 ? 'سؤال واحد' : n === 2 ? 'سؤالين' : n <= 10 ? `${n} أسئلة` : `${n} سؤال`);
const CAME = { mid: 'جاء في الفصلي الثاني', fin: 'جاء في النهائي', notes: 'المذكرة بس' };
function patternMeta(p) {
  const past = p.qs.filter(isPast).length;
  const notes = p.qs.length - past;
  const tags = p.came.map((c) => `<span class="came came-${c}">${CAME[c]}</span>`).join('');
  const cnt = !past ? `${countText(p.qs.length)} من المذكرة` : !notes ? `${countText(p.qs.length)}، كلها من الاختبارات` : `${countText(p.qs.length)}: ${past} من الاختبارات و${notes} من المذكرة`;
  return `<div class="pat-meta">${tags}<span class="pat-count">${cnt}</span><a class="plink" href="#pr-${p.key}">تدريبه</a></div>`;
}
// عنوان النمط بنص عادي للفهرس الجانبي (Bookmarks)
const plainTitle = (t) => t.replace(/\$/g, '').replace(/\\(sinh|cosh|sin|cos|tan|sec|cot|csc|ln)/g, '$1').replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim();
const pk = (p) => `<span class="pk">${p.sec} · النمط ${p.n}</span>`;

const used = new Set();
const md = makeMarkdown({ byId, used, diffHead: (q) => `${label(q)}${tag(q)}${marksChip(q)}` });

// ---------- جدول التجزئة ----------
// @di نشتق & نكامل ;; نشتق & نكامل ;; ...  والصف اللي يبدأ بـ ! هو اللي نكامل ضربه (نوقف عنده)
// الإشارات + − + بالتناوب، وسهم قطري ↙ من خانة «نشتق» للي تحتها في «نكامل».
function diTable(arg, cls = '') {
  const rows = arg.split(';;').map((r) => r.trim()).filter(Boolean).map((r) => {
    const stop = r.startsWith('!');
    const parts = (stop ? r.slice(1) : r).split('&').map((t) => t.trim());
    if (parts.length !== 2) throw new Error('@di: صف لازم يكون «نشتق & نكامل»: ' + r);
    return { d: parts[0], i: parts[1], stop };
  });
  const cell = (t) => `<span class="m">${tex('\\displaystyle ' + t, false)}</span>`;
  const body = rows.map((r, k) => {
    const zero = r.d === '0';
    const sign = zero ? '' : k % 2 === 0 ? '+' : '−';
    const mid = r.stop ? '<span class="di-x">×</span>' : k < rows.length - 1 && !zero ? '<span class="di-arr">↙</span>' : '';
    return `<tr class="${r.stop ? 'di-stop' : ''}${zero ? ' di-zero' : ''}"><td class="di-sg">${sign}</td><td class="di-d">${cell(r.d)}</td><td class="di-mid">${mid}</td><td class="di-i">${cell(r.i)}</td></tr>`;
  }).join('');
  return `<table class="di${cls ? ' ' + cls : ''}"><thead><tr><th class="di-sg"></th><th>نشتق</th><th class="di-mid"></th><th>نكامل</th></tr></thead><tbody>${body}</tbody></table>`;
}

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
  return `<div class="example${isPast(q) ? '' : ' example-notes'}" id="ex-${q.id}">
  <div class="ex-top"><div class="ex-head"><span class="ex-label">مثال كامل</span>${head(q)}</div><div class="ex-q">${mathBlockHtml(q.q)}</div></div>
  ${solutionBody(q)}
</div>`;
}

// بطاقة تدريب: الرمز والسؤال، وتحته دائرتين للمتابعة ورابط الحل
function card(q, prefix = 'p', extra = '') {
  const last = isPast(q) && examInfo(q.id).year === 1447;
  const meta = isPast(q)
    ? (last ? `<span class="tag tag-last">${examName(q)} · السنة الماضية</span>` : `<span class="exn">${examName(q)}</span>`)
    : '';
  return `<div class="pcard" id="${prefix}-${q.id}">
<div class="q-head">${label(q)}${meta}${extra}<span class="mk">${marksText(q)}</span></div>
${questionMath(q)}
<div class="pfoot"><span class="dot"></span><span class="dot"></span><span class="ln"><a href="#s-${q.id}">الحل ←</a></span></div>
</div>`;
}
function practiceGrid(key) {
  const p = PAT[key];
  if (!p) throw new Error('@practice: نمط غير موجود ' + key);
  const qs = p.qs.filter((q) => !q.worked);
  const lede = p.n === 1 ? '<p class="prac-lede">حل كل سؤال لحالك وأنت مسكّر الحل. ما عرفت؟ اضغط «الحل»، وفي آخر الحل «رجوع» يرجعك هنا.</p>' : '';
  return `<div class="prac"><div class="h3 prac-title" id="pr-${p.key}">تدرّب على النمط ${p.n}: ${countText(qs.length)}</div>${lede}
<div class="pgrid">${qs.map((q) => card(q)).join('')}</div></div>`;
}
function checksBox(key) {
  const g = CHECKS.find((c) => c.key === key);
  if (!g) throw new Error('@checks: غير موجود ' + key);
  const items = g.items.map((it) => `<li id="c-${it.id}"><div class="cq">${md.renderInline(it.q)}</div><div class="ca"><span class="ca-l">الجواب</span><div class="ca-b">${renderMd(it.a)}</div></div></li>`).join('');
  return `<div class="box box-check" id="chk-${key}"><div class="box-title">أسئلة فهم سريعة: فكّر بالجواب، بعدين اقرأه</div><div class="box-body"><ol class="checks">${items}</ol></div></div>`;
}

// ---------- رسمة الغلاف: جدول تجزئة كبير ----------
function coverArt() {
  return `<div class="cover-di">${diTable('x^2 & \\cos x ;; 2x & \\sin x ;; 2 & -\\cos x ;; 0 & -\\sin x', 'di-cover')}</div>`;
}

// ---------- Markdown بأوامر ----------
function renderMd(text) {
  const holders = [];
  const pre = text.replace(/^([ \t]*)@(example|toc|cover|pattern|formula|practice|checks|di)(?:[ \t]+(.+?))?[ \t]*$/gm, (_, indent, cmd, arg) => {
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
      return `<h2 id="pat-${p.key}" data-plain="${plainTitle(p.title)}">${pk(p)}${titleHtml(p)}</h2>${patternMeta(p)}`;
    }
    if (cmd === 'practice') return practiceGrid(arg);
    if (cmd === 'checks') return checksBox(arg);
    if (cmd === 'di') return diTable(arg);
    if (cmd === 'toc') return '<nav class="toc" id="toc"></nav>';
    if (cmd === 'cover') return coverArt();
    if (cmd === 'formula') return `<div class="cover-formula">${tex('\\int\\big[f(x)\\big]^{n}f\'(x)\\,dx=\\frac{\\big[f(x)\\big]^{n+1}}{n+1}+C', true)}</div>`;
    return '';
  });
  // عناوين .h3 مكتوبة HTML، فنعالج الرياضيات اللي داخلها هنا
  html = html.replace(/<div class="h3([^"]*)">([^<]*(?:<(?!\/div>)[^<]*)*)<\/div>/g, (_, cls, inner) => `<div class="h3${cls}">${md.renderInline(inner)}</div>`);
  // وكذلك سطر المقدمة (lede)
  html = html.replace(/<p class="lede">([\s\S]*?)<\/p>/g, (_, inner) => `<p class="lede">${md.renderInline(inner)}</p>`);
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => ({
    past: counts.mid + counts.fin, mid: counts.mid, fin: counts.fin, notes: counts.ne + counts.nx,
    examples: counts.ne, exercises: counts.nx, practice: practice.length, total: byId.size, patterns: PATTERNS.length,
    pastAll: counts.mid + counts.fin + dupCount.mid + dupCount.fin,
    checks: CHECKS.reduce((a, g) => a + g.items.length, 0),
    grid: practice.filter((q) => !WORKED.has(q.id)).length,
  }[k] ?? `{{${k}}}`));
}

// ---------- «اختبر نفسك»: أسئلة الاختبارات بدون أسماء الأنماط ----------
function testSection() {
  const order = ['M472', 'F472', 'F471', 'M471', 'F462', 'M462', 'F461', 'M461', 'F452', 'M452', 'F451', 'M451'];
  const qs = practice.filter(isPast).sort((a, b) => order.indexOf(a.id.slice(0, 4)) - order.indexOf(b.id.slice(0, 4)));
  return `<div class="pgrid tgrid">${qs.map((q) => card(q, 't', `<span class="sem">الفصل ${examInfo(q.id).sem}</span>`)).join('')}</div>`;
}

// ---------- الحلول، وأجوبة أسئلة الفهم ----------
function solutionsSection() {
  let h = '';
  for (const p of PATTERNS) {
    h += `<h2 id="so-${p.key}" data-plain="${plainTitle(p.title)}">${pk(p)}${titleHtml(p)}</h2>`;
    for (const q of p.qs) {
      const backs = [q.worked ? `<a class="back" href="#ex-${q.id}">↑ رجوع للمثال</a>` : `<a class="back" href="#p-${q.id}">↑ رجوع لسؤاله في النمط ${p.n}</a>`];
      if (isPast(q)) backs.push(`<a class="back" href="#t-${q.id}">↑ رجوع لاختبر نفسك</a>`);
      const foot = `<div class="sol-foot">${backs.join('')}</div>`;
      const top = `<div class="sol-top"><div class="ex-head"><span class="ex-label">حل</span>${head(q)}</div><div class="sol-q">${mathBlockHtml(q.q)}</div></div>`;
      if (q.worked) {
        h += `<div class="solution sol-linked" id="s-${q.id}">${top}
<p class="linked">محلول خطوة بخطوة في الشرح: <a href="#ex-${q.id}">اضغط هنا وارجع للمثال الكامل</a>. وهذا جوابه للتأكد:</p>
${answerBlock(q)}${foot}</div>`;
      } else {
        h += `<div class="solution" id="s-${q.id}">${top}${solutionBody(q)}${foot}</div>`;
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

const LEARN = ['10-basics.md', '20-p1.md', '21-p2.md', '22-p3.md', '23-p4.md', '24-p5.md', '30-q1.md', '31-q2.md', '40-notes.md', '50-review.md'];

function build() {
  const dir = path.join(CONTENT, '5x');
  const part = (f) => renderMd(readText(path.join(dir, f)));
  let body = '';
  body += `<section class="pg-cover">${part('00-cover.md')}</section>`;
  body += `<section class="pg-start">${part('05-start.md')}</section>`;
  body += `<section class="pg-learn">${LEARN.map(part).join('\n')}</section>`;
  body += `<section class="pg-practice">${part('60-test.md')}${testSection()}</section>`;
  body += `<section class="pg-sols">${part('80-solutions.md')}${solutionsSection()}</section>`;
  body += `<section class="pg-appx">${part('90-appendix.md')}</section>`;
  const css = ['style-5x.css', 'style-61.css', 'style-5x2.css'].map((f) => readText(path.join(ROOT, 'build', f))).join('\n') + iconCss();
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
if (missing.length) console.warn('أسئلة اختبارات ما انذكرت في الشرح:', missing.map((q) => q.id).join(' '));
const unpracticed = PATTERNS.filter((p) => !html.includes(`id="pr-${p.key}"`)).map((p) => p.key);
if (unpracticed.length) console.warn('أنماط بدون تدريب في الشرح:', unpracticed.join(' '));

const browser = await chromium.launch();
// عرض منطقة الكتابة في A4 = 210 − 2×15 = 180mm
const pg = await browser.newPage({ viewport: { width: Math.floor((180 / 25.4) * 96), height: 1100 } });
await pg.emulateMedia({ media: 'print' });
await pg.goto('file://' + HTML);
await pg.evaluate(() => document.fonts.ready);

// الخطوات: السبب يمين والمعادلات (وجدول التجزئة) يسار في نفس السطر، والطويل ياخذ العرض كامل
const layout = await pg.evaluate(() => {
  let grid = 0, stacked = 0;
  for (const li of document.querySelectorAll('.sol-steps ol > li')) {
    const kids = [...li.childNodes];
    const isEq = (n) => n.nodeType === 1 && (n.classList.contains('eq') || n.classList.contains('di'));
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
      || [...li.querySelectorAll('.st-eqs table.di')].some((t) => t.getBoundingClientRect().width > li.querySelector('.st-eqs').clientWidth + 1)
      || why0.scrollWidth > why0.clientWidth + 2
      || [...why0.querySelectorAll('.m')].some((m) => m.getBoundingClientRect().width > why0.clientWidth);
    const longWhy = why0.getBoundingClientRect().height > 4.6 * parseFloat(getComputedStyle(li).lineHeight || 20);
    if (tooWide || longWhy) { li.classList.remove('st-grid'); li.classList.add('st-stack'); stacked++; }
  }
  return { grid, stacked };
});

const over = await pg.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('.eq')) if (el.scrollWidth > el.clientWidth + 3) out.push(['eq', el.dataset.tex, el.scrollWidth - el.clientWidth]);
  const W = document.body.clientWidth;
  for (const el of document.querySelectorAll('.box, .example, .solution, .pcard, .diff, table')) {
    const r = el.getBoundingClientRect();
    if (r.width > W + 1) out.push(['box', el.className, r.width - W]);
  }
  for (const el of document.querySelectorAll('.pcard')) if (el.scrollWidth > el.clientWidth + 2) out.push(['card', el.id, el.scrollWidth - el.clientWidth]);
  // جدول التجزئة لازم يبقى داخل عموده
  for (const t of document.querySelectorAll('table.di')) {
    const box = t.parentElement.getBoundingClientRect();
    const r = t.getBoundingClientRect();
    if (r.left < box.left - 1 || r.right > box.right + 1) out.push(['di', t.textContent.slice(0, 40), Math.round(Math.max(box.left - r.left, r.right - box.right))]);
  }
  return out;
});
const heads = await pg.evaluate(() => [...document.querySelectorAll('h1[id], h2[id]')].map((h) => {
  const num = h.querySelector('.num');
  const pkEl = h.querySelector('.pk');
  let text = h.textContent;
  if (num) text = text.replace(num.textContent, num.textContent + ' · ');
  if (pkEl) text = text.replace(pkEl.textContent, pkEl.textContent + ' · ');
  if (h.dataset.plain) text = (pkEl ? pkEl.textContent + ' · ' : '') + h.dataset.plain;
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
console.log(`${path.basename(PDF)}: ${n} صفحة · أسئلة: ${byId.size} (فصلي ${counts.mid}، نهائي ${counts.fin}، أمثلة مذكرة ${counts.ne}، تمارين مذكرة ${counts.nx}، ومكررة ${dupOf.size}) · خطوات بعمودين ${layout.grid - layout.stacked}، بسطر كامل ${layout.stacked}`);
console.log('بداية الأقسام:', JSON.stringify(sections));
if (over.length) { console.log('تجاوز عرض:'); for (const o of over) console.log('  ', JSON.stringify(o)); }
fs.writeFileSync(path.join(OUT, 'build-5x-report.json'), JSON.stringify({ pages: n, overflow: over, toc: pages2, layout }, null, 2));
