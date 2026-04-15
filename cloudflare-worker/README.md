# Cloudflare Setup (Global Songs + Darkroom Uploads)

This worker powers:
- Global HSOH song recommendations (`/song-recs`)
- Darkroom gallery uploads and listing (`/upload`, `/strips`)
- Atlas saved cities + stamps (`/atlas-points`)
- Atlas stamp image uploads to R2 (`/atlas-stamp-upload`)

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
wrangler d1 create database1
wrangler r2 bucket create atlas-stamps
```

Copy the D1 `database_id` from command output.

## 3) Configure `wrangler.toml`

Edit `cloudflare-worker/wrangler.toml`:
- Set `database_id` in `[[d1_databases]]`
- Set `R2_PUBLIC_BASE_URL` to your public R2 URL (for example `https://media.joho.studio`)
- Set `MAPBOX_PUBLIC_TOKEN` (public `pk...` token used by atlas)
- Set `OPEN_LIBRARY_QUERY` for bookshelf page (Open Library search query)

If you do not have a custom domain for R2 yet, create a public bucket domain in Cloudflare and use that URL.

## 4) Create DB tables

Run migration:

```bash
wrangler d1 execute database1 --file=schema.sql
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
Bookshelf will auto-fetch Open Library query from the same endpoint when local values are empty.

This URL is consumed by both:
- `hoshii.html` song catalogue
- `darkroom.html` upload/gallery endpoints

## 7) API overview

- `GET /health` -> plain `ok`
- `GET /public-config` -> runtime map/config values for frontend
- `GET /song-recs` -> list of songs
- `POST /song-recs` body `{ "song": "..." }` and header `x-client-id`
- `DELETE /song-recs/:id` with header `x-client-id` (only creator can remove)
- `POST /upload` multipart (`file`, `author`) for darkroom strip image
- `GET /strips` -> latest strip entries
- `GET /atlas-points` -> list atlas saved city/stamp points
- `POST /atlas-points` -> save atlas city/stamp point
- `POST /atlas-stamp-upload` -> upload atlas stamp image to R2

## Notes

- Song deletes are owner-scoped using a browser client id (`x-client-id`).
- Anyone can add songs; only the creator (same browser identity) can remove their own entries.
- If you want admin moderation/deletes across all entries, add an admin token check in worker routes.
