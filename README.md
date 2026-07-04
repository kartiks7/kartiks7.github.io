# Kartik Shende — Portfolio

Minimal, dark-first portfolio for a data scientist. Plain HTML/CSS/vanilla JS — no build step, ready for GitHub Pages.

## Structure

```
index.html        # single-page site, all content
css/style.css     # design tokens (dark default + light theme), all styles
js/main.js        # theme toggle, scroll reveals, counters, nav, glow, hero canvas
assets/           # favicon, headshot placeholder, logos, resume PDF
```

## Things to finish (one-time)

- [ ] **Headshot** — drop your photo at `assets/headshot.jpg` (portrait orientation, ~760×912 or any 5:6 crop). The placeholder disappears automatically.
- [ ] **Resume PDF** — put your resume at `assets/Kartik_Shende_Resume.pdf` (the hero "Resume ↓" button points there).
- [ ] **Workforce Intelligence project link** — currently points to your GitHub profile. When the repo/report is public, update the two `href`s in the Workforce card in `index.html` (search for `Workforce Intelligence`).

All other links are live: LinkedIn, GitHub profile, PitSight repo, and the PitSight Power BI report (also embeddable in-page via "Load live report").

## Run locally

```bash
python -m http.server 8000
# open http://localhost:8000
```

(Or just double-click `index.html` — all paths are relative.)

## Deploy to GitHub Pages

Option A — user site (recommended, clean URL):

```bash
git init -b main
git add .
git commit -m "Portfolio site"
gh repo create kartiks7.github.io --public --source=. --push
```

Live at `https://kartiks7.github.io` in ~1 minute (user-site repos auto-enable Pages).

Option B — project repo:

```bash
gh repo create portfolio --public --source=. --push
```

Then on GitHub: **Settings → Pages → Deploy from a branch → main / (root)**. Live at `https://kartiks7.github.io/portfolio/`. All asset paths are relative, so both options work unchanged.

`.nojekyll` is included so Pages serves files as-is.

## Customizing

- **Colors/theme** — edit the token blocks at the top of `css/style.css` (`:root` = dark, `[data-theme="light"]` = light).
- **Logos** — `assets/logos/`. Missing logos degrade gracefully (chips fall back to text).
