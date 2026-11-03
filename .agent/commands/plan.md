# /plan — plan before coding

Use for any change touching more than one file, or anything in `src/lib/billing.ts` or
`src/lib/split.ts`, where the arithmetic is load-bearing.

Produce, in this order:

1. **Goal** — one sentence, phrased as user-visible behaviour.
2. **Current behaviour** — what happens today, read from the code, not assumed.
3. **Proposed change** — files to add/modify, and why each is needed.
4. **Invariants at risk** — from `DESIGN.md`: the price snapshot rule, integer paise, IST dates,
   the `--ui-` token prefix, the 721/900 breakpoints. Say which ones this touches and how you keep
   them.
5. **Data impact** — does this need a migration? Is it additive? Does it touch RLS?
6. **Test plan** — the specific test you will add or change.
7. **Out of scope** — what you are deliberately not touching.
8. **Unknowns** — what you would have to guess, and what you would ask a human.

Stop after the plan and wait for agreement. The review of a ten-line plan is minutes; the review
of a wrong 400-line diff is a day.
