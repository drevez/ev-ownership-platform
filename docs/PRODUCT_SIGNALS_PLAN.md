# Product Signals Plan

MotorZero should use analytics as a product improvement loop, not as broad surveillance. The goal is to learn:

- where people get stuck
- which vehicles/models people compare or search for
- which missing vehicles people ask for
- which pages are unclear or unhelpful
- which paths lead to useful decisions and sharing

Keep the first version intentionally small. Add more signals only when a question cannot be answered with the current data.

## Tool Split

```txt
GA4 through GTM    Acquisition, SEO, landing pages, channels, macro conversions
PostHog            Product funnels, vehicle demand, comparison/recommender behaviour
Feedback storage   Optional written feedback and suggested vehicles/models
```

GA4 should stay useful for traffic quality. PostHog should stay useful for product decisions. Feedback storage should become the place for actionable user input that needs review.

In code, GA4 macro events are pushed with `pushGaEvent()` from `lib/gaEvents.ts`. GTM still needs a matching Custom Event trigger and GA4 Event tag for each event that should appear as a GA4 event or conversion.

The proposed canonical event names, semantic payloads, tool split, and migration plan live in [ANALYTICS_EVENT_SCHEMA.md](/Users/danielarevez/ev-ownership-platform/docs/ANALYTICS_EVENT_SCHEMA.md). The implementation process and audit acceptance criteria live in [TRACKING_IMPLEMENTATION_SPEC.md](/Users/danielarevez/ev-ownership-platform/docs/TRACKING_IMPLEMENTATION_SPEC.md).

## Phase 1: Minimum Useful Signals

Use this phase first. These events are enough to see whether users discover vehicles, compare them, finish recommendations, and give feedback.

### GA4 Events

```txt
page_view
recommendation_completed
comparison_created
vehicle_viewed
model_viewed
content_shared
contact_intent
outbound_click
page_feedback_voted
```

Use GA4 for:

- most visited model and vehicle pages
- most viewed vehicle IDs, brands, and model families
- comparison creations by type, vehicle count, and first selected vehicles
- shared content by type and share method
- landing pages by traffic source
- language and device performance
- broad conversion rate from SEO/acquisition into comparison or recommendation

Do not use GA4 as the main place to analyze search terms, raw free text, or detailed recommendation result behaviour.

GA4 should prefer predictable report fields:

```txt
vehicle_id             singular detail page vehicle
top_vehicle_id         singular top recommender result
vehicle_set            normalized compared vehicle IDs
brand_set              normalized compared brands
```

For combinations, keep `vehicles` as the canonical app object. GA4 should use the app-derived `vehicle_set`, sorted so `car-a|car-b` and `car-b|car-a` group as the same comparison. PostHog should keep the richer `vehicles` array and ordered `vehicle_ids` for product analysis.

### PostHog Events

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
page_feedback_voted
page_feedback_note_sent
vehicle_search_performed
vehicle_search_no_results
vehicle_suggestion_opened
vehicle_suggestion_submitted
```

Recommended properties:

```txt
locale
page_type
page_path
market
source_component
```

For vehicle/model events, add:

```txt
vehicle_id
model_slug
brand
model
variant
```

For comparison events, add:

```txt
comparison_type          models | versions
selected_ids            vehicle ids or model slugs
selected_brands
vehicle_count
```

For recommendation events, add:

```txt
top_vehicle_id
result_vehicle_ids
result_count
```

For search events, add:

```txt
query_normalized
query_length
result_count
```

Avoid storing raw long user text in analytics properties. Normalize search queries by trimming, lowercasing, and limiting length.

## Phase 2: Vehicle Demand Signals

This is the part that answers: "What other vehicles should be added?"

Add a lightweight "Suggest this vehicle" path in places where intent is already clear:

- search with no results
- model/vehicle selector with no results
- comparison selector empty result state
- recommender result page feedback
- model listing feedback

Do not make this a large form. Suggested first version:

```txt
Can't find it?
Suggest a vehicle
```

Fields:

```txt
brand              optional but encouraged
model              required
variant            optional
market_context     Portugal new | Portugal used | import | not sure
note               optional
```

Store with:

```txt
source_page
source_component
locale
query_normalized
result_count
created_at
```

Tracking:

```txt
vehicle_suggestion_opened
vehicle_suggestion_submitted
```

Only `vehicle_suggestion_submitted` should be treated as a strong demand signal. Opens are useful for UX, but submissions are what should feed the internal backlog.

## Phase 3: Internal Signals Dashboard

Create an internal page later, for example:

```txt
/internal/signals
```

Useful sections:

```txt
Most compared vehicles
Most compared model pairs
Most searched terms
Searches with no results
Suggested vehicles to add
Pages with most thumbs down
Recent feedback notes
Recommendation results clicked most often
Comparison share rate
Recommender completion rate
```

Default sorting should be "needs attention", not vanity metrics:

1. repeated no-result searches
2. repeated suggested vehicles
3. pages with high thumbs-down rate
4. vehicles often compared but with missing data/images
5. recommendation drop-off points

## Feedback Strategy

Feedback should stay subtle and contextual:

```txt
Was this useful?
Thumb up / thumb down
Optional: What was missing or confusing?
```

Collect on:

- model pages
- vehicle pages
- comparison result pages
- recommender result pages

Do not ask for feedback on every static/legal page.

Feedback payload should include:

```txt
vote                 useful | not_useful
note                 optional
page_type
page_path
locale
vehicle_id           when relevant
model_slug           when relevant
comparison_ids       when relevant
recommendation_ids   when relevant
```

If the note mentions a missing car, it can later be manually or automatically converted into a vehicle suggestion. Keep that as a later workflow, not a first-version requirement.

## What Not To Track Yet

Avoid:

- every click
- scroll depth
- heatmaps
- session replay
- every quiz answer
- every simple/advanced mode switch
- raw personal information
- full unbounded free-text notes as analytics properties
- internal/admin usage mixed with public usage

Mode-switch tracking is only useful during a focused UX test of simple versus advanced. Otherwise it should stay off or be ignored in dashboards.

## CRO Questions To Answer

Use these questions to decide whether tracking is worth adding:

```txt
Do people complete the recommender?
Do recommender results lead to vehicle detail clicks?
Do filters help people reach vehicle pages?
Which vehicles/models are compared most often?
Which search terms produce no results?
Which missing vehicles are repeatedly suggested?
Which pages get negative feedback?
Do comparison pages get shared?
```

If an event does not help answer one of these, do not add it yet.

`recommendation_result_clicked` is intentionally not implemented yet. Add it later only if recommendation cards need clearer downstream measurement than vehicle page views already provide.

## GTM And PostHog Setup Notes

What is already implemented in code:

```txt
GA4 dataLayer events:
  recommendation_completed
  comparison_created
  vehicle_viewed
  model_viewed
  content_shared
  contact_intent
  outbound_click
  page_feedback_voted

PostHog manual events:
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

What still needs to be configured outside the code:

1. In GTM, create Custom Event triggers and GA4 Event tags for the GA4 events above.
2. In GA4, register only the custom dimensions that will be used in reports, such as `vehicle_id`, `brand`, `model_slug`, `comparison_type`, `vehicle_count`, `vehicle_set`, `brand_set`, `content_type`, `share_method`, `top_vehicle_id`, `knowledge_mode`, and `helpful`.
3. Mark only strong actions as GA4 key events: `recommendation_completed`, `comparison_created`, `content_shared`, and optionally `contact_intent` or `page_feedback_voted`.
4. In PostHog, create dashboards for recommender completion, comparison sharing, search no-results, suggested vehicles, and page feedback.
5. Keep PostHog autocapture, heatmaps, session replay, surveys, and experiments disabled until there is a specific research need and the privacy copy is updated.
6. Add share UI to model and recommendation-result pages later only if it has a clear UX/growth benefit. Vehicle and comparison sharing already use `content_shared`.
