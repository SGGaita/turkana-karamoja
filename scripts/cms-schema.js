/**
 * `npm run cms:schema` (FE-11): saves the CMS page schema (`karamoja/v1/schema`) into lib/cms/schema.snapshot.json —
 * pages → sections → fields with their types only (no labels or help text), so the file changes only when the
 * structure does. tests/cms-schema.test.mjs then checks the website and the CMS agree. Run it after a Core release
 * that changes Website pages or Site settings, and commit the file.
 *
 * The schema is for editors only. Use a WordPress application password of an Editor or Administrator
 * (Users → Profile → Application Passwords), in .env.local or the shell — never commit it:
 *   CMS_SCHEMA_USER=editor-login CMS_SCHEMA_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx" npm run cms:schema
 * WordPress offers application passwords only over HTTPS, or on a site with WP_ENVIRONMENT_TYPE = local.
 *
 * Without a password, from a file made with WP-CLI on the CMS server (or local XAMPP):
 *   wp eval 'echo wp_json_encode( rest_do_request( new WP_REST_Request( "GET", "/karamoja/v1/schema" ) )->get_data() );' --user=<admin> > schema.json
 *   npm run cms:schema -- --file schema.json
 */
const fs = require('fs');
const path = require('path');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const OUT = path.join(__dirname, '..', 'lib', 'cms', 'schema.snapshot.json');

/** Only what the contract needs: page → { sections: { key: { fields: { key: type } } } }. */
function shrink(schema) {
  const pages = {};
  for (const [slug, page] of Object.entries(schema || {}).sort(([a], [b]) => a.localeCompare(b))) {
    const sections = {};
    for (const [key, section] of Object.entries(page?.sections || {})) {
      const fields = {};
      for (const [f, def] of Object.entries(section?.fields || {})) {
        fields[f] = def?.type === 'repeater' && def.fields
          ? { type: 'repeater', fields: Object.fromEntries(Object.entries(def.fields).map(([k, d]) => [k, d?.type || ''])) }
          : def?.type || '';
      }
      sections[key] = { fields };
    }
    pages[slug] = { version: page?.version || 1, sections };
  }
  return pages;
}

function save(schema, source) {
  const pages = shrink(schema);
  if (!Object.keys(pages).length || !pages.home) throw new Error('this is not the Karamoja page schema');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify({ _note: 'npm run cms:schema — do not edit by hand.', source, pages }, null, 2)}\n`);
  console.log(`[cms:schema] ${Object.keys(pages).length} pages saved to lib/cms/schema.snapshot.json`);
}

(async () => {
  const fileArg = process.argv.indexOf('--file');
  if (fileArg > -1) {
    const file = process.argv[fileArg + 1];
    save(JSON.parse(fs.readFileSync(file, 'utf8')), 'file');
    return;
  }
  const base = (process.env.NEXT_PUBLIC_WP_BASE_URL || '').replace(/\/$/, '');
  const user = process.env.CMS_SCHEMA_USER;
  const pass = process.env.CMS_SCHEMA_APP_PASSWORD;
  if (!base || !user || !pass) {
    console.error('Set NEXT_PUBLIC_WP_BASE_URL, CMS_SCHEMA_USER and CMS_SCHEMA_APP_PASSWORD (an Editor\'s application password).');
    process.exit(1);
  }
  const res = await fetch(`${base}/wp-json/karamoja/v1/schema`, {
    headers: { Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    console.error(`The CMS answered ${res.status}. Check the user is an Editor or Administrator and the application password.`);
    process.exit(1);
  }
  save(await res.json(), base.replace(/\/\/[^@/]*@/, '//'));
})().catch((e) => {
  console.error(`[cms:schema] ${e.message}`);
  process.exit(1);
});
