# /onboard — start a session in this repo

For an agent with no memory of previous sessions. Run before any task.

1. Read `AGENTS.md` §0. Then `DESIGN.md` in full — it is the conventions document and it records
   which choices are load-bearing.
2. Run `.agent/verify.sh`. Record the result. **If it is already red, stop and say so** — do not
   start work on top of a broken baseline, or you will not be able to tell your breakage from the
   pre-existing one.
3. State the task in one sentence, and which files you expect to touch. If it is ambiguous, ask
   now — before reading a thousand lines — not after.
4. Check `.agent/decisions/` for anything that constrains the change.
5. Only then read code, and only the code the task touches.

Output of this step: a two-line restatement of the task plus the baseline verify result. Nothing
else. Resist exploring the whole repository; it costs context and produces opinions nobody asked
for.
