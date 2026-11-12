# -*- coding: utf-8 -*-
"""Question bank for MATH 111 second exam (4.2 - 6.1), with sympy verification.
Every item: transcribed from Dr. Tariq Alfadhel's past exams / class notes.
chk kinds:
  ('d', y, dy, pts)            derivative
  ('i', integrand, F, pts)     indefinite integral (F' == integrand)
  ('di', integrand, a, b, val) definite integral
  ('l', expr, point, dir, val) limit
"""
import json, sys
import sympy as sp

x = sp.symbols('x', real=True)
E451 = "(451-452)"; E461 = "(461-462)"; E471 = "(471-472)"; NOTES = "المذكرة"

TYPES = {
 "A":  ("4.2", r"مشتقة دالة زائدية عكسية: الصيغة × \(u'\)"),
 "C1": ("4.2", r"صيغة جاهزة: حدّد \(u\) و \(a\) وجهّز \(u'\)"),
 "C2": ("4.2", "إكمال مربع ثم صيغة جاهزة"),
 "D1": ("5.1", r"تجزئة: \(u\) = كثيرة الحدود"),
 "D2": ("5.1", r"تجزئة: \(u=\ln\)"),
 "D3": ("5.1", r"تجزئة: \(u\) = الدالة العكسية"),
 "D4": ("5.1", "تجزئة مرتين ثم انقل التكامل للطرف الثاني"),
 "E1": ("5.2", r"\(\sin/\cos\): اقطع واحد من الفردي"),
 "E2": ("5.2", r"\(\tan/\sec\)"),
 "E3": ("5.2", r"\(\cot/\csc\)"),
 "E4": ("5.2", "أسس زوجية: نصف الزاوية"),
 "E5": ("5.2", "حاصل ضرب بزوايا مختلفة: تحويل إلى مجموع"),
 "F1": ("5.3", r"تعويض مثلثي: \(x=a\sin\theta\)"),
 "F2": ("5.3", r"تعويض مثلثي: \(x=a\tan\theta\)"),
 "F3": ("5.3", r"تعويض مثلثي: \(x=a\sec\theta\)"),
 "G1": ("5.4", r"كسور جزئية: \(\frac{A}{x}+\frac{Bx+C}{x^2+a^2}\)"),
 "G2": ("5.4", "كسور جزئية: عوامل خطية مختلفة"),
 "G3": ("5.4", "كسور جزئية: عامل مكرر"),
 "G4": ("5.4", "قسمة مطولة أولاً ثم كسور جزئية"),
 "H1": ("5.5", r"قوى كسرية: \(x=u^n\)"),
 "H2": ("5.5", r"\(u\) = الجذر كله"),
 "B1": ("6.1", r"لوبيتال مباشرة \(\left(\frac00,\frac\infty\infty\right)\)"),
 "B2": ("6.1", r"\(0\cdot\infty\): حوّلها كسر"),
 "B3": ("6.1", r"\(\infty-\infty\): وحّد المقامات"),
 "B4": ("6.1", r"أسس: \(\ln y\) ثم \(e^{L}\)"),
}

B = []
def add(id, t, src, q, first, ans, chk, res=None):
    B.append(dict(id=id, t=t, src=src, q=q, first=first, ans=ans, chk=chk, res=res))

# ---------- A: derivatives of inverse hyperbolic (4.2) ----------
add("A01","A",f"الثاني 1447 ف2 · س1(1) · {E471} ص20",
 r"f(x)=\sinh^{-1}\left(\ln|x+1|\right)",
 r"\(u=\ln|x+1|,\ u'=\dfrac{1}{x+1}\) ثم \(\dfrac{u'}{\sqrt{1+u^2}}\)",
 r"f'(x)=\frac{1}{(x+1)\sqrt{1+\left(\ln|x+1|\right)^2}}",
 ('d','asinh(log(x+1))','1/((x+1)*sqrt(1+log(x+1)**2))',[0.5,2]),'m2')
add("A02","A",f"الثاني 1447 ف2 · س1(2) · {E471} ص20",
 r"g(x)=\operatorname{csch}^{-1}\left(\sqrt{x+2}\right)",
 r"\(u=\sqrt{x+2},\ u'=\dfrac{1}{2\sqrt{x+2}}\) ثم \(\dfrac{-u'}{|u|\sqrt{1+u^2}}\)",
 r"g'(x)=\frac{-1}{2(x+2)\sqrt{x+3}}",
 ('d','acsch(sqrt(x+2))','-1/(2*(x+2)*sqrt(x+3))',[0.5,2]),'m2')
add("A03","A",f"الثاني 1447 ف1 · س1(1) · {E471} ص5",
 r"y=\sinh\left(\sqrt{x^2+1}\right)+\cosh^{-1}\left(e^{x}\right)",
 r"حد حد: \(\cosh\left(\sqrt{x^2+1}\right)\cdot\dfrac{2x}{2\sqrt{x^2+1}}+\dfrac{e^x}{\sqrt{(e^x)^2-1}}\)",
 r"y'=\frac{x\cosh\left(\sqrt{x^2+1}\right)}{\sqrt{x^2+1}}+\frac{e^{x}}{\sqrt{e^{2x}-1}}",
 ('d','sinh(sqrt(x**2+1))+acosh(exp(x))','x*cosh(sqrt(x**2+1))/sqrt(x**2+1)+exp(x)/sqrt(exp(2*x)-1)',[1,2]),'m1')
add("A04","A",f"الثاني 1447 ف1 · س1(2) · {E471} ص5",
 r"y=\operatorname{sech}\left(5x^2\right)+\tanh^{-1}\left(\sin x\right)",
 r"حد حد: \(-\operatorname{sech}(5x^2)\tanh(5x^2)\cdot 10x+\dfrac{\cos x}{1-(\sin x)^2}\)",
 r"y'=-10x\operatorname{sech}\left(5x^2\right)\tanh\left(5x^2\right)+\frac{\cos x}{1-\sin^2x}",
 ('d','sech(5*x**2)+atanh(sin(x))','-10*x*sech(5*x**2)*tanh(5*x**2)+cos(x)/(1-sin(x)**2)',[0.3,0.7]),'m1')
add("A05","A",f"الثاني 1446 ف2 · س1(1) · {E461} ص21",
 r"y=\coth\left(\sqrt[3]{x}\right)+\operatorname{csch}^{-1}\left(\frac{2}{x}\right)",
 r"حد حد: \(-\operatorname{csch}^2\left(\sqrt[3]{x}\right)\cdot\dfrac13x^{-2/3}+\dfrac{-1}{\frac2x\sqrt{\left(\frac2x\right)^2+1}}\cdot\dfrac{-2}{x^2}\)",
 r"y'=\frac{-\operatorname{csch}^2\left(\sqrt[3]{x}\right)}{3x^{2/3}}+\frac{1}{x\sqrt{\frac{4}{x^2}+1}}",
 ('d','coth(x**Rational(1,3))+acsch(2/x)','-csch(x**Rational(1,3))**2/(3*x**Rational(2,3))+1/(x*sqrt(4/x**2+1))',[1,2]))
add("A06","A",f"الثاني 1446 ف2 · س1(2) · {E461} ص21",
 r"y=\coth^{-1}\left(\frac{x^3}{3}\right)+\cosh^{-1}(3x)",
 r"حد حد: \(\dfrac{1}{1-\left(\frac{x^3}{3}\right)^2}\cdot x^2+\dfrac{3}{\sqrt{(3x)^2-1}}\)",
 r"y'=\frac{x^2}{1-\frac{x^6}{9}}+\frac{3}{\sqrt{9x^2-1}}",
 ('d','acoth(x**3/3)+acosh(3*x)','x**2/(1-x**6/9)+3/sqrt(9*x**2-1)',[2,3]))
add("A07","A",f"الثاني 1446 ف1 · س1(1) · {E461} ص5",
 r"y=\operatorname{csch}\left(\frac{2}{x}\right)+\tanh^{-1}\left(e^{5x}\right)",
 r"حد حد: \(-\operatorname{csch}\left(\frac2x\right)\coth\left(\frac2x\right)\cdot\dfrac{-2}{x^2}+\dfrac{5e^{5x}}{1-(e^{5x})^2}\)",
 r"y'=\frac{2}{x^2}\operatorname{csch}\left(\frac{2}{x}\right)\coth\left(\frac{2}{x}\right)+\frac{5e^{5x}}{1-e^{10x}}",
 ('d','csch(2/x)+atanh(exp(5*x))','2/x**2*csch(2/x)*coth(2/x)+5*exp(5*x)/(1-exp(10*x))',[-0.5,-1]))
add("A08","A",f"الثاني 1446 ف1 · س1(2) · {E461} ص5",
 r"y=\sinh^{-1}\left(\sqrt{x}\right)+\coth\left(4x^2\right)",
 r"حد حد: \(\dfrac{1}{\sqrt{1+(\sqrt x)^2}}\cdot\dfrac{1}{2\sqrt x}-\operatorname{csch}^2(4x^2)\cdot 8x\)",
 r"y'=\frac{1}{2\sqrt{x}\sqrt{1+x}}-8x\operatorname{csch}^2\left(4x^2\right)",
 ('d','asinh(sqrt(x))+coth(4*x**2)','1/(2*sqrt(x)*sqrt(1+x))-8*x*csch(4*x**2)**2',[0.5,1]))
add("A09","A",f"الثاني 1445 ف2 · س1(1) · {E451} ص22",
 r"y=\tanh\left(2x^3\right)+\operatorname{sech}^{-1}(3x)",
 r"حد حد: \(\operatorname{sech}^2(2x^3)\cdot 6x^2+\dfrac{-1}{3x\sqrt{1-(3x)^2}}\cdot 3\)",
 r"y'=6x^2\operatorname{sech}^2\left(2x^3\right)-\frac{1}{x\sqrt{1-9x^2}}",
 ('d','tanh(2*x**3)+asech(3*x)','6*x**2*sech(2*x**3)**2-1/(x*sqrt(1-9*x**2))',[0.1,0.2]))
add("A10","A",f"الثاني 1445 ف2 · س1(2) · {E451} ص22",
 r"y=\cosh^{-1}\left(\sqrt{x}\right)+\sinh^{3}\left(\frac{1}{x}\right)",
 r"حد حد: \(\dfrac{1}{\sqrt{(\sqrt x)^2-1}}\cdot\dfrac{1}{2\sqrt x}+3\sinh^2\left(\frac1x\right)\cosh\left(\frac1x\right)\cdot\dfrac{-1}{x^2}\)",
 r"y'=\frac{1}{2\sqrt{x}\sqrt{x-1}}-\frac{3}{x^2}\sinh^2\left(\frac1x\right)\cosh\left(\frac1x\right)",
 ('d','acosh(sqrt(x))+sinh(1/x)**3','1/(2*sqrt(x)*sqrt(x-1))-3/x**2*sinh(1/x)**2*cosh(1/x)',[2,3]))
add("A11","A",f"الثاني 1445 ف1 · س1(1) · {E451} ص5",
 r"y=\cosh\left(3x^2\right)+\operatorname{sech}^{-1}(2x)",
 r"حد حد: \(\sinh(3x^2)\cdot 6x+\dfrac{-1}{2x\sqrt{1-(2x)^2}}\cdot 2\)",
 r"y'=6x\sinh\left(3x^2\right)-\frac{1}{x\sqrt{1-4x^2}}",
 ('d','cosh(3*x**2)+asech(2*x)','6*x*sinh(3*x**2)-1/(x*sqrt(1-4*x**2))',[0.1,0.3]))
add("A12","A",f"النهائي 1445 ف1 · الجزء الأول(3) · {E451} ص10",
 r"f(x)=\sinh^{-1}\left(3^{x}\right)+\ln\left|\tanh(4x)\right|",
 r"حد حد: \(\dfrac{3^x\ln 3}{\sqrt{1+(3^x)^2}}+\dfrac{\operatorname{sech}^2(4x)\cdot 4}{\tanh(4x)}\)",
 r"f'(x)=\frac{3^{x}\ln 3}{\sqrt{1+3^{2x}}}+\frac{4\operatorname{sech}^2(4x)}{\tanh(4x)}",
 ('d','asinh(3**x)+log(tanh(4*x))','3**x*log(3)/sqrt(1+3**(2*x))+4*sech(4*x)**2/tanh(4*x)',[0.3,1]))
add("A13","A",f"النهائي 1446 ف2 · س1(3) · {E461} ص25",
 r"y=\tanh\left(\sqrt{x}\right)+\sinh^{-1}\left(\frac{2}{\sqrt{x}}\right)",
 r"حد حد: \(\operatorname{sech}^2(\sqrt x)\cdot\dfrac{1}{2\sqrt x}+\dfrac{1}{\sqrt{1+\left(\frac{2}{\sqrt x}\right)^2}}\cdot\left(-x^{-3/2}\right)\)",
 r"y'=\frac{\operatorname{sech}^2\left(\sqrt{x}\right)}{2\sqrt{x}}-\frac{1}{x^{3/2}\sqrt{1+\frac{4}{x}}}",
 ('d','tanh(sqrt(x))+asinh(2/sqrt(x))','sech(sqrt(x))**2/(2*sqrt(x))-1/(x**Rational(3,2)*sqrt(1+4/x))',[1,2]))

# ---------- B: limits (6.1) ----------
add("B01","B3",f"الثاني 1447 ف2 · س2 · {E471} ص20",
 r"\lim_{x\to0^+}\left(\frac{1}{\ln(x+1)}-\frac{1}{x}\right)",
 r"الشكل \((\infty-\infty)\). وحّد المقامات: \(\displaystyle\lim_{x\to0^+}\frac{x-\ln(x+1)}{x\ln(x+1)}\ \left(\tfrac00\right)\) ثم لوبيتال مرتين",
 r"\frac12", ('l','1/log(x+1)-1/x',0,'+','1/2'),'m2')
add("B02","B1",f"النهائي 1445 ف1 · الجزء الثالث(1) · {E451} ص13",
 r"\lim_{x\to\infty}\frac{e^{x}+5x}{e^{2x}+2x+1}",
 r"الشكل \(\left(\tfrac\infty\infty\right)\). لوبيتال: \(\displaystyle\lim_{x\to\infty}\frac{e^x+5}{2e^{2x}+2}\) ثم مرة ثانية",
 r"0", ('l','(exp(x)+5*x)/(exp(2*x)+2*x+1)','oo','-','0'))
add("B03","B2",f"النهائي 1446 ف1 · س3(1) · {E461} ص13",
 r"\lim_{x\to\infty}e^{-x^3}\left(x^4+1\right)",
 r"الشكل \((0\cdot\infty)\). انقل الأسية للمقام: \(\displaystyle\lim_{x\to\infty}\frac{x^4+1}{e^{x^3}}\ \left(\tfrac\infty\infty\right)\)",
 r"0", ('l','exp(-x**3)*(x**4+1)','oo','-','0'))
add("B04","B1",f"النهائي 1446 ف2 · س3(1) · {E461} ص28",
 r"\lim_{x\to\infty}\frac{x-xe^{x}}{x+2xe^{x}}",
 r"اختصر \(x\) أولاً: \(\displaystyle\lim_{x\to\infty}\frac{1-e^x}{1+2e^x}\ \left(\tfrac{-\infty}{\infty}\right)\) ثم لوبيتال",
 r"-\frac12", ('l','(x-x*exp(x))/(x+2*x*exp(x))','oo','-','-1/2'))
add("B05","B4",f"النهائي 1447 ف1 · س3(1) · {E471} ص12",
 r"\lim_{x\to\infty}x^{\frac1x}",
 r"الشكل \((\infty^0)\). \(y=x^{1/x}\Rightarrow\ln y=\dfrac{\ln x}{x}\ \left(\tfrac\infty\infty\right)\)، احسب النهاية \(L\) والجواب \(e^{L}\)",
 r"e^{0}=1", ('l','x**(1/x)','oo','-','1'),'ch')
add("B06","B4",f"النهائي 1447 ف2 · س3(1) · {E471} ص27",
 r"\lim_{x\to\infty}\left(1+\frac{4}{x}\right)^{2x}",
 r"الشكل \((1^\infty)\). \(\ln y=2x\ln\left(1+\frac4x\right)=\dfrac{2\ln\left(1+\frac4x\right)}{\frac1x}\ \left(\tfrac00\right)\)",
 r"e^{8}", ('l','(1+4/x)**(2*x)','oo','-','exp(8)'),'ch')
add("B07","B1",f"{NOTES} ص93 · مثال1(1)",
 r"\lim_{x\to1}\frac{\ln x}{x^2-1}",
 r"الشكل \(\left(\tfrac00\right)\). لوبيتال: \(\displaystyle\lim_{x\to1}\frac{1/x}{2x}\)",
 r"\frac12", ('l','log(x)/(x**2-1)',1,'+','1/2'))
add("B08","B1",f"{NOTES} ص94 · مثال1(2)",
 r"\lim_{x\to0}\frac{x-\sin x}{3x^2}",
 r"الشكل \(\left(\tfrac00\right)\). لوبيتال: \(\displaystyle\lim_{x\to0}\frac{1-\cos x}{6x}\ \left(\tfrac00\right)\) ثم مرة ثانية",
 r"0", ('l','(x-sin(x))/(3*x**2)',0,'+','0'))
add("B09","B2",f"{NOTES} ص95 · مثال2(2)",
 r"\lim_{x\to0^+}x^2\ln x",
 r"الشكل \((0\cdot-\infty)\). انقل \(x^2\) للمقام: \(\displaystyle\lim_{x\to0^+}\frac{\ln x}{x^{-2}}\ \left(\tfrac{-\infty}{\infty}\right)\)",
 r"0", ('l','x**2*log(x)',0,'+','0'))
add("B10","B3",f"{NOTES} ص95-96 · مثال3(1)",
 r"\lim_{x\to1^+}\left(\frac{1}{x-1}-\frac{1}{\ln x}\right)",
 r"الشكل \((\infty-\infty)\). وحّد المقامات: \(\displaystyle\lim_{x\to1^+}\frac{\ln x-x+1}{(x-1)\ln x}\ \left(\tfrac00\right)\) ثم لوبيتال مرتين",
 r"-\frac12", ('l','1/(x-1)-1/log(x)',1,'+','-1/2'))
add("B11","B3",f"{NOTES} ص96 · مثال3(2)",
 r"\lim_{x\to0^+}\left(\frac{1}{x}-\frac{1}{e^{x}-1}\right)",
 r"وحّد المقامات: \(\displaystyle\lim_{x\to0^+}\frac{e^x-1-x}{x(e^x-1)}\ \left(\tfrac00\right)\) ثم لوبيتال مرتين",
 r"\frac12", ('l','1/x-1/(exp(x)-1)',0,'+','1/2'))
add("B12","B4",f"{NOTES} ص97 · مثال4(1)",
 r"\lim_{x\to0^+}x^{x}",
 r"الشكل \((0^0)\). \(\ln y=x\ln x=\dfrac{\ln x}{x^{-1}}\ \left(\tfrac{-\infty}{\infty}\right)\)",
 r"e^{0}=1", ('l','x**x',0,'+','1'))
add("B13","B4",f"{NOTES} ص97-98 · مثال4(2)",
 r"\lim_{x\to\infty}\left(1+e^{2x}\right)^{\frac1x}",
 r"الشكل \((\infty^0)\). \(\ln y=\dfrac{\ln\left(1+e^{2x}\right)}{x}\ \left(\tfrac\infty\infty\right)\)",
 r"e^{2}", ('l','(1+exp(2*x))**(1/x)','oo','-','exp(2)'))
add("B14","B4",f"{NOTES} ص98 · مثال4(3)",
 r"\lim_{x\to\infty}\left(1+\frac{3}{x}\right)^{x}",
 r"الشكل \((1^\infty)\). \(\ln y=x\ln\left(1+\frac3x\right)=\dfrac{\ln\left(1+\frac3x\right)}{\frac1x}\ \left(\tfrac00\right)\)",
 r"e^{3}", ('l','(1+3/x)**x','oo','-','exp(3)'))

# ---------- C: integrals giving inverse hyperbolic (4.2) ----------
add("C01","C1",f"الثاني 1447 ف2 · س3(2) · {E471} ص21",
 r"\int\frac{1}{x\sqrt{\left(\ln|x|\right)^2-1}}\,dx",
 r"\(u=\ln|x|,\ u'=\dfrac1x\) موجودة: \(\displaystyle\int\frac{u'}{\sqrt{u^2-1^2}}\,dx\)",
 r"\cosh^{-1}\left(\ln|x|\right)+c",
 ('i','1/(x*sqrt(log(x)**2-1))','acosh(log(x))',[4,6]),'m2')
add("C02","C2",f"الثاني 1447 ف2 · س3(4) · {E471} ص22",
 r"\int\frac{1}{(x-2)\sqrt{-x^2+4x-2}}\,dx",
 r"\(-x^2+4x-2=-(x^2-4x+4)-2+4=\left(\sqrt2\right)^2-(x-2)^2\)، \(u=x-2\) برا الجذر",
 r"-\frac{1}{\sqrt2}\operatorname{sech}^{-1}\left(\frac{x-2}{\sqrt2}\right)+c",
 ('i','1/((x-2)*sqrt(-x**2+4*x-2))','-1/sqrt(2)*asech((x-2)/sqrt(2))',[2.5,3]),'m2')
add("C03","C1",f"الثاني 1447 ف1 · س2(2) · {E471} ص5-6",
 r"\int\frac{1}{\sqrt{5^{2x}+1}}\,dx",
 r"\(u=5^x\) وما فيه \(u'\): اضرب فوق وتحت في \(5^x\): \(\displaystyle\frac{1}{\ln5}\int\frac{5^x\ln5}{5^x\sqrt{(5^x)^2+1^2}}\,dx\)",
 r"-\frac{1}{\ln5}\operatorname{csch}^{-1}\left(5^{x}\right)+c",
 ('i','1/sqrt(5**(2*x)+1)','-1/log(5)*acsch(5**x)',[0.5,1]),'m1')
add("C04","C2",f"الثاني 1447 ف1 · س2(4) · {E471} ص6",
 r"\int\frac{1}{(x-3)\sqrt{7-x^2+6x}}\,dx",
 r"\(7-x^2+6x=7-(x^2-6x+9)+9=4^2-(x-3)^2\)، \(u=x-3\) برا الجذر",
 r"-\frac14\operatorname{sech}^{-1}\left(\frac{x-3}{4}\right)+c",
 ('i','1/((x-3)*sqrt(7-x**2+6*x))','-asech((x-3)/4)/4',[4,6]),'m1')
add("C05","C2",f"الثاني 1446 ف2 · س2(2) · {E461} ص21-22",
 r"\int\frac{1}{\sqrt{x^2+2x+10}}\,dx",
 r"\(x^2+2x+10=(x^2+2x+1)+9=(x+1)^2+3^2\)",
 r"\sinh^{-1}\left(\frac{x+1}{3}\right)+c",
 ('i','1/sqrt(x**2+2*x+10)','asinh((x+1)/3)',[0,2]))
add("C06","C1",f"الثاني 1446 ف2 · س2(7) · {E461} ص23",
 r"\int\frac{1}{\sqrt{e^{6x}+1}}\,dx",
 r"\(u=e^{3x}\): اضرب فوق وتحت في \(e^{3x}\): \(\displaystyle\frac13\int\frac{3e^{3x}}{e^{3x}\sqrt{(e^{3x})^2+1^2}}\,dx\)",
 r"-\frac13\operatorname{csch}^{-1}\left(e^{3x}\right)+c",
 ('i','1/sqrt(exp(6*x)+1)','-acsch(exp(3*x))/3',[0.2,1]))
add("C07","C2",f"الثاني 1446 ف1 · س2(2) · {E461} ص5-6",
 r"\int\frac{3}{\sqrt{x^2+6x-16}}\,dx",
 r"\(x^2+6x-16=(x^2+6x+9)-16-9=(x+3)^2-5^2\)",
 r"3\cosh^{-1}\left(\frac{x+3}{5}\right)+c",
 ('i','3/sqrt(x**2+6*x-16)','3*acosh((x+3)/5)',[3,5]))
add("C08","C1",f"الثاني 1445 ف2 · س2(4) · {E451} ص23",
 r"\int\frac{1}{x\sqrt{x^6+25}}\,dx",
 r"\(u=x^3\): اضرب فوق وتحت في \(x^2\): \(\displaystyle\frac13\int\frac{3x^2}{x^3\sqrt{(x^3)^2+5^2}}\,dx\)",
 r"-\frac{1}{15}\operatorname{csch}^{-1}\left(\frac{x^3}{5}\right)+c",
 ('i','1/(x*sqrt(x**6+25))','-acsch(x**3/5)/15',[1,2]))
add("C09","C2",f"الثاني 1445 ف2 · س2(7) · {E451} ص24",
 r"\int\frac{1}{\sqrt{x^2+6x+13}}\,dx",
 r"\(x^2+6x+13=(x^2+6x+9)+4=(x+3)^2+2^2\)",
 r"\sinh^{-1}\left(\frac{x+3}{2}\right)+c",
 ('i','1/sqrt(x**2+6*x+13)','asinh((x+3)/2)',[0,2]))
add("C10","C1",f"الثاني 1445 ف1 · س2(2) · {E451} ص6",
 r"\int\frac{dx}{\sqrt{x}\,\sqrt{1+x}}",
 r"\(u=\sqrt x,\ u'=\dfrac{1}{2\sqrt x}\): \(\displaystyle 2\int\frac{\frac{1}{2\sqrt x}}{\sqrt{1^2+(\sqrt x)^2}}\,dx\)",
 r"2\sinh^{-1}\left(\sqrt{x}\right)+c",
 ('i','1/(sqrt(x)*sqrt(1+x))','2*asinh(sqrt(x))',[1,3]))
add("C11","C1",f"الثاني 1445 ف1 · س2(7) · {E451} ص8",
 r"\int\frac{\sin x}{4-\cos^2x}\,dx",
 r"\(u=\cos x,\ u'=-\sin x\): \(\displaystyle-\int\frac{-\sin x}{2^2-(\cos x)^2}\,dx\)",
 r"-\frac12\tanh^{-1}\left(\frac{\cos x}{2}\right)+c",
 ('i','sin(x)/(4-cos(x)**2)','-atanh(cos(x)/2)/2',[1,2]))
add("C12","C2",f"النهائي 1447 ف2 · س2(6) · {E471} ص27",
 r"\int\frac{1}{(x+3)\sqrt{x^2+6x+13}}\,dx",
 r"\(x^2+6x+13=(x+3)^2+2^2\)، \(u=x+3\) برا الجذر",
 r"-\frac12\operatorname{csch}^{-1}\left(\frac{x+3}{2}\right)+c",
 ('i','1/((x+3)*sqrt(x**2+6*x+13))','-acsch((x+3)/2)/2',[0,2]),'ch')
add("C13","C2",f"النهائي 1447 ف1 · س2(1) · {E471} ص10",
 r"\int\frac{1}{\sqrt{x^2-4x}}\,dx",
 r"\(x^2-4x=(x^2-4x+4)-4=(x-2)^2-2^2\)",
 r"\cosh^{-1}\left(\frac{x-2}{2}\right)+c",
 ('i','1/sqrt(x**2-4*x)','acosh((x-2)/2)',[5,7]),'ch')
add("C14","C2",f"النهائي 1445 ف2 · الجزء الثاني(1) · {E451} ص27",
 r"\int\frac{2}{\sqrt{4x^2+8x+20}}\,dx",
 r"طلّع 4: \(4x^2+8x+20=4\left[(x+1)^2+2^2\right]\) فيطلع \(\sqrt4=2\) برا الجذر",
 r"\sinh^{-1}\left(\frac{x+1}{2}\right)+c",
 ('i','2/sqrt(4*x**2+8*x+20)','asinh((x+1)/2)',[0,2]))
add("C15","C1",f"{NOTES} ص60 · مثال2(1)",
 r"\int\frac{x}{\sqrt{x^4-16}}\,dx",
 r"\(u=x^2,\ u'=2x\): \(\displaystyle\frac12\int\frac{2x}{\sqrt{(x^2)^2-4^2}}\,dx\)",
 r"\frac12\cosh^{-1}\left(\frac{x^2}{4}\right)+c",
 ('i','x/sqrt(x**4-16)','acosh(x**2/4)/2',[3,4]))
add("C16","C1",f"{NOTES} ص60 · مثال2(2)",
 r"\int\frac{e^{x}}{25-e^{2x}}\,dx",
 r"\(u=e^x,\ u'=e^x\) موجودة: \(\displaystyle\int\frac{e^x}{5^2-(e^x)^2}\,dx\)",
 r"\frac15\tanh^{-1}\left(\frac{e^{x}}{5}\right)+c",
 ('i','exp(x)/(25-exp(2*x))','atanh(exp(x)/5)/5',[0,1]))
add("C17","C1",f"{NOTES} ص61 · مثال2(5)",
 r"\int\frac{1}{x\sqrt{16-x^4}}\,dx",
 r"\(u=x^2\): اضرب فوق وتحت في \(x\): \(\displaystyle\frac12\int\frac{2x}{x^2\sqrt{4^2-(x^2)^2}}\,dx\)",
 r"-\frac18\operatorname{sech}^{-1}\left(\frac{x^2}{4}\right)+c",
 ('i','1/(x*sqrt(16-x**4))','-asech(x**2/4)/8',[1,1.5]))
add("C18","C2",f"{NOTES} ص61 · مثال2(8)",
 r"\int\frac{1}{(x-1)\sqrt{-x^2+2x+3}}\,dx",
 r"\(-x^2+2x+3=3-(x^2-2x+1)+1=2^2-(x-1)^2\)، \(u=x-1\) برا الجذر",
 r"-\frac12\operatorname{sech}^{-1}\left(\frac{x-1}{2}\right)+c",
 ('i','1/((x-1)*sqrt(-x**2+2*x+3))','-asech((x-1)/2)/2',[1.5,2.5]))
add("C19","C2",f"{NOTES} ص61 · مثال2(7)",
 r"\int\frac{1}{\sqrt{x^2+2x-8}}\,dx",
 r"\(x^2+2x-8=(x^2+2x+1)-9=(x+1)^2-3^2\)",
 r"\cosh^{-1}\left(\frac{x+1}{3}\right)+c",
 ('i','1/sqrt(x**2+2*x-8)','acosh((x+1)/3)',[3,5]))

# ---------- D: integration by parts (5.1) ----------
add("D01","D3",f"الثاني 1447 ف2 · س3(1) · {E471} ص21",
 r"\int x\operatorname{sech}^{-1}x\,dx",
 r"\(u=\operatorname{sech}^{-1}x,\ dv=x\,dx\ \Rightarrow\ du=\dfrac{-1}{x\sqrt{1-x^2}}dx,\ v=\dfrac{x^2}{2}\)",
 r"\frac{x^2}{2}\operatorname{sech}^{-1}x-\frac{\sqrt{1-x^2}}{2}+c",
 ('i','x*asech(x)','x**2/2*asech(x)-sqrt(1-x**2)/2',[0.3,0.7]),'m2')
add("D02","D3",f"الثاني 1447 ف1 · س2(5) · {E471} ص6-7",
 r"\int\sin^{-1}x\,dx",
 r"\(u=\sin^{-1}x,\ dv=dx\ \Rightarrow\ du=\dfrac{1}{\sqrt{1-x^2}}dx,\ v=x\)",
 r"x\sin^{-1}x+\sqrt{1-x^2}+c",
 ('i','asin(x)','x*asin(x)+sqrt(1-x**2)',[0.3,0.7]),'m1')
add("D03","D2",f"الثاني 1447 ف1 · س2(7) · {E471} ص7",
 r"\int x^3\ln|2x|\,dx",
 r"\(u=\ln|2x|,\ dv=x^3dx\ \Rightarrow\ du=\dfrac1xdx,\ v=\dfrac{x^4}{4}\)",
 r"\frac{x^4}{4}\ln|2x|-\frac{x^4}{16}+c",
 ('i','x**3*log(2*x)','x**4/4*log(2*x)-x**4/16',[1,2]),'m1')
add("D04","D1",f"الثاني 1446 ف2 · س2(3) · {E461} ص22",
 r"\int(2x-1)\cosh x\,dx",
 r"\(u=2x-1,\ dv=\cosh x\,dx\ \Rightarrow\ du=2\,dx,\ v=\sinh x\)",
 r"(2x-1)\sinh x-2\cosh x+c",
 ('i','(2*x-1)*cosh(x)','(2*x-1)*sinh(x)-2*cosh(x)',[0.5,2]))
add("D05","D3",f"الثاني 1446 ف2 · س2(8) · {E461} ص23-24",
 r"\int\tan^{-1}x\,dx",
 r"\(u=\tan^{-1}x,\ dv=dx\ \Rightarrow\ du=\dfrac{1}{x^2+1}dx,\ v=x\)",
 r"x\tan^{-1}x-\frac12\ln\left(x^2+1\right)+c",
 ('i','atan(x)','x*atan(x)-log(x**2+1)/2',[0.5,2]))
add("D06","D1",f"الثاني 1446 ف1 · س2(4) · {E461} ص6",
 r"\int(3x-2)\sinh x\,dx",
 r"\(u=3x-2,\ dv=\sinh x\,dx\ \Rightarrow\ du=3\,dx,\ v=\cosh x\)",
 r"(3x-2)\cosh x-3\sinh x+c",
 ('i','(3*x-2)*sinh(x)','(3*x-2)*cosh(x)-3*sinh(x)',[0.5,2]))
add("D07","D2",f"الثاني 1446 ف1 · س2(5) · {E461} ص6",
 r"\int x^{-2}\ln x\,dx",
 r"\(u=\ln x,\ dv=x^{-2}dx\ \Rightarrow\ du=\dfrac1xdx,\ v=\dfrac{-1}{x}\)",
 r"-\frac{\ln x}{x}-\frac{1}{x}+c",
 ('i','log(x)/x**2','-log(x)/x-1/x',[1,3]))
add("D08","D1",f"الثاني 1445 ف2 · س2(2) · {E451} ص22-23",
 r"\int(2x+1)\cos x\,dx",
 r"\(u=2x+1,\ dv=\cos x\,dx\ \Rightarrow\ du=2\,dx,\ v=\sin x\)",
 r"(2x+1)\sin x+2\cos x+c",
 ('i','(2*x+1)*cos(x)','(2*x+1)*sin(x)+2*cos(x)',[0.5,2]))
add("D09","D2",f"الثاني 1445 ف2 · س2(5) · {E451} ص23-24",
 r"\int x\ln|x|\,dx",
 r"\(u=\ln|x|,\ dv=x\,dx\ \Rightarrow\ du=\dfrac1xdx,\ v=\dfrac{x^2}{2}\)",
 r"\frac{x^2}{2}\ln|x|-\frac{x^2}{4}+c",
 ('i','x*log(x)','x**2/2*log(x)-x**2/4',[1,3]))
add("D10","D2",f"الثاني 1445 ف1 · س2(3) · {E451} ص6",
 r"\int_{1}^{e}x^3\ln x\,dx",
 r"\(u=\ln x,\ dv=x^3dx\)، والحدود تتعوّض في \(\left[\dfrac{x^4}{4}\ln x\right]_1^e\) وفي التكامل الباقي",
 r"\frac{3e^4}{16}+\frac{1}{16}",
 ('di','x**3*log(x)','1','E','3*E**4/16+Rational(1,16)'))
add("D11","D3",f"الثاني 1445 ف1 · س2(5) · {E451} ص7",
 r"\int\cosh^{-1}x\,dx",
 r"\(u=\cosh^{-1}x,\ dv=dx\ \Rightarrow\ du=\dfrac{1}{\sqrt{x^2-1}}dx,\ v=x\)",
 r"x\cosh^{-1}x-\sqrt{x^2-1}+c",
 ('i','acosh(x)','x*acosh(x)-sqrt(x**2-1)',[2,3]))
add("D12","D1",f"النهائي 1445 ف1 · الجزء الثاني(2) · {E451} ص11",
 r"\int x^2\cosh x\,dx",
 r"\(u=x^2,\ dv=\cosh x\,dx\) ثم تجزئة ثانية بـ \(u=2x,\ dv=\sinh x\,dx\)",
 r"x^2\sinh x-2x\cosh x+2\sinh x+c",
 ('i','x**2*cosh(x)','x**2*sinh(x)-2*x*cosh(x)+2*sinh(x)',[0.5,2]))
add("D13","D2",f"النهائي 1446 ف1 · س2(2) · {E461} ص11",
 r"\int x^{-3}\ln|x|\,dx",
 r"\(u=\ln|x|,\ dv=x^{-3}dx\ \Rightarrow\ du=\dfrac1xdx,\ v=\dfrac{-1}{2x^2}\)",
 r"-\frac{\ln|x|}{2x^2}-\frac{1}{4x^2}+c",
 ('i','log(x)/x**3','-log(x)/(2*x**2)-1/(4*x**2)',[1,3]))
add("D14","D3",f"النهائي 1446 ف2 · س2(2) · {E461} ص26",
 r"\int x\tanh^{-1}x\,dx",
 r"\(u=\tanh^{-1}x,\ dv=x\,dx\ \Rightarrow\ du=\dfrac{1}{1-x^2}dx,\ v=\dfrac{x^2}{2}\)، والباقي \(\dfrac{-x^2}{1-x^2}=1-\dfrac{1}{1-x^2}\)",
 r"\frac{x^2}{2}\tanh^{-1}x+\frac{x}{2}-\frac12\tanh^{-1}x+c",
 ('i','x*atanh(x)','x**2/2*atanh(x)+x/2-atanh(x)/2',[0.3,0.7]))
add("D15","D1",f"النهائي 1447 ف1 · س2(2) · {E471} ص10",
 r"\int x^2\cos(3x)\,dx",
 r"\(u=x^2,\ dv=\cos(3x)\,dx\ \Rightarrow\ v=\dfrac13\sin(3x)\) ثم تجزئة ثانية",
 r"\frac{x^2}{3}\sin(3x)+\frac{2x}{9}\cos(3x)-\frac{2}{27}\sin(3x)+c",
 ('i','x**2*cos(3*x)','x**2/3*sin(3*x)+2*x/9*cos(3*x)-Rational(2,27)*sin(3*x)',[0.5,2]),'ch')
add("D16","D4",f"النهائي 1447 ف2 · س2(3) · {E471} ص25-26",
 r"\int e^{2x}\sin x\,dx",
 r"\(u=\sin x,\ dv=e^{2x}dx\) ثم \(u=\cos x,\ dv=e^{2x}dx\)، يرجع نفس التكامل فانقله للطرف الثاني",
 r"\frac25e^{2x}\sin x-\frac15e^{2x}\cos x+c",
 ('i','exp(2*x)*sin(x)','Rational(2,5)*exp(2*x)*sin(x)-exp(2*x)*cos(x)/5',[0.5,2]),'ch')

# ---------- E: trigonometric integrals (5.2) ----------
add("E01","E2",f"الثاني 1447 ف2 · س3(3) · {E471} ص21",
 r"\int\sec^3x\tan^3x\,dx",
 r"\(\tan\) فردي: اقطع \(\sec x\tan x\): \(\displaystyle\int\sec^2x\left(\sec^2x-1\right)\sec x\tan x\,dx,\ u=\sec x\)",
 r"\frac{\sec^5x}{5}-\frac{\sec^3x}{3}+c",
 ('i','sec(x)**3*tan(x)**3','sec(x)**5/5-sec(x)**3/3',[0.5,1]),'m2')
add("E02","E1",f"الثاني 1447 ف1 · س2(3) · {E471} ص6",
 r"\int\sin^2x\cos^5x\,dx",
 r"\(\cos\) فردي: اقطع \(\cos x\): \(\displaystyle\int\sin^2x\left(1-\sin^2x\right)^2\cos x\,dx,\ u=\sin x\)",
 r"\frac{\sin^3x}{3}-\frac{2\sin^5x}{5}+\frac{\sin^7x}{7}+c",
 ('i','sin(x)**2*cos(x)**5','sin(x)**3/3-2*sin(x)**5/5+sin(x)**7/7',[0.5,1]),'m1')
add("E03","E3",f"الثاني 1446 ف2 · س2(4) · {E461} ص22",
 r"\int\cot^4x\csc^4x\,dx",
 r"\(\csc\) زوجي: اقطع \(\csc^2x\): \(\displaystyle\int\cot^4x\left(1+\cot^2x\right)\csc^2x\,dx,\ u=\cot x,\ du=-\csc^2x\,dx\)",
 r"-\frac{\cot^5x}{5}-\frac{\cot^7x}{7}+c",
 ('i','cot(x)**4*csc(x)**4','-cot(x)**5/5-cot(x)**7/7',[0.5,1]))
add("E04","E1",f"الثاني 1446 ف1 · س2(6) · {E461} ص7",
 r"\int\sin^4x\cos^5x\,dx",
 r"\(\cos\) فردي: اقطع \(\cos x\): \(\displaystyle\int\sin^4x\left(1-\sin^2x\right)^2\cos x\,dx,\ u=\sin x\)",
 r"\frac{\sin^5x}{5}-\frac{2\sin^7x}{7}+\frac{\sin^9x}{9}+c",
 ('i','sin(x)**4*cos(x)**5','sin(x)**5/5-2*sin(x)**7/7+sin(x)**9/9',[0.5,1]))
add("E05","E2",f"الثاني 1445 ف2 · س2(3) · {E451} ص23",
 r"\int\tan^2x\sec^4x\,dx",
 r"\(\sec\) زوجي: اقطع \(\sec^2x\): \(\displaystyle\int\tan^2x\left(1+\tan^2x\right)\sec^2x\,dx,\ u=\tan x\)",
 r"\frac{\tan^3x}{3}+\frac{\tan^5x}{5}+c",
 ('i','tan(x)**2*sec(x)**4','tan(x)**3/3+tan(x)**5/5',[0.5,1]))
add("E06","E1",f"الثاني 1445 ف1 · س2(4) · {E451} ص7",
 r"\int\sin^5x\cos^3x\,dx",
 r"اقطع \(\cos x\): \(\displaystyle\int\sin^5x\left(1-\sin^2x\right)\cos x\,dx,\ u=\sin x\)",
 r"\frac{\sin^6x}{6}-\frac{\sin^8x}{8}+c",
 ('i','sin(x)**5*cos(x)**3','sin(x)**6/6-sin(x)**8/8',[0.5,1]))
add("E07","E1",f"النهائي 1445 ف2 · الجزء الثاني(6) · {E451} ص29",
 r"\int\sin^5x\cos^6x\,dx",
 r"\(\sin\) فردي: اقطع \(\sin x\): \(\displaystyle\int\left(1-\cos^2x\right)^2\cos^6x\sin x\,dx,\ u=\cos x,\ du=-\sin x\,dx\)",
 r"-\frac{\cos^7x}{7}+\frac{2\cos^9x}{9}-\frac{\cos^{11}x}{11}+c",
 ('i','sin(x)**5*cos(x)**6','-cos(x)**7/7+2*cos(x)**9/9-cos(x)**11/11',[0.5,1]))
add("E08","E2",f"النهائي 1447 ف1 · س2(6) · {E471} ص12",
 r"\int\tan^3x\sec^2x\,dx",
 r"مشتقة \(\tan x\) موجودة جاهزة: \(u=\tan x,\ du=\sec^2x\,dx\)",
 r"\frac{\tan^4x}{4}+c",
 ('i','tan(x)**3*sec(x)**2','tan(x)**4/4',[0.5,1]),'ch')
add("E09","E4",f"{NOTES} ص68 · مثال1(3)",
 r"\int\cos^4(2x)\,dx",
 r"زوجي لحاله: \(\cos^2(2x)=\dfrac{1+\cos4x}{2}\) فتصير \(\displaystyle\int\left(\frac{1+\cos4x}{2}\right)^2dx\)",
 r"\frac38x+\frac18\sin4x+\frac{1}{64}\sin8x+c",
 ('i','cos(2*x)**4','Rational(3,8)*x+sin(4*x)/8+sin(8*x)/64',[0.5,1]))
add("E10","E4",f"{NOTES} ص70 · مثال2(4)",
 r"\int\sin^2x\cos^4x\,dx",
 r"الاثنين زوجي: \(\sin^2x=\dfrac{1-\cos2x}{2},\ \cos^2x=\dfrac{1+\cos2x}{2}\)",
 r"\frac{x}{16}-\frac{1}{64}\sin4x+\frac{1}{48}\sin^32x+c",
 ('i','sin(x)**2*cos(x)**4','x/16-sin(4*x)/64+sin(2*x)**3/48',[0.5,1]))
add("E11","E5",f"{NOTES} ص75 · مثال5(1)",
 r"\int\sin7x\cos5x\,dx",
 r"\(\sin mx\cos nx=\dfrac12\left[\sin(m-n)x+\sin(m+n)x\right]\) فتصير \(\displaystyle\frac12\int\left(\sin2x+\sin12x\right)dx\)",
 r"-\frac14\cos2x-\frac{1}{24}\cos12x+c",
 ('i','sin(7*x)*cos(5*x)','-cos(2*x)/4-cos(12*x)/24',[0.5,1]))
add("E12","E2",f"{NOTES} ص71 · مثال3(1)",
 r"\int\sec^3x\,dx",
 r"\(\sec\) فردي لحاله: تجزئة \(u=\sec x,\ dv=\sec^2x\,dx\) ثم \(\tan^2x=\sec^2x-1\) وانقل التكامل",
 r"\frac12\left(\sec x\tan x+\ln\left|\sec x+\tan x\right|\right)+c",
 ('i','sec(x)**3','(sec(x)*tan(x)+log(sec(x)+tan(x)))/2',[0.5,1]))
add("E13","E2",f"{NOTES} ص71-72 · مثال3(2)",
 r"\int\tan^4x\,dx",
 r"\(\tan\) لحاله: \(\tan^4x=\tan^2x\left(\sec^2x-1\right)\) وكرّرها",
 r"\frac{\tan^3x}{3}-\tan x+x+c",
 ('i','tan(x)**4','tan(x)**3/3-tan(x)+x',[0.5,1]))

# ---------- F: trigonometric substitution (5.3) ----------
add("F01","F1",f"الثاني 1447 ف2 · س3(5) · {E471} ص22 (ونفسه الثاني 1445 ف2 س2(9))",
 r"\int\frac{1}{\left(4-x^2\right)^{\frac32}}\,dx",
 r"\(x=2\sin\theta,\ dx=2\cos\theta\,d\theta,\ \left(4-x^2\right)^{3/2}=2^3\cos^3\theta\) فتصير \(\displaystyle\frac14\int\sec^2\theta\,d\theta\)",
 r"\frac14\cdot\frac{x}{\sqrt{4-x^2}}+c",
 ('i','1/(4-x**2)**Rational(3,2)','x/(4*sqrt(4-x**2))',[0.5,1.5]),'m2')
add("F02","F2",f"الثاني 1447 ف1 · س2(6) · {E471} ص7",
 r"\int\frac{1}{\left(9+x^2\right)^{\frac32}}\,dx",
 r"\(x=3\tan\theta,\ dx=3\sec^2\theta\,d\theta,\ \left(9+x^2\right)^{3/2}=3^3\sec^3\theta\) فتصير \(\displaystyle\frac19\int\cos\theta\,d\theta\)",
 r"\frac19\cdot\frac{x}{\sqrt{x^2+9}}+c",
 ('i','1/(9+x**2)**Rational(3,2)','x/(9*sqrt(x**2+9))',[0.5,2]),'m1')
add("F03","F1",f"الثاني 1446 ف2 · س2(6) · {E461} ص23",
 r"\int\frac{1}{\left(9-x^2\right)^{\frac32}}\,dx",
 r"\(x=3\sin\theta,\ dx=3\cos\theta\,d\theta,\ \left(9-x^2\right)^{3/2}=3^3\cos^3\theta\) فتصير \(\displaystyle\frac19\int\sec^2\theta\,d\theta\)",
 r"\frac19\cdot\frac{x}{\sqrt{9-x^2}}+c",
 ('i','1/(9-x**2)**Rational(3,2)','x/(9*sqrt(9-x**2))',[0.5,2]))
add("F04","F3",f"الثاني 1446 ف1 · س2(7) · {E461} ص7",
 r"\int\frac{\sqrt{x^2-9}}{x}\,dx",
 r"\(x=3\sec\theta,\ dx=3\sec\theta\tan\theta\,d\theta,\ \sqrt{x^2-9}=3\tan\theta\) فتصير \(\displaystyle3\int\tan^2\theta\,d\theta\)",
 r"\sqrt{x^2-9}-3\sec^{-1}\left(\frac{x}{3}\right)+c",
 ('i','sqrt(x**2-9)/x','sqrt(x**2-9)-3*asec(x/3)',[4,6]))
add("F05","F2",f"الثاني 1445 ف1 · س2(6) · {E451} ص7-8",
 r"\int\frac{dx}{\left(4+x^2\right)^{\frac32}}",
 r"\(x=2\tan\theta,\ dx=2\sec^2\theta\,d\theta,\ \left(4+x^2\right)^{3/2}=2^3\sec^3\theta\) فتصير \(\displaystyle\frac14\int\cos\theta\,d\theta\)",
 r"\frac14\cdot\frac{x}{\sqrt{4+x^2}}+c",
 ('i','1/(4+x**2)**Rational(3,2)','x/(4*sqrt(4+x**2))',[0.5,2]))
add("F06","F3",f"النهائي 1445 ف1 · الجزء الثاني(3) · {E451} ص11-12",
 r"\int\frac{1}{x^2\sqrt{x^2-4}}\,dx",
 r"\(x=2\sec\theta,\ dx=2\sec\theta\tan\theta\,d\theta,\ \sqrt{x^2-4}=2\tan\theta\) فتصير \(\displaystyle\frac14\int\cos\theta\,d\theta\)",
 r"\frac14\cdot\frac{\sqrt{x^2-4}}{x}+c",
 ('i','1/(x**2*sqrt(x**2-4))','sqrt(x**2-4)/(4*x)',[3,5]))
add("F07","F2",f"النهائي 1446 ف1 · س2(3) · {E461} ص11-12",
 r"\int\frac{\sqrt{x^2+9}}{x^4}\,dx",
 r"\(x=3\tan\theta,\ \sqrt{x^2+9}=3\sec\theta\) فتصير \(\displaystyle\frac19\int\frac{\sec^3\theta}{\tan^4\theta}\,d\theta=\frac19\int(\sin\theta)^{-4}\cos\theta\,d\theta\)",
 r"-\frac{1}{27}\left(\frac{\sqrt{x^2+9}}{x}\right)^{3}+c",
 ('i','sqrt(x**2+9)/x**4','-(sqrt(x**2+9)/x)**3/27',[1,3]))
add("F08","F1",f"النهائي 1447 ف1 · س2(5) · {E471} ص11-12",
 r"\int\frac{x^2}{\left(4-x^2\right)^{\frac32}}\,dx",
 r"\(x=2\sin\theta\) فتصير \(\displaystyle\int\tan^2\theta\,d\theta=\int\left(\sec^2\theta-1\right)d\theta\)",
 r"\frac{x}{\sqrt{4-x^2}}-\sin^{-1}\left(\frac{x}{2}\right)+c",
 ('i','x**2/(4-x**2)**Rational(3,2)','x/sqrt(4-x**2)-asin(x/2)',[0.5,1.5]),'ch')
add("F09","F1",f"النهائي 1447 ف2 · س2(5) · {E471} ص26-27",
 r"\int\frac{1}{x^2\sqrt{9-x^2}}\,dx",
 r"\(x=3\sin\theta,\ \sqrt{9-x^2}=3\cos\theta\) فتصير \(\displaystyle\frac19\int\csc^2\theta\,d\theta\)",
 r"-\frac19\cdot\frac{\sqrt{9-x^2}}{x}+c",
 ('i','1/(x**2*sqrt(9-x**2))','-sqrt(9-x**2)/(9*x)',[0.5,2]),'ch')
add("F10","F2",f"{NOTES} ص79 · مثال(4)",
 r"\int\frac{1}{\left(x^2+8x+25\right)^{\frac32}}\,dx",
 r"إكمال مربع أولاً: \((x+4)^2+3^2\) ثم \(x+4=3\tan\theta\)",
 r"\frac19\cdot\frac{x+4}{\sqrt{x^2+8x+25}}+c",
 ('i','1/(x**2+8*x+25)**Rational(3,2)','(x+4)/(9*sqrt(x**2+8*x+25))',[0,2]))
add("F11","F3",f"{NOTES} ص78-79 · مثال(3)",
 r"\int\frac{\sqrt{x^2-25}}{x^4}\,dx",
 r"\(x=5\sec\theta,\ \sqrt{x^2-25}=5\tan\theta\) فتصير \(\displaystyle\frac{1}{25}\int\sin^2\theta\cos\theta\,d\theta\)",
 r"\frac{1}{75}\left(\frac{\sqrt{x^2-25}}{x}\right)^{3}+c",
 ('i','sqrt(x**2-25)/x**4','(sqrt(x**2-25)/x)**3/75',[6,8]))

# ---------- G: partial fractions (5.4) ----------
add("G01","G1",f"الثاني 1447 ف2 · س3(6) · {E471} ص22-23",
 r"\int\frac{3x^2+x+4}{x\left(x^2+4\right)}\,dx",
 r"\(\dfrac{3x^2+x+4}{x(x^2+4)}=\dfrac{A}{x}+\dfrac{Bx+C}{x^2+4}\) ثم \(3x^2+x+4=(A+B)x^2+Cx+4A\)",
 r"\ln|x|+\ln\left(x^2+4\right)+\frac12\tan^{-1}\left(\frac{x}{2}\right)+c",
 ('i','(3*x**2+x+4)/(x*(x**2+4))','log(x)+log(x**2+4)+atan(x/2)/2',[1,3]),'m2')
add("G02","G3",f"الثاني 1447 ف1 · س2(8) · {E471} ص7-8",
 r"\int\frac{2x+1}{x^2\left(1+x^2\right)}\,dx",
 r"\(x^2\) عامل مكرر: \(\dfrac{A_1}{x}+\dfrac{A_2}{x^2}+\dfrac{Bx+C}{1+x^2}\)",
 r"2\ln|x|-\frac{1}{x}-\ln\left(1+x^2\right)-\tan^{-1}x+c",
 ('i','(2*x+1)/(x**2*(1+x**2))','2*log(x)-1/x-log(1+x**2)-atan(x)',[1,3]),'m1')
add("G03","G1",f"الثاني 1446 ف2 · س2(9) · {E461} ص24",
 r"\int\frac{x^2+x+9}{x^3+9x}\,dx",
 r"حلّل: \(x^3+9x=x(x^2+9)\) ثم \(\dfrac{A}{x}+\dfrac{Bx+C}{x^2+9}\)",
 r"\ln|x|+\frac13\tan^{-1}\left(\frac{x}{3}\right)+c",
 ('i','(x**2+x+9)/(x**3+9*x)','log(x)+atan(x/3)/3',[1,3]))
add("G04","G1",f"الثاني 1446 ف1 · س2(8) · {E461} ص8",
 r"\int\frac{5x^2+x+8}{x^3+4x}\,dx",
 r"حلّل: \(x^3+4x=x(x^2+4)\) ثم \(\dfrac{A}{x}+\dfrac{Bx+C}{x^2+4}\)",
 r"2\ln|x|+\frac32\ln\left(x^2+4\right)+\frac12\tan^{-1}\left(\frac{x}{2}\right)+c",
 ('i','(5*x**2+x+8)/(x**3+4*x)','2*log(x)+3*log(x**2+4)/2+atan(x/2)/2',[1,3]))
add("G05","G1",f"الثاني 1445 ف2 · س2(8) · {E451} ص24-25",
 r"\int\frac{3x^2+3x+8}{x^3+4x}\,dx",
 r"حلّل: \(x(x^2+4)\) ثم \(\dfrac{A}{x}+\dfrac{Bx+C}{x^2+4}\)",
 r"2\ln|x|+\frac12\ln\left(x^2+4\right)+\frac32\tan^{-1}\left(\frac{x}{2}\right)+c",
 ('i','(3*x**2+3*x+8)/(x**3+4*x)','2*log(x)+log(x**2+4)/2+3*atan(x/2)/2',[1,3]))
add("G06","G1",f"الثاني 1445 ف1 · س2(8) · {E451} ص8-9",
 r"\int\frac{x+3}{x^3+9x}\,dx",
 r"حلّل: \(x(x^2+9)\) ثم \(\dfrac{A}{x}+\dfrac{Bx+C}{x^2+9}\)",
 r"\frac13\ln|x|-\frac16\ln\left(x^2+9\right)+\frac13\tan^{-1}\left(\frac{x}{3}\right)+c",
 ('i','(x+3)/(x**3+9*x)','log(x)/3-log(x**2+9)/6+atan(x/3)/3',[1,3]))
add("G07","G1",f"النهائي 1445 ف1 · الجزء الثاني(4) · {E451} ص12",
 r"\int\frac{4x^2-x+12}{x^3+4x}\,dx",
 r"حلّل: \(x(x^2+4)\) ثم \(\dfrac{A}{x}+\dfrac{Bx+C}{x^2+4}\)",
 r"3\ln|x|+\frac12\ln\left(x^2+4\right)-\frac12\tan^{-1}\left(\frac{x}{2}\right)+c",
 ('i','(4*x**2-x+12)/(x**3+4*x)','3*log(x)+log(x**2+4)/2-atan(x/2)/2',[1,3]))
add("G08","G2",f"النهائي 1445 ف2 · الجزء الثاني(4) · {E451} ص28",
 r"\int\frac{3x+1}{x^2+2x-8}\,dx",
 r"حلّل: \(x^2+2x-8=(x-2)(x+4)\) ثم \(\dfrac{A_1}{x-2}+\dfrac{A_2}{x+4}\) وعوّض \(x=2\) و \(x=-4\)",
 r"\frac76\ln|x-2|+\frac{11}{6}\ln|x+4|+c",
 ('i','(3*x+1)/(x**2+2*x-8)','Rational(7,6)*log(x-2)+Rational(11,6)*log(x+4)',[3,5]))
add("G09","G1",f"النهائي 1446 ف1 · س2(4) · {E461} ص12",
 r"\int\frac{3x+1}{x^3+x}\,dx",
 r"حلّل: \(x(x^2+1)\) ثم \(\dfrac{A}{x}+\dfrac{Bx+C}{x^2+1}\)",
 r"\ln|x|-\frac12\ln\left(x^2+1\right)+3\tan^{-1}x+c",
 ('i','(3*x+1)/(x**3+x)','log(x)-log(x**2+1)/2+3*atan(x)',[1,3]))
add("G10","G1",f"النهائي 1446 ف2 · س2(3) · {E461} ص26-27",
 r"\int\frac{3x^2+x+8}{x^3+4x}\,dx",
 r"حلّل: \(x(x^2+4)\) ثم \(\dfrac{A}{x}+\dfrac{Bx+C}{x^2+4}\)",
 r"2\ln|x|+\frac12\ln\left(x^2+4\right)+\frac12\tan^{-1}\left(\frac{x}{2}\right)+c",
 ('i','(3*x**2+x+8)/(x**3+4*x)','2*log(x)+log(x**2+4)/2+atan(x/2)/2',[1,3]))
add("G11","G1",f"النهائي 1447 ف1 · س2(4) · {E471} ص11",
 r"\int\frac{5x^2+6x+4}{(x+1)\left(x^2+x+1\right)}\,dx",
 r"\(x^2+x+1\) ما يتحلل: \(\dfrac{A}{x+1}+\dfrac{Bx+C}{x^2+x+1}\)",
 r"3\ln|x+1|+\ln\left|x^2+x+1\right|+c",
 ('i','(5*x**2+6*x+4)/((x+1)*(x**2+x+1))','3*log(x+1)+log(x**2+x+1)',[1,3]),'ch')
add("G12","G2",f"النهائي 1447 ف2 · س2(4) · {E471} ص26",
 r"\int\frac{3x^2+1}{\left(x^2-1\right)\left(x^2+1\right)}\,dx",
 r"\(x^2-1=(x-1)(x+1)\): \(\dfrac{A_1}{x-1}+\dfrac{A_2}{x+1}+\dfrac{Bx+C}{x^2+1}\)",
 r"\ln|x-1|-\ln|x+1|+\tan^{-1}x+c",
 ('i','(3*x**2+1)/((x**2-1)*(x**2+1))','log(x-1)-log(x+1)+atan(x)',[2,4]),'ch')
add("G13","G3",f"{NOTES} ص84 · مثال4(2)",
 r"\int\frac{7x^2+11x+5}{x^3+2x^2+x}\,dx",
 r"حلّل: \(x(x^2+2x+1)=x(x+1)^2\) ثم \(\dfrac{A_1}{x}+\dfrac{A_2}{x+1}+\dfrac{A_3}{(x+1)^2}\)",
 r"5\ln|x|+2\ln|x+1|+\frac{1}{x+1}+c",
 ('i','(7*x**2+11*x+5)/(x**3+2*x**2+x)','5*log(x)+2*log(x+1)+1/(x+1)',[1,3]))
add("G14","G4",f"{NOTES} ص83 · مثال3(6) (التفكيك من المذكرة، والتكامل تمرين)",
 r"\int\frac{x^4+2}{x^3+x}\,dx",
 r"درجة البسط أكبر: قسمة مطولة \(\dfrac{x^4+2}{x^3+x}=x+\dfrac{-x^2+2}{x(x^2+1)}\) ثم \(\dfrac{A}{x}+\dfrac{Bx+C}{x^2+1}\)",
 r"\frac{x^2}{2}+2\ln|x|-\frac32\ln\left(x^2+1\right)+c",
 ('i','(x**4+2)/(x**3+x)','x**2/2+2*log(x)-3*log(x**2+1)/2',[1,3]))

# ---------- H: miscellaneous substitutions (5.5) ----------
add("H01","H1",f"الثاني 1447 ف2 · س3(7) · {E471} ص23",
 r"\int\frac{1}{x^{\frac12}+x^{\frac34}}\,dx",
 r"المقامات 2 و 4 ومضاعفهم 4: \(x=u^4,\ dx=4u^3du\) فتصير \(\displaystyle4\int\frac{u^3}{u^2+u^3}\,du=4\int\frac{u}{u+1}\,du\)",
 r"4x^{\frac14}-4\ln\left|x^{\frac14}+1\right|+c",
 ('i','1/(sqrt(x)+x**Rational(3,4))','4*x**Rational(1,4)-4*log(x**Rational(1,4)+1)',[1,5]),'m2')
add("H02","H1",f"الثاني 1447 ف1 · س2(9) · {E471} ص8",
 r"\int\frac{1}{x^{\frac12}+x^{\frac23}}\,dx",
 r"المقامات 2 و 3 ومضاعفهم 6: \(x=u^6,\ dx=6u^5du\) فتصير \(\displaystyle6\int\frac{u^5}{u^3+u^4}\,du=6\int\frac{u^2}{u+1}\,du\) ثم قسمة مطولة",
 r"3x^{\frac13}-6x^{\frac16}+6\ln\left|x^{\frac16}+1\right|+c",
 ('i','1/(sqrt(x)+x**Rational(2,3))','3*x**Rational(1,3)-6*x**Rational(1,6)+6*log(x**Rational(1,6)+1)',[1,5]),'m1')
add("H03","H1",f"الثاني 1446 ف1 · س2(9) · {E461} ص8-9 (ونفسه الثاني 1445 ف1 س2(9))",
 r"\int\frac{dx}{\sqrt[4]{x}+\sqrt{x}}",
 r"\(x=u^4,\ dx=4u^3du\) فتصير \(\displaystyle\int\frac{4u^3}{u+u^2}\,du=4\int\frac{u^2}{u+1}\,du\) ثم قسمة مطولة",
 r"2x^{\frac12}-4x^{\frac14}+4\ln\left|x^{\frac14}+1\right|+c",
 ('i','1/(x**Rational(1,4)+sqrt(x))','2*sqrt(x)-4*x**Rational(1,4)+4*log(x**Rational(1,4)+1)',[1,5]))
add("H04","H2",f"الثاني 1445 ف2 · س2(6) · {E451} ص24",
 r"\int\frac{1}{\sqrt{4+\sqrt{x}}}\,dx",
 r"\(u=\sqrt{4+\sqrt x}\Rightarrow x=\left(u^2-4\right)^2,\ dx=4u\left(u^2-4\right)du\) فتصير \(\displaystyle4\int\left(u^2-4\right)du\)",
 r"\frac43\left(4+\sqrt{x}\right)^{\frac32}-16\sqrt{4+\sqrt{x}}+c",
 ('i','1/sqrt(4+sqrt(x))','Rational(4,3)*(4+sqrt(x))**Rational(3,2)-16*sqrt(4+sqrt(x))',[1,5]))
add("H05","H1",f"النهائي 1445 ف1 · الجزء الثاني(5) · {E451} ص13",
 r"\int\frac{1}{\sqrt{x}+\sqrt[3]{x}}\,dx",
 r"\(x=u^6,\ dx=6u^5du\) فتصير \(\displaystyle6\int\frac{u^5}{u^3+u^2}\,du=6\int\frac{u^3}{u+1}\,du\) ثم قسمة مطولة",
 r"2x^{\frac12}-3x^{\frac13}+6x^{\frac16}-6\ln\left|x^{\frac16}+1\right|+c",
 ('i','1/(sqrt(x)+x**Rational(1,3))','2*sqrt(x)-3*x**Rational(1,3)+6*x**Rational(1,6)-6*log(x**Rational(1,6)+1)',[1,5]))
add("H06","H1",f"النهائي 1445 ف2 · الجزء الثاني(5) · {E451} ص28",
 r"\int\frac{1}{x+\sqrt[3]{x}}\,dx",
 r"\(x=u^3,\ dx=3u^2du\) فتصير \(\displaystyle\int\frac{3u^2}{u^3+u}\,du=3\int\frac{u}{u^2+1}\,du\)",
 r"\frac32\ln\left(x^{\frac23}+1\right)+c",
 ('i','1/(x+x**Rational(1,3))','Rational(3,2)*log(x**Rational(2,3)+1)',[1,5]))
add("H07","H2",f"النهائي 1446 ف1 · س2(5) · {E461} ص12",
 r"\int\frac{1}{\sqrt{x}\,(1+x)}\,dx",
 r"\(u=\sqrt x\Rightarrow x=u^2,\ dx=2u\,du\) فتصير \(\displaystyle2\int\frac{1}{1+u^2}\,du\)",
 r"2\tan^{-1}\left(\sqrt{x}\right)+c",
 ('i','1/(sqrt(x)*(1+x))','2*atan(sqrt(x))',[1,5]))
add("H08","H2",f"{NOTES} ص89 · مثال2(1)",
 r"\int\sqrt{1+\sqrt{x}}\,dx",
 r"\(u=\sqrt{1+\sqrt x}\Rightarrow x=\left(u^2-1\right)^2,\ dx=\left(4u^3-4u\right)du\) فتصير \(\displaystyle\int\left(4u^4-4u^2\right)du\)",
 r"\frac45\left(1+\sqrt{x}\right)^{\frac52}-\frac43\left(1+\sqrt{x}\right)^{\frac32}+c",
 ('i','sqrt(1+sqrt(x))','Rational(4,5)*(1+sqrt(x))**Rational(5,2)-Rational(4,3)*(1+sqrt(x))**Rational(3,2)',[1,5]))
add("H09","H2",f"{NOTES} ص89-90 · مثال2(2)",
 r"\int\frac{dx}{\sqrt{e^{x}+1}}",
 r"\(u=\sqrt{e^x+1}\Rightarrow x=\ln\left(u^2-1\right),\ dx=\dfrac{2u}{u^2-1}du\) فتصير \(\displaystyle\int\frac{2}{u^2-1}\,du\) ثم كسور جزئية",
 r"\ln\left|\sqrt{e^{x}+1}-1\right|-\ln\left|\sqrt{e^{x}+1}+1\right|+c",
 ('i','1/sqrt(exp(x)+1)','log(sqrt(exp(x)+1)-1)-log(sqrt(exp(x)+1)+1)',[0.5,2]))


def verify():
    ns = {n: getattr(sp, n) for n in dir(sp) if not n.startswith('_')}
    ns.update(x=x)
    bad = 0
    for it in B:
        c = it['chk']; ok = True; msg = ''
        try:
            if c[0] in ('d', 'i'):
                f1 = sp.sympify(c[1], locals=ns); f2 = sp.sympify(c[2], locals=ns)
                if c[0] == 'd':
                    lhs, rhs = sp.diff(f1, x), f2
                else:
                    lhs, rhs = sp.diff(f2, x), f1
                for p in c[3]:
                    v = complex(sp.N((lhs - rhs).subs(x, sp.Float(p)), 30))
                    if abs(v) > 1e-9:
                        ok = False; msg += f' x={p}: diff={v}'
            elif c[0] == 'di':
                f1 = sp.sympify(c[1], locals=ns)
                val = sp.integrate(f1, (x, sp.sympify(c[2], locals=ns), sp.sympify(c[3], locals=ns)))
                if abs(complex(sp.N(val - sp.sympify(c[4], locals=ns), 30))) > 1e-9:
                    ok = False; msg = f' got {val}'
            elif c[0] == 'l':
                e = sp.sympify(c[1], locals=ns)
                L = sp.limit(e, x, sp.sympify(str(c[2]), locals=ns), c[3])
                if abs(complex(sp.N(L - sp.sympify(c[4], locals=ns), 30))) > 1e-9:
                    ok = False; msg = f' got {L}'
        except Exception as ex:
            ok = False; msg = ' EXC ' + repr(ex)
        if not ok:
            bad += 1
            print('FAIL', it['id'], msg)
    print(f'checked {len(B)} items, {bad} failed')
    return bad

if __name__ == '__main__':
    bad = verify()
    out = dict(types={k: dict(les=v[0], name=v[1]) for k, v in TYPES.items()},
               items=[{k: v for k, v in it.items() if k != 'chk'} for it in B])
    json.dump(out, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    sys.exit(1 if bad else 0)
