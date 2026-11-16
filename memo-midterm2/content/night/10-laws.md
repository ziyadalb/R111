# القوانين اللي تحتاجها بس

::: box law المشتقات (4.1 و4.2)
مشتقات 4.1 مثل المثلثية، إلا إشارتين: $(\cosh f)'=\sinh f\cdot f'$ **بدون سالب**، و$(\sech f)'=-\sech f\tanh f\cdot f'$ **بسالب**.
$$\begin{aligned}
(\sinh^{-1}f)'&=\frac{f'}{\sqrt{1+f^2}} & (\csch^{-1}f)'&=\frac{-f'}{|f|\sqrt{1+f^2}}\\[2pt]
(\cosh^{-1}f)'&=\frac{f'}{\sqrt{f^2-1}} & (\sech^{-1}f)'&=\frac{-f'}{f\sqrt{1-f^2}}\\[2pt]
(\tanh^{-1}f)'&=\frac{f'}{1-f^2} & (\coth^{-1}f)'&=\frac{f'}{1-f^2}
\end{aligned}$$
و$\coth^{-1}$ **بدون سالب**، نفس $\tanh^{-1}$ (المذكرة كاتبتها غلط).
:::

::: box law تكاملات 4.2: الجذر والإشارة يختارون الدالة
| | $a^2-f^2$ | $a^2+f^2$ | $f^2-a^2$ |
|---|---|---|---|
| بدون جذر | $\frac1a\tanh^{-1}\frac fa$ | $\frac1a\tan^{-1}\frac fa$ | سالب الأولى |
| جذر لحاله | $\sin^{-1}\frac fa$ | $\sinh^{-1}\frac fa$ | $\cosh^{-1}\frac fa$ أو $\ln\lvert f+\sqrt{f^2-a^2}\rvert$ |
| $f$ برّا الجذر | $-\frac1a\sech^{-1}\frac{\lvert f\rvert}a$ | $-\frac1a\csch^{-1}\frac{\lvert f\rvert}a$ | $\frac1a\sec^{-1}\frac{\lvert f\rvert}a$ |

**إكمال المربع بسطر:** القوس من نص معامل $x$، والثابت = قيمة العبارة عند الرقم اللي يصفّر القوس. مثلًا $x^2+6x+13$ عند $x=-3$ تساوي 4، فهي $(x+3)^2+4$. و$f'$ ناقصة؟ اضرب فوق وتحت في $f$ (مثل $e^{3x}$).
:::

::: box law التجزئة (5.1)
- **كثير حدود × دالة:** جدول، نشتق كثير الحدود لين الصفر، ونكامل الثاني، والإشارات $+\;-\;+$.
- **$x^n\ln x$:** $\int x^n\ln x\,dx=\frac{x^{n+1}}{n+1}\ln x-\frac{x^{n+1}}{(n+1)^2}+C$.
- **جاهزة تتأكد فيها:** $\int\tan^{-1}x\,dx=x\tan^{-1}x-\frac12\ln(1+x^2)$، و$\int\sin^{-1}x\,dx=x\sin^{-1}x+\sqrt{1-x^2}$، و$\int\cosh^{-1}x\,dx=x\cosh^{-1}x-\sqrt{x^2-1}$.
- **أسّية × زائدية:** $\cosh bx=\frac{e^{bx}+e^{-bx}}{2}$ و$\sinh bx=\frac{e^{bx}-e^{-bx}}{2}$. اضرب ووزّع، وكامل كل أسّية لحالها.
:::

::: box law التكاملات المثلثية (5.2)
- **قوة فردية لـ $\sin$ أو $\cos$:** خذ واحد منها مع $dx$، والباقي حوّله بـ $\sin^2x+\cos^2x=1$.
- **$\tan^m x\sec^n x$:** قوة $\sec$ زوجية؟ خذ $\sec^2x$ والباقي بـ $\sec^2x=1+\tan^2x$. قوة $\tan$ فردية؟ خذ $\sec x\tan x$ والباقي بـ $\tan^2x=\sec^2x-1$. ونفسها لـ $\cot^m x\csc^n x$ مع $\csc^2x=1+\cot^2x$.
:::

::: box law التعويض المثلثي (5.3)
تحت الجذر $a^2-x^2$: $x=a\sin\theta$. و$a^2+x^2$: $x=a\tan\theta$. و$x^2-a^2$: $x=a\sec\theta$. وبعدين المثلث يرجّعك لـ $x$.

**اختصار تتأكد فيه** (في الورقة اكتب التعويض والمثلث):
$$\int\frac{dx}{(a^2+x^2)^{3/2}}=\frac{x}{a^2\sqrt{a^2+x^2}}+C,\qquad\int\frac{dx}{(a^2-x^2)^{3/2}}=\frac{x}{a^2\sqrt{a^2-x^2}}+C$$
:::

::: box law الكسور الجزئية (5.4)
$$\frac{px^2+qx+r}{x(x^2+a^2)}=\frac Ax+\frac{Bx+D}{x^2+a^2},\qquad A=\frac{r}{a^2},\quad D=q,\quad B=p-A$$
$$\int=A\ln|x|+\frac B2\ln\big(x^2+a^2\big)+\frac Da\tan^{-1}\frac xa+C$$
وللمقام $x^2(x^2+1)$ القالب $\frac Ax+\frac{B}{x^2}+\frac{Cx+D}{x^2+1}$.
:::

::: box law 5.5 و6.1
- **أسس كسرية:** $n$ = المضاعف المشترك للمقامات، و$x=t^n$، و$dx=nt^{n-1}\,dt$. وبعدها القسمة المتناوبة: $\frac{t^2}{t+1}=t-1+\frac{1}{t+1}$.
- **جذر داخل جذر:** $t$ = الجذر كله.
- **لوبيتال:** $\frac00$ أو $\frac\infty\infty$: اشتق فوق لحال وتحت لحال. $\infty-\infty$: وحّد المقام. $0\cdot\infty$: انقل واحد للمقام. $1^\infty$ و$0^0$ و$\infty^0$: خذ $\ln$.
:::
