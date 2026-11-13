// أدوات مشتركة: قراءة بيانات الأسئلة، وتحويل Markdown + KaTeX إلى HTML.
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import katex from 'katex';
import MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const CONTENT = path.join(ROOT, 'content');

// ماكروهات الرياضيات المستخدمة في كل الملفات
export const MACROS = {
  '\\sech': '\\operatorname{sech}',
  '\\csch': '\\operatorname{csch}',
};

// ترتيب الأقسام كما في المذكرة
export const SECTION_FILES = [
  '4.2-derivatives.yaml',
  '4.2-integrals.yaml',
  '5.1.yaml',
  '5.2.yaml',
  '5.3.yaml',
  '5.4.yaml',
  '5.5.yaml',
  '6.1.yaml',
];

export const EXAMS = {
  M451: { year: 1445, sem: 'الأول', file: 'M 111 - (451-452) - English.pdf' },
  M452: { year: 1445, sem: 'الثاني', file: 'M 111 - (451-452) - English.pdf' },
  M461: { year: 1446, sem: 'الأول', file: 'M111 - (461-462).pdf' },
  M462: { year: 1446, sem: 'الثاني', file: 'M111 - (461-462).pdf' },
  M471: { year: 1447, sem: 'الأول', file: 'M111 (471-472)_2.pdf' },
  M472: { year: 1447, sem: 'الثاني', file: 'M111 (471-472)_2.pdf' },
};

// فقرات النماذج اللي من الدرس السابق (خارج النطاق) — للتنويه فقط
export const EXCLUDED = {
  M451: ['M451-2-1'],
  M452: ['M452-2-1'],
  M461: ['M461-2-1', 'M461-2-3'],
  M462: ['M462-2-1', 'M462-2-5'],
  M471: ['M471-2-1'],
  M472: [],
};

export function loadSections() {
  const sections = [];
  for (const f of SECTION_FILES) {
    const doc = yaml.load(fs.readFileSync(path.join(CONTENT, 'questions', f), 'utf8'));
    doc.file = f;
    sections.push(doc);
  }
  return sections;
}

export function indexQuestions(sections) {
  const byId = new Map();
  for (const s of sections) {
    for (const p of s.patterns) {
      for (const q of p.questions) {
        if (byId.has(q.id)) throw new Error('سؤال مكرر: ' + q.id);
        q.section = s.section;
        q.sectionTitle = s.title;
        q.pattern = p;
        byId.set(q.id, q);
      }
    }
  }
  return byId;
}

export function sourceLine(id) {
  const [exam, qn, part] = id.split('-');
  const e = EXAMS[exam];
  if (!e) throw new Error('معرّف غير معروف: ' + id);
  return { exam, year: e.year, sem: e.sem, q: qn, part, file: e.file };
}

// ---------- KaTeX ----------
export function tex(t, display) {
  try {
    return katex.renderToString(t, {
      displayMode: display,
      throwOnError: true,
      strict: 'ignore',
      macros: { ...MACROS },
      output: 'html',
    });
  } catch (err) {
    throw new Error(`KaTeX: ${err.message}\n  في: ${t}`);
  }
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function mathBlockHtml(t) {
  return `<div class="eq" data-tex="${escapeHtml(t.trim())}">${tex(t, true)}</div>`;
}
export function mathInlineHtml(t) {
  return `<span class="m">${tex(t, false)}</span>`;
}

// ---------- Markdown ----------
function mathPlugin(md) {
  // $...$ داخل السطر
  md.inline.ruler.after('escape', 'math_inline', (state, silent) => {
    const src = state.src;
    const start = state.pos;
    if (src[start] !== '$' || src[start + 1] === '$') return false;
    let end = start + 1;
    for (;;) {
      end = src.indexOf('$', end);
      if (end === -1) return false;
      if (src[end - 1] === '\\') { end += 1; continue; }
      break;
    }
    const content = src.slice(start + 1, end);
    if (!content.trim() || /^\s/.test(content) || /\s$/.test(content)) return false;
    if (!silent) {
      const tok = state.push('math_inline', 'math', 0);
      tok.content = content;
    }
    state.pos = end + 1;
    return true;
  });

  // $$ ... $$ في سطر مستقل (حتى داخل القوائم وبعد سطر نص مباشرة)
  md.block.ruler.before('fence', 'math_block', (state, startLine, endLine, silent) => {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    if (pos + 2 > max || state.src.slice(pos, pos + 2) !== '$$') return false;
    if (silent) return true;
    pos += 2;
    let firstLine = state.src.slice(pos, max);
    let lastLine = '';
    let found = false;
    let next = startLine;
    if (firstLine.trim().endsWith('$$')) {
      firstLine = firstLine.trim().slice(0, -2);
      found = true;
    }
    while (!found) {
      next += 1;
      if (next >= endLine) throw new Error('$$ بدون إغلاق قرب: ' + firstLine);
      pos = state.bMarks[next] + state.tShift[next];
      max = state.eMarks[next];
      const lineText = state.src.slice(pos, max);
      if (lineText.trim().endsWith('$$')) {
        const lastPos = state.src.slice(0, max).lastIndexOf('$$');
        lastLine = state.src.slice(pos, lastPos);
        found = true;
      }
    }
    state.line = next + 1;
    const tok = state.push('math_block', 'math', 0);
    tok.block = true;
    const middle = next > startLine + 1 ? state.getLines(startLine + 1, next, state.tShift[startLine], true) : '';
    tok.content = [firstLine, middle, lastLine].filter((s) => s && s.trim()).join('\n');
    tok.map = [startLine, state.line];
    return true;
  }, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });

  md.renderer.rules.math_inline = (tokens, idx) => mathInlineHtml(tokens[idx].content);
  md.renderer.rules.math_block = (tokens, idx) => mathBlockHtml(tokens[idx].content) + '\n';
}

const BOX_TITLES = {
  recog: 'كيف تعرفه',
  first: 'أول حركة',
  steps: 'الخطوات الثابتة',
  why: 'ليش؟',
  warn: 'انتبه',
  fix: 'تصحيح',
  short: 'اختصار',
  more: 'إذا احتجت',
  alg: 'تذكير جبر',
  law: 'القوانين',
  note: 'ملاحظة',
  scope: 'حدود الملف',
  use: 'كيف تستخدم الملف',
};

let headingCounter = 0;

export function makeMarkdown(ctx = {}) {
  const md = new MarkdownIt({ html: true, typographer: false, linkify: false, breaks: false });
  md.use(mathPlugin);
  // معرّف لكل عنوان (للفهرس وروابط PDF)
  md.core.ruler.push('heading_ids', (state) => {
    for (const tok of state.tokens) {
      if (tok.type === 'heading_open' && !tok.attrGet('id')) tok.attrSet('id', `hd-${++headingCounter}`);
    }
  });

  // ::: box TYPE [عنوان اختياري]
  md.use(container, 'box', {
    validate: (p) => /^box\s+\w+/.test(p.trim()),
    render: (tokens, idx) => {
      const tok = tokens[idx];
      if (tok.nesting === 1) {
        const m = tok.info.trim().match(/^box\s+(\w+)\s*(.*)$/);
        const type = m[1];
        const title = m[2] || BOX_TITLES[type] || '';
        return `<div class="box box-${type}">${title ? `<div class="box-title">${md.renderInline(title)}</div>` : ''}<div class="box-body">\n`;
      }
      return '</div></div>\n';
    },
  });

  // ::: diff ID  — بطاقة "وش يختلف" لسؤال من نفس النمط
  md.use(container, 'diff', {
    validate: (p) => /^diff\s+\S+/.test(p.trim()),
    render: (tokens, idx) => {
      const tok = tokens[idx];
      if (tok.nesting === 1) {
        const id = tok.info.trim().split(/\s+/)[1];
        const q = ctx.byId && ctx.byId.get(id);
        if (!q) throw new Error('diff: سؤال غير موجود ' + id);
        ctx.used && ctx.used.add(id);
        const head = ctx.diffHead ? ctx.diffHead(q) : `${qidChip(id)}${marksChip(q)}`;
        return `<div class="diff"><div class="diff-top"><div class="diff-head">${head}</div>${questionMath(q, 'diff-q')}</div><div class="diff-body">\n`;
      }
      return '</div></div>\n';
    },
  });

  // نص عادي: نلف معرفات الأسئلة عشان ما تنقلب في السطر العربي
  const defaultText = md.renderer.rules.text;
  md.renderer.rules.text = (tokens, idx, opts, env, self) => {
    const html = defaultText(tokens, idx, opts, env, self);
    return wrapIds(html);
  };
  return md;
}

export function wrapIds(html) {
  return html.replace(/\b([MF])4[5-7][12]-\d-\d\b/g, (m, k) => `<span class="qid${k === 'F' ? ' qid-fin' : ''}">${m}</span>`);
}

export function qidChip(id, link) {
  const inner = `<span class="qid">${id}</span>`;
  return link ? `<a class="qid-link" href="#${link}">${inner}</a>` : inner;
}

export function marksChip(q) {
  if (q.marks == null) return '';
  const m = Number(q.marks);
  const text = m === 1 ? 'درجة' : m === 2 ? 'درجتين' : m >= 3 && m <= 10 && Number.isInteger(m) ? `${m} درجات` : `${m} درجة`;
  return `<span class="marks">${text}</span>`;
}

export function questionMath(q, cls = 'q-math') {
  const prompt = q.prompt ? `<div class="prompt" dir="ltr">${q.prompt.replace(/\$([^$]+)\$/g, (_, t) => tex(t, false))}</div>` : '';
  return `<div class="${cls}">${prompt}${mathBlockHtml(q.q)}</div>`;
}

export function readText(p) {
  return fs.readFileSync(p, 'utf8');
}
