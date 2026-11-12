# ريض 111 · ملف مذاكرة 4.2 (الدوال الزائدية العكسية)

الملف الجاهز: `out/ريض111-4.2-الدوال-الزائدية-العكسية.pdf` (A5 للآيباد، فيه الشرح والتدريب والتلميحات والحلول).

## وين أعدّل؟

| أبي أغيّر | الملف |
|---|---|
| الغلاف | `content/42/00-cover.md` |
| الشرح (الدروس 1 إلى 5) | `content/42/10-basics.md` … `content/42/50-review.md` |
| مقدمات التدريب والتلميحات والحلول والملحق | `content/42/60-practice.md` … `content/42/90-appendix.md` |
| أسئلة السابقات (نص، تلميح، حل، جواب، مجال) | `content/questions/4.2-derivatives.yaml` و`4.2-integrals.yaml` |
| مسائل المذكرة | `content/42/data/notes.yaml` |
| أسئلة 4.1 | `content/42/data/past-4.1.yaml` |
| التصميم | `build/style-42.css` |

الكتابة Markdown عادي، والرياضيات LaTeX بين `$...$` (في السطر) أو `$$...$$` (سطر مستقل).

أوامر خاصة داخل ملفات الشرح:
- `@example M451-1-1` يعرض حل السؤال الكامل كمثال.
- `::: diff M452-1-1` … `:::` بطاقة «وش يختلف».
- `::: box steps عنوان` … `:::` صندوق ملوّن (الأنواع: recog, steps, why, warn, fix, short, more, alg, law, note, use).
- `@graphs` و`@graph41` و`@chart` و`@toc` و`@cover`.

## البناء

```bash
npm install
node build/build-42.mjs        # يطلع PDF في out/
```

يحتاج Chromium عن طريق Playwright، وPython مع `pypdf` (يكتب الفهرس الجانبي بعناوين عربية صحيحة).

## التحقق من الأجوبة

```bash
pip install sympy mpmath pyyaml
python3 verify/verify.py       # التقرير في verify/report.md
```

كل جواب يُشتق ويُقارن بالسؤال عدديًا في نقاط من كل جهة من المجال، وصيغ المفاتيح المطبوعة الغلط تُفحص إنها تغلط فعلًا.

## ملاحظة

بيانات أسئلة 5.1 إلى 6.1 موجودة في `content/questions/` (متحقق منها)، ومولّد الملفات العامة `build/build.mjs`، بس الملف النهائي الحالي لـ 4.2 بس.
