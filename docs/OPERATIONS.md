# Operations (Strapi ↔ local-law)

Build a Strapi custom admin **Operations** page that proxies to the local-law Next.js admin API.
**Do not duplicate transactional records into Strapi collections; Prisma remains the source of truth.**

## Architecture

```
Strapi Admin UI  →  Strapi plugin backend  →  local-law Next.js admin API  →  Prisma / storage
                 (admin JWT)               (LOCAL_LAW_ADMIN_API_TOKEN)
```

- Content Manager collections like `translation-request` must **not** be treated as the ops source of truth.
- Uploaded files stay in application storage; Operations never re-uploads them into Strapi Media Library.
- Storage keys are never shown in the UI; downloads go through secured endpoints.

## Strapi env

| Variable | Purpose |
|---|---|
| `LOCAL_LAW_URL` | Base URL of the Next.js app (e.g. `http://127.0.0.1:3000` locally, or the public production URL) |
| `LOCAL_LAW_ADMIN_API_TOKEN` | Shared bearer token for server-to-server calls |

### Troubleshooting `Failed to reach local-law`

That error means Strapi’s **server process** could not open a TCP connection to Next (or timed out). It is not a browser CORS issue.

Check:

1. `LOCAL_LAW_URL` is set on the **Strapi** host and points to a URL Strapi can reach.
   - Local Strapi → local Next: `http://127.0.0.1:3000`
   - Deployed Strapi (Railway/etc.) → **must not** use `localhost`; use the public Next URL
2. Next.js is running and exposes `/api/admin/ops/*` (see below).
3. `LOCAL_LAW_ADMIN_API_TOKEN` matches on both sides (wrong token → `401/403`, not “Failed to reach”).
4. Admin health: `GET /operations/health` (with admin JWT) returns connectivity details.

## Strapi plugin endpoints (admin)

Used by the Operations admin page via `useFetchClient`:

| Method | Path | Proxies to |
|---|---|---|
| `GET` | `/operations/documents` | `GET /api/admin/ops/documents` |
| `GET` | `/operations/translations` | `GET /api/admin/ops/translation-requests` |
| `GET` | `/operations/notary-bookings` | `GET /api/admin/ops/notary-bookings` |
| `GET` | `/operations/custom-notary` | `GET /api/admin/ops/custom-notary-requests` |
| `PUT` | `/operations/:type/:id/status` | `PATCH /api/admin/ops/:type/:id/status` |
| `GET` | `/operations/:type/:id/files/:fileId/download` | `GET /api/admin/ops/:type/:id/files/:fileId/download` |

`:type` values: `documents` | `translation-requests` | `notary-bookings` | `custom-notary-requests`.

## Required Next.js admin API

Protect with `Authorization: Bearer ${LOCAL_LAW_ADMIN_API_TOKEN}` (same value as Strapi env).
Do **not** use Strapi admin user session on the Next side.

### List endpoints

- `GET /api/admin/ops/documents`
- `GET /api/admin/ops/translation-requests`
- `GET /api/admin/ops/notary-bookings`
- `GET /api/admin/ops/custom-notary-requests`

Normalized item shape:

```ts
{
  id: string;
  type: "document" | "translation" | "notaryBooking" | "customNotary";
  status: string;
  customer: {
    userId: string;
    name?: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt?: string;
  payment?: {
    status: string;
    amountAed?: number;
    stripePaymentIntentId?: string;
  };
  files: Array<{
    id: string;
    fileName: string;
    mimeType?: string;
    downloadUrl: string; // ignored by Strapi UI; rewritten to Strapi proxy URL
  }>;
  payload: Record<string, unknown>;
}
```

Response may be either `OpsItem[]` or `{ data: OpsItem[] }`.

### Status update

`PATCH /api/admin/ops/:type/:id/status` with body `{ status: string }`.

Allowed statuses:

| Type | Statuses |
|---|---|
| documents | `completed`, `reviewed`, `archived`, `error` |
| translation-requests | `pending`, `in_progress`, `completed`, `cancelled` |
| notary-bookings | `confirmed`, `cancelled`, `refunded` |
| custom-notary-requests | `pending`, `in_progress`, `completed`, `cancelled` |

Rules:

- Log status changes (`console.info` or `AdminAuditLog`).
- Do not allow payment status changes from Operations.
- Do not allow deletes in MVP.

### File download

`GET /api/admin/ops/:type/:id/files/:fileId/download`

- Verify admin API token.
- Stream file from app storage.
- For generated documents, details UI can show `generatedText` from payload (download optional).

## Prisma sources

| Tab | Model(s) |
|---|---|
| Documents | `DocumentGeneration` |
| Translations | `LegalTranslationRequest`, `LegalTranslationRequestFile` |
| Notary bookings | `NotaryBooking`, `NotaryBookingDocument` |
| Custom notary | `NotaryCustomServiceRequest` |

## Details payload fields

- **documents:** `documentType`, `templateId`, `formData`, `generatedText`, `isSaved`
- **translation:** `pageCount`, `totalAmountAed`, `ratePerPageAed`, uploaded files
- **notary booking:** service, appointment date, emirate, notes, calendly links, documents
- **custom notary:** service, fullName, phone, description

## MVP checklist

1. Next admin `GET` for all four types
2. Strapi Operations page with four tabs + tables
3. Secure file download via Strapi → Next proxy
4. Status update via Strapi `PUT` → Next `PATCH`
