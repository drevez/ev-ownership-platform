# Vehicle catalog migration

## Status — 20 November 2026

Supabase project: **MotorZero**, ref `rqfiqovcuwhpnnkraksc`, region `eu-west-1`.
Schema applied and **65 models, 82 versions, 131 offers** imported. The canonical
remote data has been compared against every local vehicle. Original JSON documents
are preserved privately in `vehicle_import_sources` (including legacy business
prices and other metadata not currently rendered). Existing JSON files remain in Git.

The application can select one source with `VEHICLE_DATA_SOURCE=json|supabase`.
An unavailable Supabase never silently falls back to stale JSON. Local connection
values and the private write key are in ignored `.env.local`. The local source is
now `supabase`, and authenticated writes through the application have been verified.
On 22 November 2026 the owner explicitly authorized transfer of the private key
to Vercel Production and Preview. All four catalog variables are now configured
and their names, targets and secret classification were verified without decrypting
the secret. The changed local application has not yet been deployed.

## Data model

- `vehicle_models`: brand/model family with stable existing model slug.
- `vehicle_variants`: stable existing vehicle ID, model foreign key, remaining core
  attributes, five specification groups in JSONB, pricing metadata and revision.
  JSONB deliberately preserves the existing technical attributes without creating
  seven tables that mirror seven files. Frequently queried attributes can become
  typed/indexed columns when needed. Current app filtering runs on a bulk snapshot.
- `vehicle_offers`: individual new/used/import offers with typed condition, market,
  status and positive price bounds. Details retain dates, sources, year context,
  VAT context, confidence and optional attributes.
- `vehicle_revisions`: complete canonical snapshot, actor and timestamp per save;
  includes the price history. No public history endpoint/UI in this initial migration.
- `vehicle_import_sources`: lossless originals of the first import, private.

No user accounts, alerts, media uploads, or general content migration are included.
The existing content editor and image review/promotion tools still edit local files;
they require the existing repository/publication workflow and persistent storage.
Vehicle image URLs are preserved, and missing images retain the existing placeholder.
The migration does not update or verify market prices.

## Access and persistence

`catalog_read` is a public read-only RPC: its output is the public catalog, already
available as JSON before migration. Next.js calls it using a publishable key.
RLS restricts public access to catalog reads; import archives and revision history
have no public grants or policies. The Supabase advisor's `RLS Enabled No Policy`
info for these two private tables is intentional (default deny):
https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

`catalog_save` is executable only by `service_role`, via a server-side secret key.
The existing internal login remains required before the API invokes this function.
A save atomically changes the model link, version, offers and revision history.
Updates require the revision loaded by the editor; a stale revision returns HTTP
409 so editors cannot silently overwrite each other. Imports are repeatable and
refuse to overwrite a different existing version. Avoid direct manual table writes;
use the save function to preserve history and revision checks.

Credentials must never use a `NEXT_PUBLIC_` variable. Use modern publishable/secret
keys, not legacy anon/service JWTs. The Data API transport uses only the `apikey`
header for these modern keys and is never imported by client components.

## Commands (Node.js 24)

```sh
npm run catalog:prepare                  # local dry run, no credentials/writes
npm run catalog:import                   # explicit remote import; requires secret
npm run catalog:verify                   # compare remote catalog with local canonical data
npm run catalog:export -- /tmp/motorzero-export-20261120
npm test
npm run lint
npm run build
```

The import normalizes price formats, maps zero unknown prices to null/absence, and
never invents a source or review date. The originals remain archived. After legitimate
editor changes, verification against the original local catalog will report differences;
review them rather than reimporting old JSON over current data.

The SQL file in `supabase/migrations` is the schema migration, not the data dump.
The initial import was run against the new project through the connected Supabase
integration in one transaction. For later imports the CLI imports one version per
transaction and can safely resume after a failure.

## Activation

1. Completed: `SUPABASE_SECRET_KEY` is set in ignored `.env.local`; local editor/API writes verified.
2. Set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` and
   `VEHICLE_DATA_SOURCE=supabase` in the intended hosting environment. Keep existing
   internal authentication variables configured.
3. Build and verify the catalog, variant/model detail, both comparisons, quiz,
   sitemap, internal audit, and an authenticated save/stale-save rejection.
4. Deploy that environment. Do not treat an imported database as a production cutover.
5. From this point, edit the catalog through the database-backed panel. JSON in Git
   is the original snapshot, not a second editable source.

## Export, backup and rollback

`catalog:export` writes canonical vehicle modules, a derived registry and revision
numbers into a **new** destination directory; it refuses to overwrite an existing
folder. It exports the public current catalog, not private original archives or the
full revision history. Configure database backups separately for full recovery;
this JSON export does not replace them.

Before production cutover, returning to `VEHICLE_DATA_SOURCE=json` restores the
original catalog. After any live edits, first export current Supabase data and
replace the repository's vehicle directories and registry with that reviewed export,
then validate, build and publish with the JSON source. Merely flipping to old JSON
would lose the visibility of new edits. The database remains intact for recovery.

## Verification

Automated tests cover all source documents, canonicalization idempotence and price
parity; the PostgreSQL migration is executed in PGlite to verify full round trips,
repeat imports, atomic rollback, revision conflicts and public permissions.
The real Supabase Data API is additionally checked using `catalog:verify`.

Verified during implementation: 55 tests, TypeScript, ESLint and a production build
with the Supabase source passed. Browser verification covered catalog and model
comparison; HTTP verification covered variant comparison, six recommendations,
authenticated internal audit/editor rendering and rejection of unauthenticated
writes. A service-role save was executed inside a rolled-back transaction on the
real project; counts remained 82 revisions and 82 original archives. JSON export
was exercised successfully. Saving through the application remains pending the
private key at that initial stage. The follow-up below records successful write verification.
Production environment configuration and deployment remain pending.

## Follow-up: private key and application write verification

The private key was supplied by the owner through `.env.local`, without displaying
it in chat or committing it. `VEHICLE_DATA_SOURCE=supabase` is active locally.
An authenticated PUT of unchanged vehicle data persisted a new revision; re-reading
the catalog confirmed the data was identical. Reusing the old revision returned
HTTP 409, and an unauthenticated PUT returned HTTP 401. The two successful
verification saves added revisions 2 and 3 to `tesla-model-y-long-range`; its data
was not changed. All 82 remote versions still match the canonical import.

The live stale-save check found that SQLSTATE 40001 caused PostgREST to retry a
business conflict until the HTTP timeout. The follow-up schema migration changes
these business conflicts to PT409, preserving 40001 for actual database serialization
failures. Tests now apply the complete migration chain and assert PT409 explicitly.
Reference: https://supabase.com/kb/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b

Pending Vercel action: set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SECRET_KEY` (sensitive) and `VEHICLE_DATA_SOURCE=supabase` on
project `ev-ownership-platform` (`prj_2Vw0NJK1ayssD7l2MsFLHuIJIqEP`),
team `team_oJSKuF5xRms3zO2aAz3npIEK`, for Production and Preview.
This requires the owner's explicit approval to transfer the private credential to
that destination. Existing deployments are unchanged. Configuration alone will
not publish the modified local application; deployment remains a separate step.

## Vercel configuration — 22 November 2026

The owner approved transferring the Supabase secret key to the existing Vercel
project `ev-ownership-platform` for Production and Preview. The earlier automatic
review rejection is resolved by that explicit authorization. The four variables
listed above have been saved for both environments, with `SUPABASE_SECRET_KEY`
stored as sensitive. Verification inspected metadata only, without decrypting keys.
No deployment was triggered by this configuration step. The modified application
still needs to be published before the live site uses the database-backed code.
