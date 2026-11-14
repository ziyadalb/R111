# <span class="num">4</span> من المذكرة بس: ما جاء في أي اختبار

<p class="lede">هذي أربع حالات في المذكرة، بس ما جات في أي فصلي ثاني ولا نهائي من 1445 إلى 1447. لكل وحدة فكرتها ومثال واحد محلول. اقرأها إذا عندك وقت، بعد ما تخلص الأنماط اللي قبلها.</p>

::: box note 1) قوى $\sin$ و$\cos$ كلها زوجية (5.2)
**الفكرة:** ما فيه قوة فردية تحجز منها، فخفّض القوة:
$$\sin^2x=\frac{1-\cos2x}{2},\qquad\cos^2x=\frac{1+\cos2x}{2}$$
**مثال (تمرين 13):**
$$\int\sin^2x\,dx=\int\frac{1-\cos2x}{2}\,dx=\frac x2-\frac{\sin2x}{4}+C$$
:::

::: box note 2) $\tan$ لحاله، أو $\sec$ لحاله (5.2)
**الفكرة:** طلّع $\tan^2x$ وحوّله $\sec^2x-1$. جزء ينحل بالقوة العكسية، والباقي قوته أقل باثنين.

**مثال (مثال 3 فقرة 2):**
$$\int\tan^4x\,dx=\int\tan^2x\big(\sec^2x-1\big)dx=\frac{\tan^3x}{3}-\int\tan^2x\,dx$$
$$=\frac{\tan^3x}{3}-\big(\tan x-x\big)+C$$
و$\int\sec x\,dx=\ln|\sec x+\tan x|+C$ قانون تحفظه.
:::

::: box note 3) زاويتين مختلفتين، مثل $\sin7x\cos5x$ (5.2)
**الفكرة:** حوّل الضرب لجمع:
$$\sin A\cos B=\tfrac12\big[\sin(A-B)+\sin(A+B)\big]$$
**مثال (مثال 5 فقرة 1):**
$$\int\sin7x\cos5x\,dx=\frac12\int\big(\sin2x+\sin12x\big)dx=-\frac{\cos2x}{4}-\frac{\cos12x}{24}+C$$
وفيه بعد: $\sin A\sin B=\frac12[\cos(A-B)-\cos(A+B)]$، و$\cos A\cos B=\frac12[\cos(A-B)+\cos(A+B)]$.
:::

::: box note 4) جذر داخل الدالة، مثل $\int e^{\sqrt x}\,dx$ (5.1)
**الفكرة:** هنا لازم تغيّر المتغير أول: حط $t=\sqrt x$، يعني $x=t^2$ و$dx=2t\,dt$. بعدها يصير ضرب عادي، وتسوي الجدول:
$$\int e^{\sqrt x}\,dx=2\int te^t\,dt=2\big(te^t-e^t\big)=2\big(\sqrt x-1\big)e^{\sqrt x}+C$$
:::
