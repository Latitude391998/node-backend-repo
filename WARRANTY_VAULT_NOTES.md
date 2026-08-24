# Warranty Vault & Product Catalog — Backend Notes

Added in a pairing session on 2026-08-24. See `frontend/WARRANTY_VAULT_NOTES.md`
for the client side of this feature.

## New modules (fully additive — nothing existing was removed or rewritten)

- `src/modules/product/` — `IndependentProduct` model, Joi validation, controller, routes.
  - `GET /api/products` — public. Search / category / price-range / sort / pagination.
  - `POST /api/products` — admin-only (`protect` + `requireAdmin`).
- `src/modules/warranty/` — `EncryptedWarrantyClaim` model, Joi validation, controller, routes.
  - `POST /api/warranty/claim` — authenticated. Stores **only** an opaque ciphertext
    envelope (see `frontend/src/lib/crypto.ts`). This server never sees or
    validates plaintext claim details — validation here is structural only
    (are the expected base64 blobs present, sane length/iteration floor).
  - `GET /api/warranty/claims` — authenticated, returns the caller's own claims.
- `src/middlewares/admin.middleware.ts` — `requireAdmin`. Does a fresh DB
  role lookup keyed on `req.user.id` rather than trusting a role claim
  baked into the JWT, specifically so it required zero changes to the
  existing login/token-issuance code.

## The one schema change

`role` was added to the `User` model (`src/models/user.model.ts` +
`src/modules/auth/auth.model.ts`), defaulted to `'USER'`, fully backward
compatible with existing documents and the existing login/register flow.
This was necessary because the frontend's `authSlice` already expected
`user.role` to exist for its permissions system — it just had nothing
populating it.

**To grant yourself admin (needed to add products from the UI):** there's
no promotion UI (out of scope here) — set it directly in MongoDB:

```js
db.users.updateOne({ email: 'you@example.com' }, { $set: { role: 'ADMIN' } });
```

## `app.ts`

Two new route mounts were appended (`/api/products`, `/api/warranty`)
alongside the existing ones. Nothing else in that file changed.

## Nothing else changed

No existing endpoint, schema, or the login/logout/refresh flow was touched
beyond the additive `role` field above.
