# Phase

> Read first. An agent that does not know the phase will helpfully build features you have not
> started.

## Built (MVP)

Google sign-in behind the approval gate; messes with full/half prices; logging a tiffin with an
equal split to the paise; dashboard; per-person bills with a per-mess breakdown; messes owed;
monthly order history with delete; admin members page; billing engine with unit tests.

## Next

- **Settlements** — tracking who has actually paid whom. Bills currently show dues, not payments.
- **Vendor payment records** — what the group has paid each mess.
- **PDF / Excel export.**

## Deliberately not built

- A rotation suggestion for who takes the half — explicitly rejected. See `DESIGN.md`.
- Dark mode UI — the tokens are structured for it (`darkMode: ["class"]`), there is no UI.
- Anything requiring a paid tier. Every choice here is free-tier by design.

## Keeping this file honest

Update it when the phase changes. A stale `phase.md` is the fastest way to make an agent
confidently wrong.
