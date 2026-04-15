# Cloudflare Setup (Global Songs + Darkroom Uploads)

This worker powers:
- Global HSOH song recommendations (`/song-recs`)
- Darkroom gallery uploads and listing (`/upload`, `/strips`)

## 1) Prereqs

- Cloudflare account
- `npm i -g wrangler` (or use `npx wrangler`)
- Login:

```bash
wrangler login
```

## 2) Create Cloudflare resources

From `cloudflare-worker/`:

```bash
wrangler d1 create joho_global
wrangler r2 bucket create joho-media
```

Copy the D1 `database_id` from command output.

## 3) Configure `wrangler.toml`

Edit `cloudflare-worker/wrangler.toml`:
- Set `database_id` in `[[d1_databases]]`
- Set `R2_PUBLIC_BASE_URL` to your public R2 URL (for example `https://media.joho.studio`)
- Set `MAPBOX_PUBLIC_TOKEN` (public `pk...` token used by atlas)

If you do not have a custom domain for R2 yet, create a public bucket domain in Cloudflare and use that URL.

## 4) Create DB tables

Run migration:

```bash
wrangler d1 execute joho_global --file=schema.sql
```

## 5) Deploy worker

```bash
wrangler deploy
```

Copy the deployed worker URL (example: `https://joho-studio-api.<subdomain>.workers.dev`).

## 6) Connect website

Edit `scripts/cloudflare-config.js`:

```js
window.CLOUDFLARE_WORKER_URL = 'https://joho-studio-api.<subdomain>.workers.dev';
window.MAPBOX_ACCESS_TOKEN = '';
```

Atlas will auto-fetch the token from Worker endpoint `GET /public-config` when local token is empty.

This URL is consumed by both:
- `hoshii.html` song catalogue
- `darkroom.html` upload/gallery endpoints

## 7) API overview

- `GET /health` -> plain `ok`
- `GET /song-recs` -> list of songs
- `POST /song-recs` body `{ "song": "..." }` and header `x-client-id`
- `DELETE /song-recs/:id` with header `x-client-id` (only creator can remove)
- `POST /upload` multipart (`file`, `author`) for darkroom strip image
- `GET /strips` -> latest strip entries

## Notes

- Song deletes are owner-scoped using a browser client id (`x-client-id`).
- Anyone can add songs; only the creator (same browser identity) can remove their own entries.
- If you want admin moderation/deletes across all entries, add an admin token check in worker routes.
