# /ship — prepare a branch for review

1. `.agent/verify.sh` must pass. `--full` if the change touches routing, server components or
   config. If it does not pass, stop and report — do not open the PR.
2. Re-read your own diff as if it were someone else's. Delete anything unrelated: reformatting,
   drive-by renames, commented-out code, stray logs.
3. One concern per PR. If it does two things, split it — a build failure should point at one thing.
4. Commit messages: `<area>: <imperative summary>` and a body saying **why**.
5. PR body from the template. "How I verified this" must be honest; "build not run" is allowed and
   far better than an implied green build.
6. Do not merge, do not push to `main`, never force-push. A human merges.
7. If this ships a migration: it goes to staging first, then production, after merge.
