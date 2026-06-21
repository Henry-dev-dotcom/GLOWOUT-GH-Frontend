# GLOWOUT GH Frontend QA Brand Check

## Result
Frontend QA passed after a final brand/data-mapping correction.

## Checks completed
- Production build passed with `npm run build`.
- Old GlowHaus brand references were not found in source files.
- The old announcement message `Free delivery on orders from GH₵800. Authentic beauty essentials only.` is not present.
- Backend/local fallback mode remains available.
- Frontend now maps backend store settings safely:
  - backend `GHS` displays as `GH₵`
  - backend decimal tax rate `0.075` displays/calculates locally as `7.5%`
  - frontend percent tax rate is converted back to decimal before saving to backend
- SKU prefix was updated from `GHB` to `GOGH` for the renamed brand.

## Notes
The frontend can run without the backend using fallback local data. For full live testing, run the backend and PostgreSQL too.
