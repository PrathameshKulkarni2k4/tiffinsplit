# /review — review a change

1. Read `AGENTS.md` §3 and §4, and `DESIGN.md`. Conventions and traps, not style.
2. Establish the diff's **intent** before judging the code. If it is unclear, say so and stop.
3. Check, in this order, and report only what fails:
   - Correctness: does it do what the intent says, including the edges?
   - Money: integer paise throughout? formatted only at the edge with `money()`?
   - The price snapshot rule — does anything read a mess's *current* price for a past order?
   - Dates: `todayISO()` and not `toISOString()` for the business date?
   - RLS: does anything expose data the UI merely hides? That is a security bug, not a UI bug.
   - Migrations: additive, numbered, not an edit to an applied one, no destructive step bundled
     with a feature.
   - Tests: does new logic in `src/lib/` have one? Does an existing test now lie?
   - `--ui-` prefix intact; no new per-screen CSS classes; no class shadowing a Tailwind utility.
   - Secrets: nothing real committed, no key invented.
4. Style last, and only where `DESIGN.md` names a rule. Do not impose preferences.
5. Output: blocking issues first (file:line, why, suggested fix), then non-blocking, then an
   explicit "verified by running X" line — or "not run".
