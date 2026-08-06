# Tracking Schema V2 Checklist

Status: review checklist. Do not implement everything here automatically. Use this file to decide what should move into the app, GTM, GA4, PostHog, or future storage.

Related documents:

- [ANALYTICS_CONSENT.md](/Users/danielarevez/ev-ownership-platform/docs/ANALYTICS_CONSENT.md) documents the current implementation.
- [ANALYTICS_EVENT_SCHEMA.md](/Users/danielarevez/ev-ownership-platform/docs/ANALYTICS_EVENT_SCHEMA.md) proposes the tracking schema v2.
- [TRACKING_IMPLEMENTATION_SPEC.md](/Users/danielarevez/ev-ownership-platform/docs/TRACKING_IMPLEMENTATION_SPEC.md) documents the implementation process and validation rules.

## Principles To Keep

- Keep GTM as the only Google tracking container.
- Keep consent defaults denied before GTM loads.
- Do not add direct GA4 scripts.
- Do not enable PostHog session replay, heatmaps, surveys, broad autocapture, or feature flags yet.
- Track actions that answer a product, CRO, content, SEO, or data-quality question.
- Avoid raw personal data and raw free-text analytics properties.
- Use `language` and `market` as required fields. Keep `locale` optional and derived.
- Use semantic objects such as `page`, `vehicles`, `comparison`, `recommendation`, `search`, `feedback`, `contact`, and `outbound`.

## Decisions Before Code

- [x] Use `event_schema_version: 2`.
- [x] Rename current GA4 `vehicle_detail_viewed` toward canonical `vehicle_viewed`.
- [x] Rename current `model_detail_viewed` toward canonical `model_viewed`.
- [x] Preserve user-selected order in `vehicle_ids`.
- [x] Do not create `vehicle_ids_sorted` for now. Avoid duplicated representations unless a clear reporting question needs it later.
- [x] Use `vehicles` array as the canonical multi-vehicle object, not GA4 `items`.
- [x] Send first GA4 events for macro/CRO reporting: `recommendation_completed`, `comparison_created`, `content_shared`, `contact_intent`, and `page_feedback_voted`.
- [x] Keep first detailed product events PostHog-only: `recommendation_started`, `comparison_mode_changed`, `comparison_selection_mode_changed`, `vehicle_search_performed`, `vehicle_search_no_results`, `vehicle_suggestion_opened`, `vehicle_suggestion_submitted`, and `page_feedback_note_sent`.
- [x] Plan persistent storage beyond PostHog later for feedback notes and vehicle suggestions.
- [x] Send summarized recommendation quiz context only, not full detailed answers.

## App Implementation

- [x] Add or update one shared analytics helper that builds base page context.
- [x] Add or update one helper for `language`, `market`, and optional `locale`.
- [x] Add or update one helper that maps selected vehicles into the `vehicles` array.
- [x] Add or update one helper that derives flat GA4-friendly fields from semantic objects.
- [x] Ensure each tracked action fires once and is protected against rerenders/hydration repeats.
- [x] Ensure events wait for analytics consent where required.
- [x] Keep analytics failures from interrupting the user experience.

## Event Migration

- [x] Vehicle page view: migrate current `vehicle_detail_viewed` toward canonical `vehicle_viewed`.
- [x] Model page view: migrate current `model_detail_viewed` toward canonical `model_viewed`.
- [x] Comparison loaded: enrich `comparison_created` with `page`, `comparison`, `vehicles`, `vehicle_ids`, `language`, and `market`.
- [x] Comparison mode changed: enrich `comparison_mode_changed` with `comparison`, `vehicles`, `language`, and `market`.
- [x] Comparison selection mode changed: enrich `comparison_selection_mode_changed` with source/target mode and selected vehicle count.
- [x] Shared content: keep one `content_shared` event and use `content.type` for `comparison` and `vehicle` now; add `model` or future `recommendation_result` only when those pages get share actions.
- [x] Recommender started: decide whether this stays PostHog-only or also goes to GA4.
- [x] Recommender completed: enrich with `recommendation`, `vehicles`, `top_vehicle_id`, `language`, and `market`.
- [ ] Search performed: keep detailed query analysis in PostHog and avoid sending raw search terms to GA4 unless explicitly approved.
- [x] Search no results: use for missing vehicle/model demand.
- [x] Vehicle suggestion opened/submitted: keep as product/data backlog signal.
- [x] Page feedback voted/note sent: keep lightweight and avoid raw message text in analytics destinations.
- [x] Contact intent: track topic and context only, not message body.
- [x] Outbound click: track host/label/campaign context without leaking unnecessary URLs.

## GA4/GTM Setup

- [x] Create GTM Data Layer Variables for direct flat fields used by the first GA4 events.
- [x] Create GTM Data Layer Variables for `language`, `market`, `page_type`, and `canonical_path`.
- [x] Skip `locale` and `page_path` as GA4 custom dimensions for now.
- [x] Use `vehicle_set` and `brand_set` for normalized GA4 comparison reporting, with `vehicle_ids` configured only where useful.
- [x] Configure GA4 Event tags only for events that need acquisition, CRO, or macro-conversion reporting.
- [ ] Keep GA4 custom dimensions limited to fields that will be actively used.
- [ ] Do not mark every view event as a key event.
- [ ] Preview in GTM before publishing.
- [ ] Confirm no duplicate page views after GTM changes.

## PostHog Setup

- [ ] Keep Product Analytics only.
- [ ] Keep autocapture off.
- [ ] Keep session replay off.
- [ ] Keep heatmaps off.
- [ ] Keep surveys off.
- [ ] Keep feature flags/experiments off until there is a clear need.
- [ ] Build first funnels around recommender completion, comparison creation/share, search no-results, vehicle suggestions, and page feedback.
- [ ] Use PostHog for richer arrays/objects that should not be flattened into GA4.

## Storage And Internal Follow-Up

- [ ] Decide where feedback notes should be stored long term.
- [ ] Decide where vehicle suggestions should be stored long term.
- [ ] Consider an internal signals page later for repeated missing vehicles, repeated searches, negative-feedback pages, and most compared/shared vehicles.
- [ ] Do not show public helpful counts until there is enough volume to avoid misleading early signals.

## Testing And Acceptance

- [ ] Clear consent and verify no optional analytics event fires before analytics consent.
- [ ] Accept analytics and verify events are sent once.
- [ ] Reject analytics and verify events are not sent.
- [ ] Test vehicle page view.
- [ ] Test model page view.
- [ ] Test comparison creation with two vehicles.
- [ ] Test comparison creation with three vehicles.
- [ ] Test comparison sharing.
- [ ] Test recommender completion.
- [ ] Test search no-results and vehicle suggestion.
- [ ] Test page feedback vote and optional note.
- [ ] Verify GA4 DebugView or Realtime for configured GA4 events.
- [ ] Verify PostHog Live Events for configured PostHog events.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
