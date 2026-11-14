# <span class="num">1</span> الأساس: ليش نعوّض بزاوية؟ وكيف؟

<p class="lede">كل أسئلة 5.3 فيها جذر (أو قوس أسّه كسر) بداخله مربعين: $a^2-x^2$ أو $a^2+x^2$ أو $x^2-a^2$. هالجذر ما له تكامل مباشر. الحل: عوّض $x$ بدالة مثلثية تخلي اللي تحت الجذر مربع كامل، فيروح الجذر.</p>

<div class="h3">الفكرة في مثال واحد</div>

خذ $\sqrt{4-x^2}$، وحط $x=2\sin\theta$:
$$\sqrt{4-4\sin^2\theta}=\sqrt{4\big(1-\sin^2\theta\big)}=\sqrt{4\cos^2\theta}=2\cos\theta$$
راح الجذر، لأن $1-\sin^2\theta=\cos^2\theta$. وكل تعويض في 5.3 يشتغل بنفس الطريقة، بوحدة من هالمتطابقات الثلاث:
$$1-\sin^2\theta=\cos^2\theta,\qquad1+\tan^2\theta=\sec^2\theta,\qquad\sec^2\theta-1=\tan^2\theta$$

<div class="h3">أي تعويض؟ شوف الإشارة ومكان $x$</div>

| تحت الجذر | عوّض | $dx$ | الجذر يصير |
|---|---|---|---|
| $a^2-x^2$ (رقم ناقص $x^2$) | $x=a\sin\theta$ | $a\cos\theta\,d\theta$ | $a\cos\theta$ |
| $a^2+x^2$ (جمع) | $x=a\tan\theta$ | $a\sec^2\theta\,d\theta$ | $a\sec\theta$ |
| $x^2-a^2$ ($x^2$ ناقص رقم) | $x=a\sec\theta$ | $a\sec\theta\tan\theta\,d\theta$ | $a\tan\theta$ |

و$a$ هو جذر الرقم: في $9-x^2$ الرقم 9، فـ $a=3$.

::: box why ليش بدون قيمة مطلقة؟
بالأصل $\sqrt{a^2\cos^2\theta}=a\left|\cos\theta\right|$. بس المذكرة تحدد مجال الزاوية بحيث تطلع موجبة:
- $x=a\sin\theta$: الزاوية من $-\frac\pi2$ إلى $\frac\pi2$، وهناك $\cos\theta\ge0$.
- $x=a\tan\theta$: نفس المجال بدون الطرفين، و$\sec\theta>0$.
- $x=a\sec\theta$: الزاوية في $[0,\frac\pi2)$ أو $[\pi,\frac{3\pi}2)$، و$\tan\theta\ge0$ في الاثنين.

فتكتب $a\cos\theta$ و$a\sec\theta$ و$a\tan\theta$ مباشرة.
:::

<div class="h3">المثلث: كيف ترجع لـ $x$</div>

بعد التكامل يطلع الجواب بـ $\theta$، ولازم ترجعه لـ $x$. من التعويض اكتب النسبة، وحط ضلعين في مثلث قائم. **والضلع الثالث هو نفس الجذر اللي في السؤال**، ما تحتاج تحسبه:

@tris

بعدها اقرأ أي نسبة تبيها: $\sin$ = المقابل على الوتر، $\cos$ = المجاور على الوتر، $\tan$ = المقابل على المجاور، ومقلوباتها $\csc$ و$\sec$ و$\cot$. ولو بقت $\theta$ نفسها في الجواب، ترجعها من التعويض بدون مثلث: $\theta=\sin^{-1}\frac xa$ (أو $\tan^{-1}\frac xa$ أو $\sec^{-1}\frac xa$).

<div class="h3">تكاملات $\theta$ اللي بتطلع لك (من 5.2)</div>

بعد ما تعوّض وتشطب، يبقى تكامل بـ $\theta$. هذي كل الأشكال اللي جات في الاختبارات والمذكرة:

| يطلع لك | وش تسوي | التكامل |
|---|---|---|
| $\sec^2\theta$ | مباشر | $\tan\theta$ |
| $\cos\theta$ أو $\frac{1}{\sec\theta}$ | مباشر | $\sin\theta$ |
| $\csc^2\theta$ أو $\frac{1}{\sin^2\theta}$ | مباشر | $-\cot\theta$ |
| $1$ (كل شي انشطب) | مباشر | $\theta$ |
| $\sec\theta$ | قانون | $\ln\big\vert\sec\theta+\tan\theta\big\vert$ |
| $\tan^2\theta$ | $\sec^2\theta-1$ | $\tan\theta-\theta$ |
| $\cot^2\theta$ | $\csc^2\theta-1$ | $-\cot\theta-\theta$ |
| $\cos^2\theta$ | $\frac{1+\cos2\theta}{2}$ | $\frac12\theta+\frac12\sin\theta\cos\theta$ |
| $\frac{\cos\theta}{\sin^n\theta}$ أو $\sin^n\theta\cos\theta$ | القوة العكسية: $\cos\theta$ مشتقة $\sin\theta$ | زد أس $\sin\theta$ واقسم عليه |
| $\cos^3\theta$ | احجز $\cos\theta$، و$\cos^2\theta=1-\sin^2\theta$ | القوة العكسية لكل حد |

::: box steps الخطوات الخمس (في كل سؤال)
1. **اختر التعويض** من الجدول الأول، واكتب $dx$.
2. **بسّط الجذر** (أو القوس) بالمتطابقة.
3. **عوّض كل شي** واشطب، لين يبقى تكامل بـ $\theta$ بس.
4. **كامل** بجدول تكاملات $\theta$.
5. **ارجع لـ $x$** بالمثلث، و$\theta$ نفسها من التعويض. ولا تنسى $+C$.
:::

::: box short حيل 5.3: اختصارات تعلّمها
1. **الضلع الثالث هو الجذر:** في المثلث حط ضلعين من التعويض، والثالث هو نفس الجذر اللي في السؤال. ما تحتاج فيثاغورس.
2. **$\theta$ لحالها بدون مثلث:** ترجعها من التعويض نفسه: $\theta=\sin^{-1}\frac xa$، أو $\tan^{-1}\frac xa$، أو $\sec^{-1}\frac xa$.
3. **القوة العكسية بدل $u$:** لو طلع $\cos\theta$ مع قوة لـ $\sin\theta$ (حتى لو تحت الكسر)، اكتبها كقوة، وزد الأس واحد واقسم عليه:
   $$\int\frac{\cos\theta}{\sin^4\theta}\,d\theta=\int(\sin\theta)^{-4}\cos\theta\,d\theta=\frac{(\sin\theta)^{-3}}{-3}=-\frac{1}{3\sin^3\theta}$$
4. **الجذر لحاله تحت:** جوابه نفس قانون 4.2، فتقدر تتأكد فيه:
   $$\int\frac{dx}{\sqrt{x^2+a^2}}=\ln\big|x+\sqrt{x^2+a^2}\big|+C,\qquad\int\frac{dx}{\sqrt{x^2-a^2}}=\ln\big|x+\sqrt{x^2-a^2}\big|+C$$
5. **القوة $\frac32$:** لما البسط 1 والقوة $\frac32$ بالضبط (جاء هالشكل في 5 من 6 فصليات):
   $$\int\frac{dx}{\big(a^2\pm x^2\big)^{3/2}}=\frac{x}{a^2\sqrt{a^2\pm x^2}}+C$$
   تأكد فيه من جوابك، بس في الاختبار اكتب الحل بالتعويض كامل، لأن ما نعرف إذا الدكتور يقبل القانون بدون إثبات.
:::

::: box exam في ورقة الاختبار
- اكتب التعويض و$dx$ في سطر، وتبسيط الجذر في سطر.
- ارسم المثلث صغير جنب الحل، واكتب عليه الأضلاع الثلاثة.
- الجواب النهائي لازم يكون بـ $x$، ومعه $+C$.
:::

@checks B
