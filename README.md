# GLOWOUT GH — Frontend

React + Tailwind storefront and admin dashboard for GLOWOUT GH, backed by the
`GLOWOUT-GH-Backend` API (falls back to `localStorage` demo data if the
backend is unreachable).

## Setup

```bash
npm install
copy .env.example .env   # then set VITE_API_URL to the backend's /api URL
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deployment

See `../DEPLOYMENT.md` and `../LAUNCH_CHECKLIST.md` at the project root.
