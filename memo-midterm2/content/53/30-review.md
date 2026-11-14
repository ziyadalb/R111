# <span class="num">3</span> قبل الاختبار: كيف تختار؟ وأخطاء شائعة

<div class="h3">اسأل نفسك: وش تحت الجذر؟</div>

| تحت الجذر | عوّض | الجذر يصير | في المثلث | النمط |
|---|---|---|---|---|
| $a^2-x^2$ | $x=a\sin\theta$ | $a\cos\theta$ | المقابل $x$ والوتر $a$ | 1 |
| $a^2+x^2$ | $x=a\tan\theta$ | $a\sec\theta$ | المقابل $x$ والمجاور $a$ | 2 |
| $x^2-a^2$ | $x=a\sec\theta$ | $a\tan\theta$ | الوتر $x$ والمجاور $a$ | 3 |
| فيه حد $x$ لحاله | كمّل المربع أول | واحد من الثلاثة | نفسه، بـ $(x+k)$ مكان $x$ | 4 |

والضلع الثالث في المثلث هو الجذر دايمًا.

<div class="h3">أخطاء شائعة: شيك عليها في كل حل</div>

| الغلط | الصح |
|---|---|
| تعوّض $x$ وتنسى $dx$ | $dx$ يتعوّض مع الباقي، مثل $dx=a\cos\theta\,d\theta$ |
| $\big(4\cos^2\theta\big)^{3/2}=4\cos^3\theta$ | الرقم كمان يتجذّر ويتكعّب: $4^{3/2}=8$ |
| تكامل $\tan^2\theta$ هو $\frac{\tan^3\theta}{3}$ | $\tan^2\theta=\sec^2\theta-1$، وتكامله $\tan\theta-\theta$ |
| في $\sin\theta=\frac xa$ تحط $x$ وتر | $x$ مقابل و$a$ وتر، والجذر مجاور |
| في $\sec\theta=\frac xa$ تحط الجذر وتر | $x$ وتر و$a$ مجاور، والجذر مقابل |
| تخلي $\theta$ في الجواب | ارجع لـ $x$: بالمثلث، أو $\theta=\sin^{-1}\frac xa$ |
| في $\sqrt{9x^2-1}$ تعوّض $x=\sec\theta$ | $3x=\sec\theta$، لأن اللي يتربّع هو $3x$ |
| تكمّل مربع $32-x^2-4x$ والسالب داخل | طلّع السالب أول: $32-\big(x^2+4x\big)$ |
| تنسى $+C$ | تكامل غير محدود: $+C$ دايمًا |

<div class="h3">ورقة المراجعة</div>

::: box law كل اللي تحتاجه في صندوق
**التعويض** (بالترتيب لـ $a^2-x^2$ و$a^2+x^2$ و$x^2-a^2$):
$$x=a\sin\theta,\qquad x=a\tan\theta,\qquad x=a\sec\theta$$
**و$dx$:**
$$a\cos\theta\,d\theta,\qquad a\sec^2\theta\,d\theta,\qquad a\sec\theta\tan\theta\,d\theta$$
**والجذر يصير:**
$$a\cos\theta,\qquad a\sec\theta,\qquad a\tan\theta$$
**تكاملات $\theta$:**
$$\int\sec^2\theta\,d\theta=\tan\theta,\qquad\int\csc^2\theta\,d\theta=-\cot\theta,\qquad\int\sec\theta\,d\theta=\ln\big|\sec\theta+\tan\theta\big|$$
$$\int\tan^2\theta\,d\theta=\tan\theta-\theta,\qquad\int\cot^2\theta\,d\theta=-\cot\theta-\theta,\qquad\int\cos^2\theta\,d\theta=\tfrac12\theta+\tfrac12\sin\theta\cos\theta$$
**والرجوع:** المثلث للنسب، و$\theta=\sin^{-1}\frac xa$ أو $\tan^{-1}\frac xa$ أو $\sec^{-1}\frac xa$.
:::
