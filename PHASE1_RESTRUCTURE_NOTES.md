# Phase 1 Frontend Restructure Notes

This phase reorganizes the React + Tailwind frontend without changing the visible customer/admin experience.

## Completed

- Split `StorefrontPages.jsx` into one file per storefront page.
- Split `AdminPages.jsx` into one file per admin module.
- Added `src/pages/storefront/index.js` and `src/pages/admin/index.js` barrel exports.
- Added `src/pages/admin/_AdminShared.jsx` for shared admin page helpers.
- Moved hash-routing helpers into `src/hooks/useHashRouter.js`.
- Added `src/routes/routeConfig.js` for route labels and future route mapping.
- Added `src/services/` API scaffolding for backend integration.
- Preserved existing localStorage logic and page behavior.

## Next phase

Phase 2 should replace `SimplePage` with complete dedicated pages for About, Blog, FAQ, Returns, and Reviews.
