# GitHub Pages Autodeploy (Vite + React)

1) In GitHub repo **Settings → Pages**, set **Source = GitHub Actions** (not 'Deploy from a branch').
2) Put this folder's `.github/workflows/deploy.yml` into your repo root (keep your `src`, `public`, `index.html`, `package.json`, `vite.config.js`).
3) Ensure `vite.config.js` has: base: '/SongDiary/'.
4) Commit & push anything to `main` to trigger the workflow.
5) Wait for Actions to finish green → open https://vintermom.github.io/SongDiary/
