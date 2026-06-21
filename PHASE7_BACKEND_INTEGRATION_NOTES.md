# Phase 7 — Frontend to Backend API Integration

This phase connects the React + Tailwind frontend to the GLOWOUT GH backend API while preserving localStorage fallback behavior.

## What changed

- Added backend API status tracking in `StoreContext`.
- Added automatic public data sync on app load:
  - products
  - categories
  - settings
  - marketing campaigns
- Added admin data sync after successful backend admin login:
  - orders
  - coupons
  - returns
  - customers
  - team users
- Added API-aware operations for:
  - login/register/change password
  - product create/update/delete/duplicate
  - category create/update/delete
  - order checkout/update/delete
  - coupon create/update/delete/validation
  - return create/update/delete
  - customer update
  - team create/update/delete
  - settings update
  - marketing campaign create/update/delete
- Added backend-to-frontend and frontend-to-backend data mappers.
- Added admin dashboard backend status banner with Sync Now button.
- Added `.env.example` for API configuration.

## Backend fallback behavior

The frontend now tries the backend first. If the backend or PostgreSQL is unavailable, the app continues using localStorage data. This is intentional so development is not blocked while PostgreSQL is being configured.

## Required backend URL

Default API URL:

```bash
http://localhost:5000/api
```

Create `.env` from `.env.example` if you need to change it:

```bash
copy .env.example .env
```

## Demo backend accounts from backend seed

When the backend is seeded, use these accounts:

```text
owner@glowoutgh.local
admin@glowoutgh.local
products@glowoutgh.local
orders@glowoutgh.local
marketing@glowoutgh.local
finance@glowoutgh.local
support@glowoutgh.local
customer@glowoutgh.local
```

Password:

```text
GlowoutGH@123
```

The old local demo accounts still work if the backend is offline:

```text
owner@glowoutgh.test / glowoutgh123
admin@glowoutgh.test / glowoutgh123
staff@glowoutgh.test / glowoutgh123
```

## Validation

`npm run build` passed successfully.
