// Build: template.html + bank.json  ->  index.html with all math pre-rendered to inline SVG.
const fs = require('fs');
const path = require('path');
const {mathjax} = require('mathjax-full/js/mathjax.js');
const {TeX} = require('mathjax-full/js/input/tex.js');
const {SVG} = require('mathjax-full/js/output/svg.js');
const {liteAdaptor} = require('mathjax-full/js/adaptors/liteAdaptor.js');
const {RegisterHTMLHandler} = require('mathjax-full/js/handlers/html.js');
const {AllPackages} = require('mathjax-full/js/input/tex/AllPackages.js');

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({packages: AllPackages});
const svgOut = new SVG({fontCache: 'global'});
const doc = mathjax.document('', {InputJax: tex, OutputJax: svgOut});

let count = 0;
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function render(src, display) {
  count++;
  const node = doc.convert(src, {display, em: 16, ex: 8, containerWidth: 1280});
  let s = adaptor.innerHTML(node);
  if (s.includes('data-mjx-error') || s.includes('merror')) throw new Error('TeX error in: ' + src);
  return s.replace('<svg ', `<svg aria-label="${esc(src)}" `);
}
function mathify(str) {
  return str
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, m) => `<span class="dm" dir="ltr">${render(m.trim(), true)}</span>`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, m) => `<span class="im" dir="ltr">${render(m.trim(), false)}</span>`);
}

const dir = __dirname;
const bank = JSON.parse(fs.readFileSync(path.join(dir, 'bank.json'), 'utf8'));
const days = JSON.parse(fs.readFileSync(path.join(dir, 'days.json'), 'utf8'));

const data = {
  types: Object.fromEntries(Object.entries(bank.types).map(([k, v]) => [k, {les: v.les, name: mathify(v.name)}])),
  items: bank.items.map(it => ({
    id: it.id, t: it.t, src: it.src, res: it.res || null,
    q: `<span class="dm" dir="ltr">${render(it.q, true)}</span>`,
    first: mathify(it.first),
    ans: `<span class="dm" dir="ltr">${render(it.ans, true)}</span>`,
  })),
  days,
};

let html = fs.readFileSync(path.join(dir, 'template.html'), 'utf8');
html = mathify(html);
const cache = adaptor.outerHTML(svgOut.fontCache.getCache());
const json = JSON.stringify(data).replace(/<\//g, '<\\/');
html = html.replace('<!--FONTCACHE-->', () => `<svg id="MJX-SVG-global-cache" style="display:none" aria-hidden="true">${cache}</svg>`);
html = html.replace('/*DATA*/', () => json);
const out = process.argv[2];
fs.writeFileSync(out, html);
console.log(`rendered ${count} formulas -> ${out} (${(html.length / 1024).toFixed(0)} KB)`);
