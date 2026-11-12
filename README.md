# R111

MATH 111 (Integral Calculus, KSU) study material.

- `*.pdf` — Dr. Tariq Alfadhel's class notes and solved past exams (1445–1447 H).
- `plan/index.html` — study plan for the second exam (sections 4.2–6.1): daily schedule,
  method-recognition map, formula tables, algebra kit, and a 109-question bank drawn from
  the past exams and notes. All math is pre-rendered, so the file has no runtime dependencies
  apart from web fonts.
- `plan/src/` — sources for the page.

## Rebuilding the plan

```sh
cd plan/src
pip install sympy && npm install mathjax-full@3.2.2
python3 bank.py bank.json      # verifies every answer with sympy, then exports the bank
node build.js ../index.html    # renders the math to SVG and writes the page
```
