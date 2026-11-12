#!/usr/bin/env python3
"""التحقق الآلي من أجوبة أسئلة السابقات الـ58، والاختصارات، وتصحيحات المفاتيح.

التشغيل:  python3 verify/verify.py   (يحتاج: sympy, mpmath, pyyaml)
النتيجة: verify/report.md ، ويرجع رمز خطأ إذا فشل أي فحص.

طريقة الفحص:
- المشتقة: نقارن الجواب بمشتقة عددية دقيقة (40 خانة) للدالة الأصلية في نقاط من كل فرع من المجال.
- التكامل غير المحدد: نشتق الجواب عدديًا ونقارنه بالدالة تحت التكامل في نقاط من كل فرع.
- التكامل المحدد: تكامل عددي مقابل الجواب.
- النهاية: sympy.limit + قيمة عددية قريبة من النقطة.
- صيغ المفاتيح الغلط: نتأكد إنها تصح في الجهة اللي قلنا تصح فيها، وتغلط في الجهة الثانية.
"""
import glob
import os
import sys

import mpmath as mp
import sympy as sp
import yaml

mp.mp.dps = 40
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
x = sp.Symbol('x', real=True)
NS = {k: getattr(sp, k) for k in dir(sp) if not k.startswith('_')}
NS.update({'x': x, 'E': sp.E})
TOL = mp.mpf('1e-18')

lines = []
failures = []


def P(s):
    return sp.sympify(s, locals=NS)


def fn(expr):
    return sp.lambdify(x, expr, modules='mpmath')


def real_val(v):
    v = mp.mpmathify(v)
    if isinstance(v, mp.mpc):
        if abs(v.imag) > mp.mpf('1e-25'):
            return None
        v = v.real
    return v


def deriv_at(F, xv):
    return real_val(mp.diff(F, mp.mpf(xv)))


def close(a, b):
    if a is None or b is None:
        return False
    return abs(a - b) <= TOL * max(1, abs(a), abs(b))


def check_antiderivative(f_s, F_s, samples):
    f, F = fn(P(f_s)), fn(P(F_s))
    errs = []
    for s in samples:
        try:
            Fv = real_val(F(mp.mpf(s)))
            d = deriv_at(F, s)
            v = real_val(f(mp.mpf(s)))
        except Exception:  # noqa: BLE001
            return False, f'خطأ حساب عند x={s}'
        if Fv is None:
            return False, f'x={s}: الجواب غير معرّف في الأعداد الحقيقية (قيمة مركّبة)'
        if not close(d, v):
            return False, f'x={s}: الجواب′={d} ، الدالة={v}'
        errs.append(abs(d - v))
    return True, f'أكبر فرق {mp.nstr(max(errs), 3)}'


def check_derivative(f_s, d_s, samples):
    f, d = fn(P(f_s)), fn(P(d_s))
    errs = []
    for s in samples:
        try:
            num = deriv_at(f, s)
            val = real_val(d(mp.mpf(s)))
        except Exception:  # noqa: BLE001
            return False, f'خطأ حساب عند x={s}'
        if not close(num, val):
            return False, f'x={s}: المشتقة العددية={num} ، الجواب={val}'
        errs.append(abs(num - val))
    return True, f'أكبر فرق {mp.nstr(max(errs), 3)}'


def check_one(q):
    c = q['check']
    kind = c['kind']
    qid = q['id']
    if kind == 'deriv':
        ok, msg = check_derivative(c['f'], c['ans'], c['samples'])
    elif kind == 'indef':
        ok, msg = check_antiderivative(c['f'], c['ans'], c['samples'])
        for alt in c.get('alt', []):
            ok2, msg2 = check_antiderivative(c['f'], alt, c['samples'])
            ok = ok and ok2
            msg += f' | شكل بديل ({alt}): {"صح" if ok2 else "غلط: " + msg2}'
        for ex in c.get('extra', []):
            ok3, msg3 = check_antiderivative(c['f'], ex['ans'], ex['samples'])
            ok = ok and ok3
            msg += f' | صيغة إضافية على {ex["samples"]}: {"صح" if ok3 else "غلط: " + msg3}'
    elif kind == 'def':
        f = fn(P(c['f']))
        a, b = mp.mpf(sp.N(P(c['a']), 50)), mp.mpf(sp.N(P(c['b']), 50))
        val = mp.quad(f, [a, b])
        ans = mp.mpf(sp.N(P(c['ans']), 50))
        ok = close(val, ans)
        msg = f'التكامل العددي={mp.nstr(val, 20)} ، الجواب={mp.nstr(ans, 20)}'
    elif kind == 'limit':
        f = P(c['f'])
        lim = sp.limit(f, x, P(c['point']), c['dir'])
        ans = P(c['ans'])
        ok_sym = sp.simplify(lim - ans) == 0
        F = fn(f)
        near = real_val(F(mp.mpf('1e-12') if c['dir'] == '+' else mp.mpf('-1e-12')))
        ok_num = abs(near - mp.mpf(sp.N(ans, 50))) < mp.mpf('1e-9')
        ok = ok_sym and ok_num
        msg = f'sympy.limit={lim} ، قيمة عند x=1e-12: {mp.nstr(near, 12)}'
    else:
        raise ValueError(kind)

    # متطابقات جبرية مستخدمة في خطوات الحل
    for lhs, rhs in c.get('identities', []):
        diff = sp.simplify(P(lhs) - P(rhs))
        good = diff == 0
        ok = ok and good
        msg += f' | متطابقة {"صح" if good else "غلط"}'

    # صيغة المفتاح المطبوع (للتصحيحات)
    if 'key_wrong' in c:
        valid = c.get('key_valid_on', [])
        invalid = c.get('key_invalid_on', c['samples'] if not valid else [])
        checker = check_derivative if kind == 'deriv' else check_antiderivative
        ok_v = all(checker(c['f'], c['key_wrong'], [s])[0] for s in valid) if valid else True
        ok_i = all(not checker(c['f'], c['key_wrong'], [s])[0] for s in invalid)
        good = ok_v and ok_i
        ok = ok and good
        msg += f' | صيغة المفتاح: تصح في {valid or "—"} وتغلط في {invalid} → {"مؤكد" if good else "غير مؤكد"}'
    return ok, msg


def general_checks():
    out = []
    a = sp.Symbol('a', positive=True)
    u = sp.Symbol('u', real=True)
    n = sp.Symbol('n', real=True)
    k = sp.Symbol('k', positive=True)

    def rec(name, ok, detail=''):
        out.append((name, ok, detail))

    # 1) اختصار القوة 3/2
    for sgn, label in [(1, 'a²+x²'), (-1, 'a²−x²')]:
        F = x / (a**2 * sp.sqrt(a**2 + sgn * x**2))
        ok = sp.simplify(sp.diff(F, x) - (a**2 + sgn * x**2) ** sp.Rational(-3, 2)) == 0
        rec(f'اختصار ∫dx/({label})^(3/2) = x/(a²√({label}))', ok)

    # 2) اختصار معاملات الكسور الجزئية
    p, q_, r = sp.symbols('p q r')
    A = r / a**2
    lhs = (p * x**2 + q_ * x + r) / (x * (x**2 + a**2))
    rhs = A / x + ((p - A) * x + q_) / (x**2 + a**2)
    rec('اختصار الكسور: A=r/a² ، B=p−A ، D=q', sp.simplify(lhs - rhs) == 0)

    # 3) اختصار x^n ln|kx| (n ≠ −1)
    xp = sp.Symbol('xp', positive=True)
    F = xp**(n + 1) / (n + 1) * sp.log(k * xp) - xp**(n + 1) / (n + 1) ** 2
    rec('اختصار ∫xⁿ ln|kx| dx (n≠−1)', sp.simplify(sp.diff(F, xp) - xp**n * sp.log(k * xp)) == 0)

    # 4) مشتقة coth⁻¹ (تصحيح مذكرة ص58)
    d = sp.diff(sp.acoth(x), x)
    ok_right = all(close(real_val(fn(d)(mp.mpf(t))), real_val(fn(1 / (1 - x**2))(mp.mpf(t)))) for t in [-3, -1.5, 1.5, 4])
    ok_notes_wrong = all(not close(real_val(fn(d)(mp.mpf(t))), real_val(fn(-1 / (1 - x**2))(mp.mpf(t)))) for t in [-3, 1.5, 4])
    rec('مشتقة coth⁻¹u = u′/(1−u²) ، وصيغة المذكرة −1/(1−x²) غلط', ok_right and ok_notes_wrong)

    # 5) الصيغة اللوغاريتمية لـ ∫du/√(u²−a²) على الجهتين
    for aval in [1, 5]:
        ok, _ = check_antiderivative(f'1/sqrt(x**2-{aval}**2)', f'log(Abs(x+sqrt(x**2-{aval}**2)))', [-3 * aval, -1.2 * aval, 1.2 * aval, 3 * aval])
        rec(f'∫du/√(u²−a²) = ln|u+√(u²−a²)| على الجهتين (a={aval})', ok)
        ok2, _ = check_antiderivative(f'1/sqrt(x**2-{aval}**2)', f'acosh(x/{aval})', [1.2 * aval, 3 * aval])
        rec(f'… و cosh⁻¹(u/a) تصح لما u>a (a={aval})', ok2)

    # 6) قوانين sech⁻¹ و csch⁻¹ مع |u| على الجهتين
    for aval in [1, 4]:
        ok, _ = check_antiderivative(f'1/(x*sqrt({aval}**2-x**2))', f'-asech(Abs(x)/{aval})/{aval}', [-0.9 * aval, -0.3 * aval, 0.3 * aval, 0.9 * aval])
        rec(f'∫du/(u√(a²−u²)) = −(1/a)sech⁻¹(|u|/a) على الجهتين (a={aval})', ok)
        ok, _ = check_antiderivative(f'1/(x*sqrt({aval}**2+x**2))', f'-acsch(Abs(x)/{aval})/{aval}', [-3, -0.4, 0.4, 3])
        rec(f'∫du/(u√(a²+u²)) = −(1/a)csch⁻¹(|u|/a) على الجهتين (a={aval})', ok)

    # 7) تعريف csch⁻¹(2/x) = sinh⁻¹(x/2)
    ok = all(close(real_val(mp.acsch(2 / mp.mpf(t))), real_val(mp.asinh(mp.mpf(t) / 2))) for t in [-5, -0.3, 0.3, 5])
    rec('csch⁻¹(2/x) = sinh⁻¹(x/2) لكل x≠0', ok)

    # 8) مشتقة ln|u+r| = 1/r
    rr = sp.sqrt(u**2 - a**2)
    ok = sp.simplify(sp.diff(sp.log(u + rr), u) - 1 / rr) == 0
    rec('d/du ln(u+√(u²−a²)) = 1/√(u²−a²)', ok)

    # 9) حركات جبرية
    rec('u²/(u+1) = u−1+1/(u+1)', sp.simplify(u**2 / (u + 1) - (u - 1 + 1 / (u + 1))) == 0)
    rec('u/(u+1) = 1−1/(u+1)', sp.simplify(u / (u + 1) - (1 - 1 / (u + 1))) == 0)
    rec('u²/(u²+9) = 1−9/(u²+9)', sp.simplify(u**2 / (u**2 + 9) - (1 - 9 / (u**2 + 9))) == 0)
    rec('(1−u²)² = 1−2u²+u⁴', sp.expand((1 - u**2) ** 2) == 1 - 2 * u**2 + u**4)
    return out


def main():
    files = sorted(glob.glob(os.path.join(ROOT, 'content', 'questions', '*.yaml')))
    files += sorted(glob.glob(os.path.join(ROOT, 'content', '42', 'data', '*.yaml')))
    total = 0
    lines.append('# تقرير التحقق الآلي\n')
    lines.append('كل سطر: المعرّف، نوع الفحص، النتيجة، والتفاصيل. الفحص عددي بدقة 40 خانة في نقاط من كل فرع من المجال.\n')
    lines.append('| المعرّف | النوع | النتيجة | التفاصيل |')
    lines.append('|---|---|---|---|')
    for f in files:
        doc = yaml.safe_load(open(f, encoding='utf-8'))
        for p in doc['patterns']:
            for q in p['questions']:
                total += 1
                ok, msg = check_one(q)
                lines.append(f"| {q['id']} | {q['check']['kind']} | {'✅' if ok else '❌'} | {msg} |")
                if not ok:
                    failures.append(q['id'])
    lines.append('')
    lines.append('## فحوص عامة (الاختصارات والتصحيحات)\n')
    lines.append('| الفحص | النتيجة |')
    lines.append('|---|---|')
    for name, ok, _ in general_checks():
        lines.append(f"| {name} | {'✅' if ok else '❌'} |")
        if not ok:
            failures.append(name)
    lines.append('')
    lines.append(f'**عدد الأسئلة المفحوصة: {total}** — الفشل: {len(failures)}')
    with open(os.path.join(HERE, 'report.md'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(lines) + '\n')
    print(f'questions: {total}, failures: {len(failures)}')
    for fl in failures:
        print('FAIL:', fl)
    sys.exit(1 if failures else 0)


if __name__ == '__main__':
    main()
