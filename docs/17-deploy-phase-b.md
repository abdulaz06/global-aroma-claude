# Phase B: push and preview without touching production

Production (`global-aroma-claude-concept.vercel.app`) is built from `main` at `a0019ec` (Phase A). Phase B is on the **`phase-b`** branch, the Phase B commits on top, all authored as `abdulaz06 <185133821+abdulaz06@users.noreply.github.com>`, with no co-author trailers. Tags `phase-a-independent` and `phase-a-checkpoint` (→ `a0019ec`) are preserved.

## 1. Push the branch (from your machine)

```bash
cd global-aroma-claude                       # your existing clone
git fetch /path/to/global-aroma-claude-phase-b.bundle phase-b:phase-b --tags
git log --oneline main..phase-b              # the Phase B commits
git push origin phase-b --tags
```

(No clone yet? `git clone global-aroma-claude-phase-b.bundle global-aroma-claude && cd global-aroma-claude && git remote set-url origin https://github.com/abdulaz06/global-aroma-claude.git`.)

## 2. Check one Vercel setting first

Vercel → `global-aroma-claude-concept` → Settings → Build and Deployment → **Output Directory**.

- If it shows an **override** set to `dist`, switch the override **off**. Phase B uses the Astro Vercel adapter, which writes Vercel's own output format, so a forced `dist` would break the Phase B build.
- Production is safe either way: `main` still sets `"outputDirectory": "dist"` in its own `vercel.json`.

No environment variables are required. **Leave `STAFF_LIVE_ENABLED`, `WC_API_URL`, `WC_CONSUMER_KEY` and `WC_CONSUMER_SECRET` unset** on this project, always.

## 3. Preview

With the GitHub integration, pushing `phase-b` creates a **Preview** deployment automatically; production doesn't change. Without it:

```bash
git checkout phase-b
vercel deploy            # Preview, not --prod
```

During the build, `npm run build` first reads the live catalogue from globalaroma.me (Vercel can reach it; this sandbox couldn't). If the store doesn't answer or the data fails validation, the build continues on the audited snapshot and says so in the log.

## 4. Verify the preview (5 minutes)

```bash
P=https://<preview-url>
curl -sI $P/ | grep -i x-robots-tag                 # noindex, nofollow, noarchive
curl -s  $P/api/catalog.json | head -c 200          # {"ok":true,"readAt":...}
curl -sI $P/api/staff/orders.json | head -1         # HTTP/2 404
curl -sI $P/api/staff/orders.json | grep -i cache   # private, no-store
```

In a browser:
1. `/shop`: the freshness line should change to "checked just now" with a green dot, and product photos should load from the store.
2. Click **Add to cart ↗** on Arabic Coffee. The store should open with it in the cart. **Stop there; don't check out.**
3. `/staff-demo`: the yellow demonstration banner shows; Simulate, open an order, then Reset.
4. `/studio/make`: download one PNG.
5. Run `WEBKIT=1 npm test` locally against `npm run preview` for Safari coverage (WebKit couldn't be downloaded in the build sandbox).

If the `X-Robots-Tag` header is missing on the preview, every page still carries `<meta name="robots" content="noindex">` and `robots.txt` disallows everything. Still worth fixing: the header can be written directly into the build output config with a small post-build step.

## 5. Promote only after review

When you're happy: merge `phase-b` into `main` (or promote the preview in Vercel). The concept labels and `noindex` stay until the owner approves a real launch (doc 14).
