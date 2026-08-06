# Analytics Event Schema

Status: proposed tracking schema v2. This is not a complete description of what the app currently emits today.

This document is the proposed source of truth for MotorZero analytics events. It is intentionally a planning document first: review and agree the structure before changing the implementation.

Use [ANALYTICS_CONSENT.md](/Users/danielarevez/ev-ownership-platform/docs/ANALYTICS_CONSENT.md) when you need the current GTM, GA4, PostHog, and consent implementation. Use this file when deciding the future canonical event names, payload objects, and destination mapping rules.

For the broader audit, validation, migration, and acceptance process, use [TRACKING_IMPLEMENTATION_SPEC.md](/Users/danielarevez/ev-ownership-platform/docs/TRACKING_IMPLEMENTATION_SPEC.md).

## Goal

MotorZero should use analytics to improve the product without turning the app into a noisy tracking surface.

The analytics model should answer:

- which vehicles and models people view
- which vehicles and model families people compare
- which comparisons are shared
- whether people complete the recommender
- which vehicles are recommended most often
- where search fails
- what vehicles users ask to add
- which pages feel useful or confusing
- which acquisition pages lead to useful actions

## Tool Responsibilities

```txt
GTM dataLayer      Semantic event payload, readable by GTM and future tools
GA4               Acquisition, SEO, high-level conversions, clean reporting dimensions
PostHog           Product behaviour, funnels, vehicle demand, richer arrays/objects
Feedback storage  Written notes, suggested vehicles, review queues
```

GA4 should not be the only analytics brain. It should stay clean and useful for traffic and macro conversion reporting. PostHog should carry the richer product-analysis workload.

## Core Principles

1. Keep one canonical event name per action whenever possible.
2. Use `snake_case` for event names and data keys.
3. Prefer past-tense action names: `vehicle_viewed`, `comparison_created`, `content_shared`.
4. Push a semantic payload to `dataLayer`, not only GA4-shaped flat parameters.
5. Use domain objects such as `vehicles`, `comparison`, `recommendation`, `search`, `feedback`, `contact`, and `outbound`.
6. Derive GA4 parameters from the semantic payload in GTM.
7. Send PostHog richer arrays/objects for product analysis.
8. Avoid raw personal data, unbounded free text, and sensitive inferred traits.
9. Every event should include `event_schema_version`.
10. Events should only fire after the relevant consent state allows them.

## Naming Rules

Canonical event names:

```txt
vehicle_viewed
model_viewed
comparison_created
comparison_mode_changed
comparison_selection_mode_changed
content_shared
recommendation_started
recommendation_completed
recommendation_mode_changed
vehicle_search_performed
vehicle_search_no_results
vehicle_suggestion_opened
vehicle_suggestion_submitted
page_feedback_voted
page_feedback_note_sent
contact_intent
outbound_click
```

Resolved naming decision for schema v2:

```txt
Previous GA4 name: vehicle_detail_viewed.
Canonical schema v2 name: vehicle_viewed.
```

Do not rename `outbound_click` unless there is a strong reason. It is already simple and commonly understood.

## Base Payload

Every event should include:

```js
{
  event: 'comparison_created',
  event_schema_version: 2,
  page: {
    path: '/pt/comparador/versoes',
    canonical_path: '/compare/versions',
    type: 'comparison',
    language: 'pt',
    market: 'pt',
    locale: 'pt-PT'
  }
}
```

Definitions:

```txt
page.path             localized browser path
page.canonical_path   internal non-localized route shape when available
page.type             home | models | model | vehicle | comparison | recommender | content | contact
page.language         required UI language: pt | en | es
page.market           required data/commercial market, initially pt
page.locale           optional/derived display locale, for example pt-PT | en-PT | es-PT
```

`language` and `market` are the primary analytics dimensions. `locale` may be included for display, debugging, or SEO context, but it should be derived from `language + market` and should not replace either field.

Current examples:

```txt
Portuguese UI for Portugal market: language = pt, market = pt, locale = pt-PT
English UI for Portugal market:    language = en, market = pt, locale = en-PT
Spanish UI for Portugal market:    language = es, market = pt, locale = es-PT
```

Future market expansion should keep the same separation. For example, Spanish UI for Spain should use `language = es`, `market = es`, and `locale = es-ES`.

## Vehicles Object

Use `vehicles` whenever an event involves one or more vehicles.

```js
vehicles: [
  {
    id: 'tesla-model-y-long-range',
    brand: 'Tesla',
    model: 'Model Y',
    variant: 'Long Range',
    model_year: 2026,
    position: 1
  }
]
```

Recommended optional future fields:

```txt
body_type
segment
drivetrain
price_context        new | used | imported_used | reference_new | unknown
data_quality         complete | partial | needs_validation
```

Do not include full specs in analytics events. Range, charging, price, and battery values can be added later only if a reporting question requires them.

## Derived Vehicle Fields

For GA4 and quick reporting, derive flat fields from `vehicles`.

```js
vehicle_count: 2,
vehicle_ids: 'tesla-model-y-long-range|kia-ev5-tech',
vehicle_set: 'kia-ev5-tech|tesla-model-y-long-range',
brand_set: 'Kia|Tesla'
```

Rules:

```txt
vehicle_id             singular vehicle, used on vehicle_viewed
top_vehicle_id         singular top recommender result
vehicle_ids            stable joined string of all vehicle IDs in user-selected/result order
vehicle_set            normalized joined string of vehicle IDs, sorted for comparison reporting
brand_set              normalized joined string of brands, sorted for brand-combination reporting
```

Use `vehicle_set` in GA4 when the reporting question is "which cars are compared together?" because it groups `A|B` and `B|A` together. Use `vehicle_ids` or `vehicles[]` in PostHog when the selected order matters.

## Model Object

Use `model_entity` for model-family events to avoid confusion with the generic `model` string inside a vehicle.

```js
model_entity: {
  slug: 'tesla-model-y',
  brand: 'Tesla',
  name: 'Model Y',
  variant_count: 3
}
```

GA4 derived fields:

```txt
model_slug
brand
model_name
variant_count
```

## Comparison Object

```js
comparison: {
  type: 'versions',
  mode: 'simple',
  vehicle_count: 2,
  selection_source: 'selector'
}
```

Definitions:

```txt
comparison.type        models | versions
comparison.mode        simple | advanced
selection_source       selector | url | compare_bar | unknown
```

## Recommendation Object

```js
recommendation: {
  knowledge_mode: 'simple',
  result_count: 5,
  top_vehicle_id: 'tesla-model-y-long-range',
  purchase_type: 'used',
  budget_band: '30000-40000'
}
```

Rules:

```txt
Do not send exact budget to GA4.
Use budget_band for GA4.
PostHog may receive more quiz context if it is privacy-safe and useful.
Do not send raw free-text answers.
```

## Search Object

```js
search: {
  query_normalized: 'renault 5',
  query_length: 9,
  result_count: 0,
  source_component: 'models_explorer',
  mode: 'models'
}
```

Rules:

```txt
Search events should stay PostHog-first.
Do not send raw long search text to GA4.
Normalize, lowercase, trim, and length-limit search terms.
```

## Feedback Object

```js
feedback: {
  helpful: false,
  has_note: true,
  note_length: 86
}
```

Written feedback text should go to feedback storage, not GA4 or PostHog event properties.

## Contact Object

```js
contact: {
  topic: 'commercial',
  has_reply_to: true,
  has_page_url: false
}
```

Do not send name, email address, or message body to analytics.

## Outbound Object

```js
outbound: {
  label: 'creator_credit',
  url_host: 'danielarevez.com',
  url: 'https://danielarevez.com/?utm_source=motorzero&utm_medium=referral&utm_campaign=project_credit'
}
```

For GA4, `url_host` and `label` are usually more useful than the full URL. Keep full URL only if needed for debugging.

## Vehicle Suggestion Object

```js
vehicle_suggestion: {
  suggested_brand: 'renault',
  suggested_model: 'renault 5',
  market_context: 'pt_used',
  source_component: 'models_explorer'
}
```

Suggestion details should primarily go to feedback/suggestion storage and PostHog. GA4 does not need vehicle suggestion text at first.

## Event Matrix

| Event | dataLayer | GA4 now | PostHog now | Future |
| --- | --- | --- | --- | --- |
| `vehicle_viewed` | Yes | Yes | Yes | Canonical schema v2 vehicle view event |
| `model_viewed` | Yes | Yes | Yes | Use `model_entity` object |
| `comparison_created` | Yes | Yes | Yes | Add `vehicles`, `comparison`, `vehicle_ids` |
| `comparison_mode_changed` | Optional | No | Yes | Keep PostHog-only unless testing simple vs advanced |
| `comparison_selection_mode_changed` | Optional | No | Yes | Keep PostHog-only |
| `content_shared` | Yes | Yes | Yes | Comparison and vehicle sharing implemented; add model/recommendation sharing only if useful |
| `recommendation_started` | Optional | No | Yes | Keep PostHog-only unless it becomes a funnel key event in GA4 |
| `recommendation_completed` | Yes | Yes | Yes | Add `vehicles`, `recommendation`, `budget_band` |
| `recommendation_mode_changed` | Optional | No | Yes | Keep PostHog-only |
| `vehicle_search_performed` | Optional | No | Yes | Keep PostHog-only |
| `vehicle_search_no_results` | Optional | No | Yes | Optional GA4 only if acquisition reports need missing-demand signal |
| `vehicle_suggestion_opened` | Optional | No | Yes | Keep PostHog-only |
| `vehicle_suggestion_submitted` | Optional | No | Yes | Optional GA4 key event later |
| `page_feedback_voted` | Yes | Yes | Yes | Keep lightweight |
| `page_feedback_note_sent` | Optional | No | Yes | Feedback storage should be source of truth |
| `contact_intent` | Yes | Yes | Yes | Keep lightweight |
| `outbound_click` | Yes | Yes | Yes | Keep lightweight |

## Tool Implementation Plan

### Implement Now

Use these as the first schema-v2 implementation batch:

```txt
vehicle_viewed
model_viewed
comparison_created
content_shared
recommendation_completed
page_feedback_voted
contact_intent
outbound_click
```

Why these first:

```txt
They are high-value macro actions.
They are already implemented in some form.
They help GA4 acquisition reports.
They help PostHog product funnels.
They do not require storing sensitive text.
```

### Keep PostHog-Only For Now

```txt
recommendation_started
recommendation_mode_changed
comparison_mode_changed
comparison_selection_mode_changed
vehicle_search_performed
vehicle_search_no_results
vehicle_suggestion_opened
vehicle_suggestion_submitted
page_feedback_note_sent
```

Why:

```txt
These are product/UX diagnostic signals.
They are noisier.
They are less useful in GA4 standard acquisition reports.
PostHog is better for funnels, breakdowns, arrays, and debugging.
```

### Future GA4 Candidates

Consider later:

```txt
vehicle_suggestion_submitted
vehicle_search_no_results
recommendation_started
```

Only add these to GA4 if there is a clear acquisition or conversion question.

### Future Events Not Yet Implemented

```txt
recommendation_result_clicked
compare_cta_clicked
vehicle_share_clicked
model_share_clicked
saved_comparison_created
price_alert_started
newsletter_signup_started
newsletter_signup_completed
```

Do not add these until the UX exists.

## Example Payloads

### vehicle_viewed

```js
{
  event: 'vehicle_viewed',
  event_schema_version: 2,
  page: {
    path: '/pt/veiculos/tesla-model-y-long-range',
    canonical_path: '/vehicles/tesla-model-y-long-range',
    type: 'vehicle',
    language: 'pt',
    market: 'pt',
    locale: 'pt-PT'
  },
  vehicles: [
    {
      id: 'tesla-model-y-long-range',
      brand: 'Tesla',
      model: 'Model Y',
      variant: 'Long Range',
      model_year: 2026,
      position: 1
    }
  ],
  vehicle_id: 'tesla-model-y-long-range',
  brand: 'Tesla',
  model: 'Model Y',
  variant: 'Long Range',
  model_year: 2026
}
```

### comparison_created

```js
{
  event: 'comparison_created',
  event_schema_version: 2,
  page: {
    path: '/pt/comparador/versoes',
    canonical_path: '/compare/versions',
    type: 'comparison',
    language: 'pt',
    market: 'pt',
    locale: 'pt-PT'
  },
  comparison: {
    type: 'versions',
    mode: 'simple',
    vehicle_count: 2,
    selection_source: 'url'
  },
  vehicles: [
    {
      id: 'tesla-model-y-long-range',
      brand: 'Tesla',
      model: 'Model Y',
      variant: 'Long Range',
      model_year: 2026,
      position: 1
    },
    {
      id: 'kia-ev5-tech',
      brand: 'Kia',
      model: 'EV5',
      variant: 'Tech',
      model_year: 2026,
      position: 2
    }
  ],
  vehicle_count: 2,
  vehicle_ids: 'tesla-model-y-long-range|kia-ev5-tech',
  vehicle_set: 'kia-ev5-tech|tesla-model-y-long-range',
  brand_set: 'Kia|Tesla'
}
```

### recommendation_completed

```js
{
  event: 'recommendation_completed',
  event_schema_version: 2,
  page: {
    path: '/pt/recomendador',
    canonical_path: '/recommend',
    type: 'recommender',
    language: 'pt',
    market: 'pt',
    locale: 'pt-PT'
  },
  recommendation: {
    knowledge_mode: 'simple',
    result_count: 5,
    top_vehicle_id: 'volkswagen-id3-pro',
    purchase_type: 'used',
    budget_band: '20000-30000'
  },
  vehicles: [
    {
      id: 'volkswagen-id3-pro',
      brand: 'Volkswagen',
      model: 'ID.3',
      variant: 'Pro',
      model_year: 2024,
      position: 1
    }
  ],
  result_count: 5,
  top_vehicle_id: 'volkswagen-id3-pro',
  top_brand: 'Volkswagen',
  vehicle_ids: 'volkswagen-id3-pro|...'
}
```

### content_shared

```js
{
  event: 'content_shared',
  event_schema_version: 2,
  page: {
    path: '/pt/comparador/versoes',
    canonical_path: '/compare/versions',
    type: 'comparison',
    language: 'pt',
    market: 'pt',
    locale: 'pt-PT'
  },
  content: {
    type: 'comparison',
    share_method: 'native_share'
  },
  comparison: {
    type: 'versions',
    mode: 'simple',
    vehicle_count: 2
  },
  vehicles: []
}
```

## GA4 Parameter Strategy

GA4 Event tags should receive selected flat parameters derived from the payload.

Recommended GA4 dimensions:

```txt
event_schema_version
page_type
language
market
vehicle_id
vehicle_ids
brand
model
variant
model_year
model_slug
model_name
variant_count
comparison_type
comparison_mode
vehicle_count
vehicle_set
brand_set
content_type
share_method
knowledge_mode
budget_band
purchase_type
result_count
top_vehicle_id
top_brand
helpful
contact_topic
outbound_label
outbound_url_host
```

Do not create every dimension immediately. Start with the ones used in dashboards.

Recommended GA4 key events:

```txt
recommendation_completed
comparison_created
content_shared
contact_intent
```

Optional later:

```txt
page_feedback_voted
vehicle_suggestion_submitted
```

## GTM Variable Strategy

Use Data Layer Variables for direct fields:

```txt
event_schema_version
vehicle_id
brand
model
variant
model_year
vehicle_count
vehicle_set
brand_set
top_vehicle_id
top_brand
budget_band
purchase_type
```

Use dot notation for nested fields:

```txt
page.type
page.language
page.market
comparison.type
comparison.mode
content.type
content.share_method
recommendation.knowledge_mode
recommendation.budget_band
contact.topic
outbound.label
outbound.url_host
```

Use Custom JavaScript Variables for derived values:

```js
function() {
  var vehicles = {{DLV - vehicles}} || [];
  return vehicles.map(function(vehicle) {
    return vehicle && vehicle.id;
  }).filter(Boolean).join('|');
}
```

Use this as `vehicle_ids`.

## PostHog Property Strategy

PostHog can receive the semantic objects directly:

```txt
page
vehicles
comparison
recommendation
search
feedback
contact
outbound
vehicle_suggestion
```

Also keep useful flat properties for fast filtering:

```txt
page_path
page_type
language
market
vehicle_count
vehicle_ids
top_vehicle_id
comparison_type
knowledge_mode
source_component
```

## Migration Plan

Phase 1: Documentation and agreement.

```txt
Create this schema document.
Review event names and payloads.
Decide which events move to schema v2 first.
```

Phase 2: Add a shared analytics helper.

```txt
Create one helper that builds:
  base page context
  vehicles array
  derived GA4 fields
  PostHog payload
```

Phase 3: Update existing events.

```txt
vehicle_viewed is the canonical vehicle detail view event
comparison_created adds vehicles/comparison/vehicle_ids
content_shared adds content/vehicles/comparison when relevant
recommendation_completed adds recommendation/vehicles
page_feedback_voted adds feedback/page
```

Phase 4: GTM update.

```txt
Create GTM variables for nested objects and derived fields.
Update GA4 Event tags to use schema v2 parameters.
Preview before publishing.
```

Phase 5: PostHog dashboards.

```txt
Create funnels and breakdowns using schema v2 fields.
Avoid dashboards that depend on old names once migration is complete.
```

## Open Decisions

These should be agreed before implementation:

1. Should `vehicle_suggestion_submitted` become a GA4 key event later or stay PostHog/storage only?
2. Should model or recommendation result pages get share actions later, or are comparison and vehicle sharing enough for now?
