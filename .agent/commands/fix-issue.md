# /fix-issue — fix a reported bug

1. Read the issue. Restate the failure in one sentence. **If there is no reproduction, ask for
   one** instead of guessing at a cause.
2. Write a failing test that reproduces it, and run it. Paste the red output into the PR body. A
   bug fixed without a reproduction is a bug that comes back.
   If the bug lives in a page, a server action or an RLS policy it cannot be unit-tested here —
   then write the exact steps you will follow against staging, and follow them.
3. Find the root cause, not the symptom. If the fix is a guard clause in a caller, ask whether the
   callee should be total instead.
4. Make the test pass. Run `.agent/verify.sh --full` if the change touches routing or config.
5. If the cause was non-obvious, add a line to `DESIGN.md` §"Traps"-equivalent or
   `.agent/context/phase.md` — that is how the next agent avoids it.
6. PR body: reproduction, root cause, fix, what you ran, what you could not.
