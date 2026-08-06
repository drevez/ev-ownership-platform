# Analytics And Consent

MotorZero uses Google Tag Manager as its only tracking container and implements a lightweight first-party consent banner with Google Consent Mode v2.

Status: this document describes the current analytics and consent implementation. Event names listed here are the events currently emitted by the app unless a section explicitly says "recommended" or "future".

Event naming and payload design for the next tracking iteration are covered in [ANALYTICS_EVENT_SCHEMA.md](/Users/danielarevez/ev-ownership-platform/docs/ANALYTICS_EVENT_SCHEMA.md). Structural tracking changes should follow [TRACKING_IMPLEMENTATION_SPEC.md](/Users/danielarevez/ev-ownership-platform/docs/TRACKING_IMPLEMENTATION_SPEC.md).

## Current Vs Proposed Tracking

Current implementation:

- GTM is loaded centrally from `NEXT_PUBLIC_GTM_ID`.
- GA4 is expected to exist inside GTM only.
- Consent Mode v2 defaults are denied before GTM loads.
- The first-party cookie banner controls analytics and marketing consent.
- GA4/dataLayer events are already emitted for recommendation completion, comparisons, vehicle/model views, sharing, contact intent, outbound links, and page feedback.
- PostHog is optional and loads only after analytics consent when `NEXT_PUBLIC_POSTHOG_KEY` is configured.

Proposed/future tracking:

- The richer canonical event schema in `ANALYTICS_EVENT_SCHEMA.md` is a tracking v2 plan, not a guarantee that every event/property is already implemented.
- Some current GA4 event names may be renamed or remapped later if the v2 schema is approved.
- Deeper product analysis, repeated search demand, missing-vehicle signals, and feedback aggregation still need final storage/reporting decisions.

## Configuration

Required environment variable:

```env
NEXT_PUBLIC_GTM_ID=GTM-MG49P4DS
```

Optional future server-side GTM endpoint:

```env
NEXT_PUBLIC_GTM_SCRIPT_URL=https://gtm.example.com/gtm.js
```

Set public environment variables in `.env.local` for development and in Vercel Project Settings for Preview and Production. Redeploy after changing `NEXT_PUBLIC_*` values.

## Implementation

```txt
app/layout.tsx                         Consent defaults and saved-choice restoration
components/GoogleTagManager.tsx       Central GTM loader
components/CookieConsentBanner.tsx    Consent UI
components/PostHogConsentLoader.tsx   Optional consent-aware PostHog bootstrap
lib/cookieConsent.ts                  Storage, updates, expiry, and GA cookie removal
lib/gaEvents.ts                       Consent-aware GA4 dataLayer event helper
lib/posthogClient.ts                  Lazy PostHog import and manual event capture
components/SiteFooter.tsx             Cookie settings reopen button
```

The root layout sets these defaults before GTM loads:

```txt
analytics_storage = denied
ad_storage = denied
ad_user_data = denied
ad_personalization = denied
```

This is Advanced Consent Mode: Google tags may send cookieless pings while consent is denied, but analytics or advertising cookies must not be written.

## Consent Choices

- Accept all grants analytics and marketing consent.
- Reject all denies all four optional consent types.
- Manage preferences lets analytics and marketing be controlled separately.
- Every change pushes `event: "consent_update"` to `dataLayer`.
- Choices are stored in `localStorage` under `motorzero_cookie_consent_v1`.
- Choices expire after 180 days.
- Incrementing `CONSENT_POLICY_VERSION` in `lib/cookieConsent.ts` requests consent again.
- Withdrawing analytics consent attempts to remove first-party `_ga` and `_ga_*` cookies.

## GTM And GA4

Do not add a direct `gtag.js` or `GoogleAnalytics` component to the application. GA4 `G-050C1KBYPK` must be configured inside `GTM-MG49P4DS`.

Recommended GTM setup for the `Google Tag - GA4` tag:

```txt
Tag type: Google Tag
Tag ID: G-050C1KBYPK
Consent settings:
  Built-in consent checks should show:
    ad_storage
    ad_personalization
    ad_user_data
    analytics_storage
  Additional consent checks:
    No additional consent required
```

Do not use `Require additional consent for tag to fire` on the GA4 Google Tag. Google tags already understand Consent Mode through the built-in checks. Requiring extra consent can block the tag completely and reduce Consent Mode to a simpler on/off blocker instead of a consent-aware Google tag.

Use extra consent checks only for future non-Google or marketing tags that genuinely need to be blocked until a specific consent type is granted.

Use GTM Preview to verify:

1. Consent Default
2. Consent Initialization
3. Initialization
4. Container Loaded
5. Consent Update after a visitor choice

Also verify that the container contains only one Google tag/page-view configuration. Next.js client navigation must generate exactly one intended page view.

## Current DataLayer Push Inventory

The app can push the following entries to `dataLayer`.

Consent and GTM system entries:

| Entry | Source | When it happens | Notes |
| --- | --- | --- | --- |
| `gtag('consent', 'default', ...)` | `app/layout.tsx` | Before GTM loads | Sets denied defaults for analytics and ads consent. |
| `gtag('consent', 'update', ...)` | `app/layout.tsx` | On page load when a valid saved choice exists | Restores consent before/with GTM initialization. |
| `consent_update` | `app/layout.tsx` | On page load when a valid saved choice exists | Mirrors restored consent for GTM triggers/debugging. |
| `gtag('consent', 'update', ...)` | `lib/cookieConsent.ts` | When a visitor accepts, rejects, or saves preferences | Updates Consent Mode after a user action. |
| `consent_update` | `lib/cookieConsent.ts` | When a visitor accepts, rejects, or saves preferences | Do not treat as a normal GA4 conversion event. |
| GTM container events | GTM script | When GTM loads and processes tags | Includes GTM-managed events such as container load and configured page views. |

Current custom consent-aware app events pushed through `pushGaEvent()`:

```txt
recommendation_completed
comparison_created
vehicle_viewed
model_viewed
content_shared
contact_intent
outbound_click
page_feedback_voted
```

These events are emitted by the app, but they only become GA4 reports after the matching Custom Event triggers, GA4 Event tags, and parameters are configured in GTM. Keep GA4 event parameters lightweight and predictable. Use PostHog for search terms, full result arrays, and deeper product analysis.

Tracking v2 should separate `language`, `market`, and optional derived `locale`:

```txt
language  required UI language, for example pt | en | es
market    required commercial/data market, initially pt
locale    optional derived display locale, for example pt-PT | en-PT | es-PT
```

The current app emits `language`, `market`, and derived `locale` in schema-v2 custom events. Some older PostHog-only events may still use a simpler `locale` property until they are migrated.

Current GA4 naming rule:

```txt
vehicle_id                  one specific vehicle, used on vehicle detail events
top_vehicle_id              one top recommendation result
vehicle_ids                 ordered joined vehicle IDs, preserving user/result order
vehicle_set                 normalized joined vehicle IDs, sorted for combination reporting
brand_set                   normalized joined brands, sorted for combination reporting
```

GA4 can work with list-like values, but MotorZero should keep `vehicles` as the canonical multi-vehicle object and derive only the flat fields needed for reports:

```txt
Semantic source:
  vehicles array

Useful GA4 fields:
  normalized joined string such as vehicle_set = id-a|id-b|id-c
  normalized joined brands such as brand_set = audi|bmw|tesla
  ordered joined string such as vehicle_ids = id-b|id-a|id-c when order matters
```

`vehicle_ids` preserves the user-selected/result order. `vehicle_set` sorts the IDs so `car-a|car-b` and `car-b|car-a` report as the same comparison in GA4. Prefer `vehicle_set` for GA4 comparison reports and keep `vehicles[]`/`vehicle_ids` for PostHog product analysis.

Custom dataLayer event payloads currently sent by the app:

```txt
Common schema-v2 fields on migrated events:
  event_schema_version
  page
  page_path
  page_type
  canonical_path
  language
  market
  locale

vehicle_viewed
  vehicle_id
  brand
  model
  variant
  model_year
  model_slug
  vehicles

model_viewed
  model_slug
  model_name
  brand
  model
  variant_count

comparison_created
  comparison
  comparison_type
  vehicle_count
  vehicle_ids
  vehicle_set
  brand_set
  vehicle_names
  vehicles

content_shared
  content
  comparison
  vehicles
  content_type
  comparison_type
  vehicle_count
  vehicle_ids
  vehicle_set
  brand_set
  share_method
  page_path

  Current content_type values implemented by the app:
    comparison
    vehicle

recommendation_completed
  recommendation
  vehicles
  knowledge_mode
  result_count
  top_vehicle_id
  top_brand
  top_match_percentage
  budget_band
  purchase_type

contact_intent
  contact
  topic
  has_reply_to
  has_page_url

outbound_click
  outbound
  link_label
  outbound_label
  outbound_url_host
  page_path

page_feedback_voted
  feedback
  page_path
  helpful
```

Step-by-step GTM setup for each GA4 event:

1. In GTM, create a Custom Event trigger with the exact event name, for example `comparison_created`.
2. In Variables, create Data Layer Variables for the parameters you want to send to GA4, for example `comparison_type`, `vehicle_count`, `vehicle_set`, and `brand_set`.
3. Create a GA4 Event tag using the existing GA4 Google Tag as the configuration source.
4. Set the GA4 event name to the same event name, except shared content should stay as `content_shared` with `content_type` as a parameter.
5. Add only the useful event parameters. If you need a multi-vehicle value, use `vehicle_ids` from the semantic `vehicles` array.
6. Keep consent settings on the GA4 Event tag as built-in Google consent checks with no extra consent requirement.
7. Preview in GTM, accept analytics consent on the site, and confirm the event appears after `consent_update`.
8. Publish the GTM container only after Preview shows one expected event and no duplicate page views.

Recommended GTM Data Layer Variables:

| Variable name | Data Layer Variable name | Use |
| --- | --- | --- |
| `DLV - language` | `language` | UI language |
| `DLV - market` | `market` | Commercial/data market |
| `DLV - locale` | `locale` | Optional derived display locale |
| `DLV - vehicle_id` | `vehicle_id` | Singular vehicle detail views |
| `DLV - brand` | `brand` | Singular vehicle/model detail views |
| `DLV - model` | `model` | Singular vehicle/model detail views |
| `DLV - variant` | `variant` | Singular vehicle detail views |
| `DLV - model_year` | `model_year` | Singular vehicle detail views |
| `DLV - model_slug` | `model_slug` | Model detail views |
| `DLV - variant_count` | `variant_count` | Model detail views |
| `DLV - comparison_type` | `comparison_type` | Model vs version comparisons |
| `DLV - vehicle_count` | `vehicle_count` | Number of compared vehicles/models |
| `DLV - vehicle_ids` | `vehicle_ids` | Ordered joined comparison IDs, for example `id-a|id-b|id-c` |
| `DLV - vehicle_set` | `vehicle_set` | Normalized comparison IDs, sorted so the same cars group together |
| `DLV - brand_set` | `brand_set` | Normalized brands, sorted so the same brand combinations group together |
| `DLV - vehicle_names` | `vehicle_names` | Optional ordered joined comparison names |
| `DLV - content_type` | `content_type` | Shared content type |
| `DLV - share_method` | `share_method` | Native/share/copy/email/WhatsApp |
| `DLV - page_path` | `page_path` | Feedback, outbound, and share context |
| `DLV - knowledge_mode` | `knowledge_mode` | Simple vs advanced recommender |
| `DLV - result_count` | `result_count` | Number of recommendation results |
| `DLV - top_vehicle_id` | `top_vehicle_id` | Top recommendation result |
| `DLV - top_brand` | `top_brand` | Top recommendation brand |
| `DLV - budget_band` | `budget_band` | Recommender budget band |
| `DLV - purchase_type` | `purchase_type` | Recommender purchase context |
| `DLV - topic` | `topic` | Contact intent topic |
| `DLV - has_reply_to` | `has_reply_to` | Contact form context |
| `DLV - has_page_url` | `has_page_url` | Contact form context |
| `DLV - outbound_label` | `outbound_label` | Outbound link label |
| `DLV - outbound_url_host` | `outbound_url_host` | Outbound link host |
| `DLV - helpful` | `helpful` | Page feedback vote |

You do not need to create all variables on day one. Create the variables required by the GA4 Event tags you configure first.

Use `vehicle_ids` as the GA4 event parameter for the compared combination. Keep the positional fields too if you want easy "first car versus second car" analysis.

Recommended GA4 key events:

```txt
recommendation_completed
comparison_created
content_shared
contact_intent
page_feedback_voted
```

Do not mark every vehicle or model view as a key event. Use those as engagement and demand dimensions.

Confirmed GA4/GTM event tag setup:

| Event | Confirmed base parameters | Optional parameters also configured |
| --- | --- | --- |
| `recommendation_completed` | `knowledge_mode`, `result_count`, `top_vehicle_id`, `top_brand`, `language`, `market`, `page_type`, `canonical_path` | `budget_band`, `purchase_type` |
| `comparison_created` | `comparison_type`, `vehicle_count`, `vehicle_set`, `brand_set`, `language`, `market`, `page_type`, `canonical_path` | `vehicle_ids` |
| `content_shared` | `content_type`, `share_method`, `vehicle_count`, `vehicle_set`, `brand_set`, `language`, `market`, `page_type`, `canonical_path` | `vehicle_ids`, `comparison_type` |
| `vehicle_viewed` | `vehicle_id`, `brand`, `model_slug`, `language`, `market`, `page_type`, `canonical_path` | `model` |
| `model_viewed` | `model_slug`, `brand`, `language`, `market`, `page_type`, `canonical_path` | `model`, `variant_count` |
| `contact_intent` | `topic`, `language`, `market`, `page_type`, `canonical_path` | None |
| `outbound_click` | `outbound_url_host`, `language`, `market`, `page_type`, `canonical_path` | `outbound_label` |
| `page_feedback_voted` | `helpful`, `language`, `market`, `page_type`, `canonical_path` | None |

Recommended GA4 custom dimensions:

```txt
vehicle_id
language
market
page_type
brand
model
variant
model_year
model_slug
variant_count
comparison_type
vehicle_count
vehicle_ids
vehicle_set
brand_set
content_type
share_method
knowledge_mode
result_count
top_vehicle_id
top_brand
budget_band
purchase_type
topic
page_path
outbound_label
outbound_url_host
helpful
```

Add only the dimensions you will actively report on. GA4 has custom-dimension limits, so avoid registering every possible field.

### Complete GA4 Event Inventory

These are the GA4/dataLayer events currently implemented in the app.

| Event | Source | Main purpose | GTM action |
| --- | --- | --- | --- |
| `page_view` | GTM/GA4 config | Acquisition, landing pages, SEO traffic, device/language context | Keep one GA4 page-view setup only |
| `recommendation_completed` | `components/recommendation/QuizForm.tsx` | Recommender completion and top suggested vehicle | Create Custom Event trigger + GA4 Event tag |
| `comparison_created` | `components/comparison/ComparePageContent.tsx` | Compare result loaded with 2+ vehicles/models | Create Custom Event trigger + GA4 Event tag |
| `vehicle_viewed` | `app/vehicles/[id]/page.tsx` through `ViewEventTracker` | Most viewed vehicle IDs/brands/models | Create Custom Event trigger + GA4 Event tag |
| `model_viewed` | `app/models/[slug]/page.tsx` through `ViewEventTracker` | Most viewed model families and brands | Create Custom Event trigger + GA4 Event tag |
| `content_shared` | `components/comparison/ComparisonPage.tsx`, `components/vehicle/VehicleShareButton.tsx` | Shared comparison/vehicle links and share method | Create Custom Event trigger + GA4 Event tag |
| `contact_intent` | `components/contact/ContactMailForm.tsx` | Contact form mailto intent | Create Custom Event trigger + GA4 Event tag |
| `outbound_click` | `components/analytics/TrackedExternalLink.tsx` | External attribution links such as creator credit, using host/label in GA4 | Create Custom Event trigger + GA4 Event tag |
| `page_feedback_voted` | `components/PageFeedback.tsx` | Useful/not useful feedback vote | Create Custom Event trigger + GA4 Event tag |

Consent and system events:

| Event | Source | Notes |
| --- | --- | --- |
| `consent_update` | `lib/cookieConsent.ts` | Used by GTM/Consent Mode. Do not treat as a normal GA4 conversion event. |

## Optional Product Analytics With PostHog

MotorZero can use two free analytics tools with distinct responsibilities:

```txt
GA4 through GTM    Acquisition, SEO, traffic sources, campaigns, Search Console context
PostHog            Product behaviour, funnels, recommender/comparator usage, feedback events
```

PostHog is optional. It is disabled unless `NEXT_PUBLIC_POSTHOG_KEY` is configured. GA4 should remain inside GTM only, with no direct `gtag.js` or `GoogleAnalytics` install in the app.

Current PostHog implementation rules:

- Load PostHog only after analytics consent is granted.
- Use a dynamic import so PostHog is not part of the initial JavaScript bundle.
- Initialize after the page is interactive, ideally during `requestIdleCallback` or a small post-load delay.
- Use the EU host by default.
- Disable session replay at first.
- Disable broad autocapture.
- Disable automatic PostHog pageviews and pageleave events.
- Disable surveys, external dependency loading, and feature flags in the SDK until those features are intentionally adopted.
- Track only a small set of manual events that answer product and growth questions.
- Keep GTM as the only Google tracking container.

Environment variables:

```env
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

Current manual PostHog events:

```txt
recommendation_started
recommendation_completed
recommendation_mode_changed
comparison_created
comparison_mode_changed
comparison_selection_mode_changed
content_shared
contact_intent
outbound_click
vehicle_viewed
model_viewed
model_filter_used
vehicle_search_performed
vehicle_search_no_results
vehicle_suggestion_opened
vehicle_suggestion_submitted
page_feedback_voted
page_feedback_note_sent
```

### Complete PostHog Event Inventory

These are the manual PostHog events currently implemented in the app.

| Event | Source | Main properties | Use |
| --- | --- | --- | --- |
| `recommendation_started` | `components/recommendation/QuizForm.tsx` | `locale`, `knowledge_mode`, budget/use answers | Recommender start and drop-off |
| `recommendation_completed` | `components/recommendation/QuizForm.tsx` | `language`, `market`, `page_type`, `canonical_path`, `knowledge_mode`, `result_count`, `top_vehicle_id`, `top_brand`, `budget_band`, `purchase_type` | Recommender completion, top result, budget band, and purchase context |
| `recommendation_mode_changed` | `components/recommendation/QuizForm.tsx` | `locale`, `knowledge_mode` | Simple vs advanced UX testing |
| `comparison_created` | `components/comparison/ComparePageContent.tsx` | `comparison_type`, `vehicle_count`, `selected_ids`, `selected_names`, `locale` | Most compared vehicles/models |
| `comparison_mode_changed` | `components/comparison/ComparisonPage.tsx` | `mode`, `vehicle_count`, `selected_ids` | Simple vs advanced comparison UX testing |
| `comparison_selection_mode_changed` | `components/comparison/VehicleSelector.tsx` | `from_mode`, `to_mode`, `selected_count` | Selector mode friction |
| `content_shared` | `components/comparison/ComparisonPage.tsx`, `components/vehicle/VehicleShareButton.tsx` | `content_type`, `comparison_type` when relevant, `vehicle_count`, `vehicle_ids`, `selected_ids`, `selected_names`, `share_method` | Share rate and most shared comparisons/vehicles |
| `contact_intent` | `components/contact/ContactMailForm.tsx` | `topic`, `has_reply_to`, `has_page_url` | Contact intent by topic |
| `outbound_click` | `components/analytics/TrackedExternalLink.tsx` | PostHog: `link_url`, `link_label`; GA4/dataLayer: `outbound_url_host`, `outbound_label` | External link attribution |
| `vehicle_viewed` | `app/vehicles/[id]/page.tsx` through `ViewEventTracker` | `vehicle_id`, `brand`, `model`, `variant`, `model_year`, `model_slug` | Vehicle demand and page quality |
| `model_viewed` | `app/models/[slug]/page.tsx` through `ViewEventTracker` | `model_slug`, `model_name`, `brand`, `variant_count` | Model-family demand |
| `model_filter_used` | `components/model/ModelsExplorer.tsx` | `filter_type`, `value`, `mode`, `result_count` | Filter usefulness and catalog UX |
| `vehicle_search_performed` | `components/search/SearchBar.tsx`, `components/model/ModelsExplorer.tsx`, `components/comparison/VehicleSelector.tsx` | `query_normalized`, `query_length`, `result_count`, `page_type`, `source_component`, `mode` when relevant | Search behaviour |
| `vehicle_search_no_results` | Same search surfaces | `query_normalized`, `query_length`, `result_count`, `page_type`, `source_component`, `mode` when relevant | Missing vehicle/model demand |
| `vehicle_suggestion_opened` | `components/VehicleSuggestionPrompt.tsx` | `source_component`, `page_path`, `locale`, `query_normalized`, `result_count` | Interest in suggesting missing vehicles |
| `vehicle_suggestion_submitted` | `components/VehicleSuggestionPrompt.tsx` | `suggested_brand`, `suggested_model`, `market_context`, `source_component`, `query_normalized` | Strong signal for what to add next |
| `page_feedback_voted` | `components/PageFeedback.tsx` | `page_path`, `localized_page_path`, `helpful`, `locale` | Page usefulness score |
| `page_feedback_note_sent` | `components/PageFeedback.tsx` | `page_path`, `localized_page_path`, `helpful`, `locale`, `message_length` | Qualitative UX/content feedback |

Recommended first PostHog dashboards and funnels:

```txt
Recommender funnel:
  recommendation_started -> recommendation_completed
  breakdowns: knowledge_mode, locale, top_vehicle_id

Comparison funnel:
  comparison_created -> content_shared
  breakdowns: comparison_type, vehicle_count, selected_ids

Vehicle demand:
  vehicle_search_no_results
  vehicle_suggestion_submitted
  breakdowns: query_normalized, locale, source_component

Feedback quality:
  page_feedback_voted
  page_feedback_note_sent
  breakdowns: page_path, locale, helpful
```

PostHog should answer detailed product questions such as which vehicles are repeatedly compared, which missing models people request, where searches fail, and which pages receive negative feedback. GA4 should answer acquisition and high-level conversion questions.

Future implementation steps still to do:

1. Add share actions to model pages and recommendation result pages only if there is a clear UX/growth reason.
2. Keep using `content_shared` with `content_type` values such as `model` and `recommendation_result` if those share actions are added.
3. Add a small internal signals page that summarizes repeated no-result searches, suggested vehicles, thumbs-down pages, and most compared/shared vehicles or comparisons.
4. Connect `POST /api/vehicle-suggestions` to a storage destination such as a webhook, sheet, database, or PostHog-backed workflow.
5. Review privacy copy before enabling any future session replay, heatmaps, surveys, or broader autocapture.

Consent-aware loading order:

```txt
Page load
-> Consent Mode defaults are denied
-> GTM loads
-> GA4 waits for analytics consent inside GTM
-> Visitor grants analytics consent
-> Consent Mode updates to granted
-> PostHog initializes lazily
-> Manual product events can be captured
```

Avoid enabling PostHog session replay, heatmaps, surveys, or broad autocapture until there is a clear reason and the privacy copy has been reviewed.

## PostHog Project Setup

Use Product Analytics as the initial PostHog feature set. Suggested project settings:

```txt
Autocapture frontend interactions: off
Heatmaps: off
Web vitals autocapture: optional, keep off unless actively monitoring performance in PostHog
Session replay: off
Surveys: off
Feature flags / experiments: not needed yet
```

The SDK also enforces this lightweight mode:

```txt
autocapture = false
capture_pageview = false
capture_pageleave = false
disable_session_recording = true
disable_surveys = true
disable_surveys_automatic_display = true
disable_external_dependency_loading = true
advanced_disable_feature_flags = true
```

View events are consent-aware. If a visitor lands on a tracked page before accepting analytics, the view event waits for analytics consent and then sends once after the consent update.

The project token is a public client token, but it should still be kept in Vercel environment variables rather than hardcoded in source files:

```env
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

After updating Vercel environment variables, redeploy the site. In PostHog Live Events, accept analytics consent on the website and then visit a tracked page such as a model, vehicle, comparison, or recommender result page.

## External Attribution Links

The about page credits the creator with a tagged outbound link:

```txt
https://danielarevez.com/?utm_source=motorzero&utm_medium=referral&utm_campaign=project_credit
```

Keep the visible text simple (`danielarevez.com`) and use `rel="noopener"` for the new tab link. The UTM parameters help the destination site attribute traffic from MotorZero. They do not directly improve MotorZero SEO, but a clear creator attribution link is appropriate and useful for analytics on the destination site.

## Local Testing

1. Start the app with `npm run dev`.
2. Open the displayed localhost port.
3. Use a private window or clear `motorzero_cookie_consent_v1`.
4. Confirm no `_ga` cookies exist before analytics consent.
5. Accept analytics and confirm `_ga` cookies are created.
6. Reopen Cookie settings, reject analytics, and confirm GA cookies are removed.
7. Reload and confirm the saved choice persists.

Tag Assistant can add attributes to the root HTML element. `suppressHydrationWarning` is limited to `<html>` so this external mutation does not create a development hydration overlay.

## Legal Pages

Localized public pages:

```txt
/pt/privacidade    /en/privacy    /es/privacidad
/pt/cookies        /en/cookies    /es/cookies
/pt/termos         /en/terms      /es/terminos
```

Legal copy currently lives directly in `locales/pt.ts`, `locales/en.ts`, and `locales/es.ts`. It is not yet exposed in `/internal/content`.
