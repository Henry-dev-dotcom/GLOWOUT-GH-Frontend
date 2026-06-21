# Phase 5 — Checkout & Payment UI

This phase upgrades the customer checkout flow and prepares it for backend payment integration.

## Completed

- Rebuilt `CheckoutPage.jsx` as a guided multi-step checkout.
- Added checkout steps:
  1. Customer and delivery details
  2. Payment method
  3. Final order review
- Added delivery methods:
  - Standard delivery
  - Express delivery
  - Store pickup
- Added payment methods:
  - Mobile Money
  - Card
  - Bank Transfer
  - Cash on Delivery
- Added payment-specific input panels.
- Added coupon application directly inside checkout.
- Added order notes field.
- Added order terms confirmation.
- Added stronger validation before moving between checkout steps.
- Added delivery method totals and order review totals.
- Updated `placeOrder` to store payment status, delivery method, delivery window, payment reference, payment details, notes, and custom checkout totals.
- Added `OrderConfirmationPage.jsx`.
- Added `PaymentStatusPage.jsx`.
- Added routes:
  - `#order-confirmation?order=<ORDER_ID>`
  - `#payment-status?order=<ORDER_ID>&status=pending`
- Added payment simulation buttons for frontend testing until Paystack/backend verification is connected.

## Backend integration readiness

The checkout flow now captures the information needed for backend APIs:

- customer details
- delivery address
- delivery method
- payment method
- payment reference
- payment details
- coupon code
- subtotal
- delivery fee
- tax
- discount
- final total
- notes

When backend integration begins, replace the local `placeOrder` call with API calls to:

- `POST /api/checkout`
- `POST /api/payments/initialize`
- `GET /api/payments/verify/:reference`

## Validation

`npm run build` passed successfully after the update.
