import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const resumePath = path.join(root, 'resume.html');
const seedPath = path.join(root, 'cloudflare-worker', 'seeds', 'resume.sql');
const source = fs.readFileSync(resumePath, 'utf8').replace(/\r\n/g, '\n');
const startMarker = '<div class="resume-container">';
const endMarker = '\n    </div>\n  </div>\n\n  <script src="scripts/cloudflare-config.js"';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);

if (start === -1 || end === -1) {
  throw new Error('Could not locate the resume container in resume.html.');
}

const html = source.slice(start + startMarker.length, end).trim();
const escapedHtml = html.replace(/'/g, "''");
const sql = `INSERT INTO content_items (
  id, collection, slug, data_json, sort_order, published, created_at, updated_at
)
VALUES (
  'resume-page',
  'resume',
  'page',
  json_object('title', 'Resume page', 'html', '${escapedHtml}'),
  0,
  1,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
)
ON CONFLICT(collection, slug) DO UPDATE SET
  data_json = excluded.data_json,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = excluded.updated_at;
`;

fs.writeFileSync(seedPath, sql, 'utf8');
console.log(`Wrote ${seedPath} (${html.length} resume HTML characters).`);
