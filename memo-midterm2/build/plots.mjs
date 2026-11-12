// رسوم SVG بسيطة للدوال (تُحسب وقت البناء، بدون مكتبات)
const asinh = Math.asinh, acosh = Math.acosh, atanh = Math.atanh;
const F = {
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  asinh,
  acosh: (x) => (x >= 1 ? acosh(x) : NaN),
  atanh: (x) => (Math.abs(x) < 1 ? atanh(x) : NaN),
  acoth: (x) => (Math.abs(x) > 1 ? 0.5 * Math.log((x + 1) / (x - 1)) : NaN),
  asech: (x) => (x > 0 && x <= 1 ? acosh(1 / x) : NaN),
  acsch: (x) => (x !== 0 ? asinh(1 / x) : NaN),
};

function fmt(n) { return Number(n.toFixed(2)); }

/**
 * plot({ xmin, xmax, ymin, ymax, w, h, curves:[{fn, color, width, dash, from, to}], vlines:[x], hlines:[y], dots:[[x,y,'filled'|'open']], ticks })
 */
export function plot(o) {
  const w = o.w || 220, h = o.h || 150, pad = 14;
  const X = (x) => pad + ((x - o.xmin) / (o.xmax - o.xmin)) * (w - 2 * pad);
  const Y = (y) => h - pad - ((y - o.ymin) / (o.ymax - o.ymin)) * (h - 2 * pad);
  let s = `<svg class="plot" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">`;
  // شبكة خفيفة
  for (let x = Math.ceil(o.xmin); x <= o.xmax; x++) if (x !== 0) s += `<line x1="${fmt(X(x))}" y1="${pad}" x2="${fmt(X(x))}" y2="${h - pad}" class="grid"/>`;
  for (let y = Math.ceil(o.ymin); y <= o.ymax; y++) if (y !== 0) s += `<line x1="${pad}" y1="${fmt(Y(y))}" x2="${w - pad}" y2="${fmt(Y(y))}" class="grid"/>`;
  // المحاور
  if (o.ymin < 0 && o.ymax > 0) s += `<line x1="${pad - 4}" y1="${fmt(Y(0))}" x2="${w - pad + 4}" y2="${fmt(Y(0))}" class="axis" marker-end="url(#ar)"/>`;
  if (o.xmin < 0 && o.xmax > 0) s += `<line x1="${fmt(X(0))}" y1="${h - pad + 4}" x2="${fmt(X(0))}" y2="${pad - 4}" class="axis"/>`;
  else s += `<line x1="${fmt(X(o.xmin))}" y1="${h - pad + 4}" x2="${fmt(X(o.xmin))}" y2="${pad - 4}" class="axis"/>`;
  // تدريج
  const tx = o.ticksX || [];
  for (const t of tx) s += `<text x="${fmt(X(t))}" y="${fmt(Math.min(h - 2, Y(0) + 11))}" class="tick" text-anchor="middle">${t < 0 ? '−' + Math.abs(t) : t}</text>`;
  const ty = o.ticksY || [];
  for (const t of ty) s += `<text x="${fmt((o.xmin < 0 ? X(0) : X(o.xmin)) - 4)}" y="${fmt(Y(t) + 3)}" class="tick" text-anchor="end">${t < 0 ? '−' + Math.abs(t) : t}</text>`;
  // خطوط تقارب أو حدود مجال
  for (const v of o.vlines || []) s += `<line x1="${fmt(X(v))}" y1="${pad}" x2="${fmt(X(v))}" y2="${h - pad}" class="asym"/>`;
  for (const v of o.hlines || []) s += `<line x1="${pad}" y1="${fmt(Y(v))}" x2="${w - pad}" y2="${fmt(Y(v))}" class="asym"/>`;
  // المنحنيات
  for (const c of o.curves) {
    const fn = typeof c.fn === 'string' ? F[c.fn] : c.fn;
    const from = c.from ?? o.xmin, to = c.to ?? o.xmax;
    const N = 400;
    let d = '', pen = false;
    for (let i = 0; i <= N; i++) {
      const x = from + ((to - from) * i) / N;
      const y = fn(x);
      if (!Number.isFinite(y) || y < o.ymin - 2 || y > o.ymax + 2) { pen = false; continue; }
      const yy = Math.max(o.ymin - 0.5, Math.min(o.ymax + 0.5, y));
      d += `${pen ? 'L' : 'M'}${fmt(X(x))},${fmt(Y(yy))}`;
      pen = true;
    }
    s += `<path d="${d}" fill="none" stroke="${c.color || '#0b5d73'}" stroke-width="${c.width || 2.2}" ${c.dash ? `stroke-dasharray="${c.dash}"` : ''} stroke-linecap="round" clip-path="url(#clip${o.id || ''})"/>`;
  }
  for (const [x, y, kind] of o.dots || []) s += `<circle cx="${fmt(X(x))}" cy="${fmt(Y(y))}" r="2.6" class="${kind === 'open' ? 'dot-open' : 'dot'}"/>`;
  s += `<defs><clipPath id="clip${o.id || ''}"><rect x="${pad - 1}" y="${pad - 1}" width="${w - 2 * pad + 2}" height="${h - 2 * pad + 2}"/></clipPath></defs>`;
  s += '</svg>';
  return s;
}

// غلاف: القطع الزائد x²−y²=1 مع القطاع الزائدي
export function coverArt() {
  const w = 420, h = 250;
  const ox = 70, oy = 150, sc = 62; // الأصل والمقياس
  const P = (x, y) => `${(ox + x * sc).toFixed(1)},${(oy - y * sc).toFixed(1)}`;
  let branch = '';
  for (let i = 0; i <= 200; i++) {
    const t = -1.75 + (3.5 * i) / 200;
    branch += `${i ? 'L' : 'M'}${P(Math.cosh(t), Math.sinh(t))}`;
  }
  const tt = 1.15;
  let sector = `M${P(0, 0)}`;
  for (let i = 0; i <= 80; i++) {
    const t = (tt * i) / 80;
    sector += `L${P(Math.cosh(t), Math.sinh(t))}`;
  }
  sector += 'Z';
  const px = Math.cosh(tt), py = Math.sinh(tt);
  let circle = '';
  for (let i = 0; i <= 120; i++) {
    const a = (2 * Math.PI * i) / 120;
    circle += `${i ? 'L' : 'M'}${P(Math.cos(a), Math.sin(a))}`;
  }
  return `<svg class="cover-art" viewBox="0 0 ${w} ${h}" aria-hidden="true">
<defs>
<linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f1f4"/><stop offset="1" stop-color="#f7efe1"/></linearGradient>
<linearGradient id="sg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c97a10" stop-opacity="0.15"/><stop offset="1" stop-color="#c97a10" stop-opacity="0.45"/></linearGradient>
</defs>
<rect x="0" y="0" width="${w}" height="${h}" rx="18" fill="url(#cg)"/>
<g stroke="#9fb7c0" stroke-width="1">
<line x1="${ox - 50}" y1="${oy}" x2="${w - 20}" y2="${oy}"/>
<line x1="${ox}" y1="${h - 12}" x2="${ox}" y2="14"/>
</g>
<line x1="${ox}" y1="${oy}" x2="${ox + 3.0 * sc}" y2="${oy - 3.0 * sc}" stroke="#9fb7c0" stroke-dasharray="4 4"/>
<line x1="${ox}" y1="${oy}" x2="${ox + 3.0 * sc}" y2="${oy + 3.0 * sc}" stroke="#9fb7c0" stroke-dasharray="4 4"/>
<path d="${circle}" fill="none" stroke="#b8c9cf" stroke-width="1.2" stroke-dasharray="3 3"/>
<path d="${sector}" fill="url(#sg)" stroke="#c97a10" stroke-width="1.2"/>
<path d="${branch}" fill="none" stroke="#0b5d73" stroke-width="3.2" stroke-linecap="round"/>
<line x1="${ox + px * sc}" y1="${oy}" x2="${ox + px * sc}" y2="${oy - py * sc}" stroke="#c97a10" stroke-width="1.4" stroke-dasharray="3 3"/>
<circle cx="${ox + px * sc}" cy="${oy - py * sc}" r="5" fill="#c97a10" stroke="#fff" stroke-width="1.5"/>
<circle cx="${ox}" cy="${oy}" r="3" fill="#0b5d73"/>
</svg>`;
}
