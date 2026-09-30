# Deploying Banter (web prototype) to Vercel

This is your original interactive prototype, packaged as a real web app that
deploys to a public URL. Anyone can open it in a browser — no install.

## What's in here

```
banter-web/
├── src/
│   ├── BanterApp.jsx   ← your prototype (adapted for the web)
│   └── main.jsx        ← boots the app
├── api/
│   └── milo.js         ← serverless function for the AI simulator
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

Two things changed from the in-Claude prototype so it works on the open web:
- **Saving progress** now uses the browser's `localStorage` instead of the
  Claude-artifact storage API. Progress is per-browser (someone on their phone
  and their laptop won't share progress — that's expected for a demo).
- **Milo's AI chat** now calls `/api/milo` (a serverless function) instead of
  calling Anthropic directly. This keeps your API key secret on the server.
  **The key is never exposed to visitors.**

---

## Deploy in ~10 minutes

### 1. Put the code on GitHub
1. Create a new repo at github.com (e.g. `banter-web`), Public or Private both
   work with Vercel.
2. Upload the contents of this `banter-web/` folder to it (drag the files into
   GitHub's "Add file → Upload files", or use git if you're comfortable).

### 2. Import into Vercel
1. Go to vercel.com and sign in with GitHub (free "Hobby" plan is fine).
2. **Add New → Project**, pick your `banter-web` repo, click **Import**.
3. Vercel auto-detects Vite. Leave the defaults (Build: `vite build`, Output:
   `dist`). Click **Deploy**.
4. In a minute you'll get a live URL like `banter-web.vercel.app`. Open it —
   the app works, including flashcards, challenges, streaks, and the paywall.

### 3. Turn on Milo's AI chat (optional but recommended)
The simulator needs your Anthropic API key, added as a secure server-side
variable:
1. Get a key from console.anthropic.com (Settings → API Keys). This is a
   **paid** key — each Milo conversation costs a few cents. Set a spending
   limit in the console so a shared demo can't run up a surprise bill.
2. In Vercel: your project → **Settings → Environment Variables**.
3. Add: Name `ANTHROPIC_API_KEY`, Value = your key. Save.
4. **Redeploy** (Deployments tab → ⋯ on the latest → Redeploy) so the new
   variable takes effect.

Now "Practice with Milo" works on the live site. If you skip this step,
everything else works and Milo just shows a friendly "lost his train of
thought" retry message.

---

## Run it locally first (optional)
```
npm install
npm run dev      # opens http://localhost:5173
```
Note: `npm run dev` serves the app but NOT the /api function — Milo only works
once deployed to Vercel (or via `vercel dev` if you install the Vercel CLI).
Everything else runs locally.

---

## Honest notes for a public demo

- **Cost control on Milo.** Because the API key sits on your server, every
  visitor who uses the simulator spends your money. Before sharing widely, set
  a hard spending cap in the Anthropic console. For a small demo it's pennies;
  for a viral link it could add up.
- **No abuse protection yet.** This is a demo, not production. There's no rate
  limiting on `/api/milo`, so a determined visitor could spam it. If you share
  the link publicly and want protection, the next step is adding a simple rate
  limit (e.g. Vercel's built-in firewall, or a per-IP counter). Ask and I'll
  add it.
- **Progress is per-browser and resettable.** Clearing site data wipes it.
  That's fine for a demo; real accounts would need the backend from your spec.
- **This is the web demo, not the iOS app.** They're separate: this lives on
  Vercel for people to try in a browser; the real product is the native iOS
  app that goes through the App Store. Keeping both is common — the web link
  is great for showing people quickly.
