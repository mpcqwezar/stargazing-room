# Stargazing Room

This repository contains an Express feed collector and a Vite React client.

## Run locally

Install dependencies once:

```bash
npm install
npm install --prefix client
```

Start the API and client:

```bash
npm run dev
```

Open <http://localhost:5173/stargazing-room/>.

## Publish to GitHub Pages

The `Deploy to GitHub Pages` workflow builds and deploys the site whenever
`main` changes. It also refreshes the static news and media feeds every
10 minutes, so GitHub Pages does not need a separate backend.

After the first push, open the repository's **Settings → Pages** and choose
**GitHub Actions** as the source. The site will be available at
<https://mpcqwezar.github.io/stargazing-room/>.

To test the production build locally:

```bash
npm run build:pages
npm run preview --prefix client
```

Then open <http://localhost:4173/stargazing-room/>.
