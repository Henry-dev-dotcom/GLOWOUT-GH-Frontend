# GLOWOUT GH — React + Tailwind Frontend

This project converts the completed single-file GLOWOUT GH ecommerce/admin dashboard into a structured React + Tailwind frontend.

## Completed conversion phases

### Phase 1 — Project setup
- Created a Vite React project structure.
- Added Tailwind CSS configuration.
- Added shared global styling, colours, fonts and reusable utility classes.
- Created a desktop-ready folder structure for the project.

### Phase 2 — Data and state architecture
- Moved products, categories, coupons, orders, returns, settings and team data into structured JavaScript data files.
- Added a central Store Context using React Context API.
- Preserved browser `localStorage` logic so changes persist on the same browser.
- Added reusable helper utilities for money formatting, IDs, exports and status classes.

### Phase 3 — Storefront conversion
- Converted the public website into React pages/components:
  - Home
  - Shop
  - Categories
  - Product Detail
  - Cart
  - Checkout
  - Wishlist
  - Order Tracking
  - About
  - Contact
  - Blog
  - FAQ
  - Returns
  - Reviews
  - Account
- Preserved cart, wishlist, coupon, product detail and checkout flow.

### Phase 4 — Admin dashboard conversion
- Converted admin dashboard into React pages/components:
  - Dashboard Overview
  - Product Manager
  - Categories Manager
  - Orders Manager
  - Coupons Manager
  - Returns Manager
  - Customers Manager
  - Sales Analytics
  - Marketing Manager
  - Finance Reports
  - Store Settings
  - Team & Access
- Removed the old one-file structure and separated admin features logically.

### Phase 5 — Business logic preservation
- Product Manager supports add, edit, delete, duplicate, stock update, image URLs, import/export and reset demo products.
- Categories support add, edit, duplicate, hide/show, feature/unfeature, delete custom categories and product remapping.
- Orders support demo loading, status update, paid/unpaid toggle, courier/tracking update and export.
- Coupons support percentage, fixed amount and free shipping rules connected to cart/checkout.
- Returns, customers, analytics, marketing, finance, settings and team pages are functional with localStorage.

### Phase 6 — Validation
- Installed project dependencies.
- Ran production build successfully.
- Build output is available in the `dist` folder after running `npm run build`.

## How to run

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## How to build

```bash
npm run build
```

## Important production note

This is a complete React/Tailwind frontend with localStorage-based demo persistence. For a real live store, the next stage should connect:

- Backend/database
- Real authentication
- Payment gateway
- Email/SMS notifications
- Cloud image upload
- Order fulfilment/courier API
- Production hosting and domain

## Suggested next phase

Convert this frontend to a full-stack app using either:

- Next.js + Supabase
- React + Firebase
- React + Laravel API
- React + Node/Express + PostgreSQL


## Phase 2 Update

Phase 2 completed the main storefront content pages:

- About
- Blog
- FAQ
- Returns
- Reviews

These pages are now dedicated React components instead of generic placeholder content. See `PHASE2_CONTENT_PAGES_NOTES.md` for details.


## Phase 3 Shopping Experience

This package includes the Phase 3 storefront shopping upgrade: improved shop filters, product quick view, product-detail tabs, quantity-aware add-to-cart, delivery estimator, wishlist actions, and upgraded order tracking. See `PHASE3_SHOPPING_EXPERIENCE_NOTES.md` for details.

## Phase 4 Update

The customer authentication and account experience has been upgraded with full login, register, forgot password, account dashboard tabs, saved addresses, order history, wishlist management, return requests and profile/security editing.


## Phase 5 Update — Checkout & Payment UI

Phase 5 added a full multi-step checkout flow, delivery method selection, payment-specific panels, order review, order confirmation page, and payment status page. The frontend is now prepared for backend checkout and Paystack-style payment verification integration.

Routes added:

```text
#order-confirmation?order=<ORDER_ID>
#payment-status?order=<ORDER_ID>&status=pending
```

## Phase 6 Admin Upgrade

This package includes the Phase 6 admin upgrade. The admin dashboard now includes richer management pages for orders, customers, returns, coupons, finance, marketing, analytics and team access. See `PHASE6_ADMIN_UPGRADE_NOTES.md` for details.


## Phase 7 backend integration

This version includes the frontend-to-backend API bridge. The app will try to sync with the backend at `VITE_API_URL` and will fall back to localStorage when the backend/PostgreSQL is unavailable.

Create a frontend `.env` file from `.env.example` when running with the backend:

```bash
copy .env.example .env
```

Default API URL:

```bash
VITE_API_URL=http://localhost:5000/api
```

Run frontend and backend in two terminals:

```bash
# Terminal 1
cd GLOWOUT-GH-Backend
npm run dev

# Terminal 2
cd GLOWOUT-GH-Frontend
npm run dev
```

Backend seed password: `GlowoutGH@123`. Local fallback demo password: `glowoutgh123`.

## Phase 8 Final QA & Polish

This package includes the Phase 8 final frontend polish pass.

Updates include:

- Error Boundary for safer page recovery.
- Skip-to-content keyboard accessibility link.
- Stronger focus-visible states.
- Mobile bottom navigation for storefront actions.
- Improved mobile drawer with search and Escape close.
- API live/local mode status chip in the header.
- Improved admin API sync banner with last sync/error details.
- Admin current-user context and logout action.
- Mobile spacing and scroll handling for admin tables.
- Reduced-motion CSS support.
- Removed the sandbox-generated `package-lock.json` so your computer installs from the public npm registry using `.npmrc`.

See `PHASE8_QA_POLISH_NOTES.md` for the QA checklist.
