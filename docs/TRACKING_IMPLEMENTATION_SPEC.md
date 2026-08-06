# MotorZero Tracking Implementation Specification

Version: 1.0.0

Purpose: guide the audit, design, and implementation of reliable analytics tracking.

Status: implementation manual. This document describes the process and general rules for tracking work. Some event names and snippets are generic examples, not necessarily the approved MotorZero canonical schema. Use [ANALYTICS_EVENT_SCHEMA.md](/Users/danielarevez/ev-ownership-platform/docs/ANALYTICS_EVENT_SCHEMA.md) for the proposed MotorZero event names and payload structure, and [ANALYTICS_CONSENT.md](/Users/danielarevez/ev-ownership-platform/docs/ANALYTICS_CONSENT.md) for what is currently implemented.

MotorZero tracking should separate `language`, `market`, and optional `locale`: `language` is the UI language, `market` is the commercial/data market, and `locale` is a derived display/SEO context. Do not use `locale` as the only market or language signal.

## 1. Objective

Create a consistent tracking system in which:

- the application defines what happened
- each user action produces one canonical event
- events are validated before dispatch
- analytics destinations receive the required mapping
- tracking logic is centralised and maintainable
- analytics failures never interrupt the user experience

Do not design the application event model around the limitations of one analytics destination.

## 2. Start With An Audit

Before changing tracking code:

1. Find all existing tracking implementations.
2. Search for:
   - `dataLayer.push`
   - `gtag`
   - analytics event helpers
   - PostHog capture and identification calls
   - page-view tracking
   - consent logic
   - user identification logic
3. Create an inventory of:
   - existing events
   - event properties
   - event triggers
   - destination mappings
   - duplicate implementations
   - inconsistent names or types
   - possible privacy risks
4. Identify existing code that can be reused.
5. Do not rewrite the implementation before completing the audit.

When configuration cannot be determined from the repository, label it:

```txt
requires external verification
```

## 3. Core Event Rules

1. Track actions that answer a defined product, marketing, or UX question.
2. One event represents one action.
3. Use properties to describe variations of that action.
4. Create a new event only when the action has a genuinely different meaning.
5. Search the existing event catalogue before adding an event.
6. Never silently change the meaning of a production event.
7. Do not track generic UI noise without an analytical purpose.
8. Track successful outcomes after they occur, rather than only tracking the preceding click.
9. Prevent duplicate events caused by rerenders, route changes, hydration, or repeated listeners.
10. Keep event payloads limited to useful data.

## 4. Naming Conventions

Use `snake_case` for events and properties.

Use object-first, past-tense event names:

```txt
vehicle_viewed
model_viewed
comparison_created
recommendation_completed
content_shared
contact_intent_submitted
outbound_link_clicked
filter_applied
```

The examples above show the naming style. They are not all approved MotorZero event names. For example, the current MotorZero proposal keeps `contact_intent` and `outbound_click` unless a later schema review changes them.

Avoid:

```txt
view_vehicle
vehicleView
click_compare
button_clicked
comparison_created_v2
```

Do not encode property values inside the event name.

Use:

```json
{
  "event": "comparison_created",
  "comparison_type": "manual",
  "vehicle_count": 3
}
```

Do not create:

```txt
manual_comparison_created
ai_comparison_created
three_vehicle_comparison_created
```

## 5. Property Rules

Every property must have:

- one canonical name
- one stable type
- a clear meaning
- a documented required or optional status
- documented allowed values when it is an enum

Supported types include:

```txt
string
number
boolean
array
object
ISO 8601 datetime string
enum
```

Do not mix types:

```json
{
  "vehicle_count": 3
}
```

must not sometimes become:

```json
{
  "vehicle_count": "3"
}
```

Use real booleans:

```json
{
  "logged_in": true
}
```

Do not use:

```json
{
  "logged_in": "yes"
}
```

Do not send `undefined`.

Omit optional properties when unavailable.

Do not use empty strings, `"unknown"`, or `0` merely as substitutes for missing values unless the schema explicitly defines that meaning.

Use `null` only when the distinction between "missing" and "explicitly absent" is analytically relevant.

## 6. Enums

Use controlled lowercase values.

Example:

```ts
type ComparisonType =
  | 'manual'
  | 'recommended'
  | 'shared'
```

Do not allow uncontrolled variations such as:

```txt
manual
Manual
normal
AI
smart
recommended_ai
```

Check existing product terminology before defining enum values.

## 7. Events And Entities

An event represents what happened.

An entity represents a business object involved in the event.

Examples of entities:

```txt
vehicle
model
comparison
recommendation
content
lead
outbound_link
```

Vehicle entity:

```ts
interface VehicleEntity {
  vehicle_id: string
  brand: string
  model: string
  model_slug?: string
  variant?: string
  model_year?: number
  powertrain_type?: string
  body_type?: string
}
```

Rules:

- `vehicle_id` must be stable.
- Do not use display text as the identifier.
- Do not copy complete application or database objects into analytics.
- Include only properties needed by the event or its destinations.

## 8. Flat Properties And Arrays

Keep simple events simple.

For an event involving one vehicle:

```json
{
  "event": "vehicle_viewed",
  "event_id": "evt_123",
  "vehicle_id": "tesla_model_3_long_range",
  "brand": "tesla",
  "model": "model_3",
  "variant": "long_range",
  "model_year": 2026,
  "page_type": "vehicle_detail",
  "locale": "pt-PT"
}
```

Use an array when multiple instances of the same entity are part of one action and their individual details are needed:

```json
{
  "event": "comparison_created",
  "event_id": "evt_124",
  "comparison_id": "cmp_123",
  "comparison_type": "manual",
  "vehicle_count": 2,
  "vehicles": [
    {
      "vehicle_id": "tesla_model_3_long_range",
      "brand": "tesla",
      "model": "model_3"
    },
    {
      "vehicle_id": "hyundai_ioniq_6_awd",
      "brand": "hyundai",
      "model": "ioniq_6"
    }
  ],
  "page_type": "comparison",
  "locale": "pt-PT"
}
```

Do not use indexed application properties such as:

```txt
vehicle_1_id
vehicle_1_brand
vehicle_2_id
vehicle_2_brand
```

Destination-specific flattening may be performed in the destination mapping layer when required.

Include useful derived scalar properties such as:

```txt
vehicle_count
result_count
top_vehicle_id
```

even when related arrays exist, when those values are frequently required for analysis.

Keep arrays bounded according to product constraints.

## 9. Canonical Event Structure

Do not force every event into a deeply nested universal envelope.

Use the simplest validated structure that preserves meaning.

All canonical events should include:

```ts
interface BaseTrackingEvent {
  event: string
  event_id: string
}
```

Add context only where useful:

```txt
page_type
locale
environment
app_version
source
```

Do not manually duplicate properties that destinations already capture reliably unless there is a defined requirement.

## 10. Event ID And Deduplication

Generate one unique `event_id` for each user action.

Use the same `event_id` when the same canonical event is routed to multiple destinations.

Example:

```ts
const eventId = crypto.randomUUID()
```

Use `event_id` for:

- debugging
- deduplication
- comparing destination delivery
- client/server reconciliation
- testing

Do not suppress legitimate repeated actions. Deduplicate only when multiple emissions represent the same action.

## 11. Event Timing

Track the event when its defined action has occurred.

Examples:

- `comparison_created`: after the comparison is successfully created.
- `recommendation_completed`: after valid results are generated.
- `contact_intent_submitted`: after successful submission.
- `vehicle_viewed`: after a valid vehicle view is rendered.
- `outbound_link_clicked`: when the outbound navigation action occurs.

Do not track a successful outcome solely from the click that precedes it if the outcome can fail.

Do not add a manual timestamp to ordinary browser events when the collection system already records time correctly.

Use `occurred_at` only when an event may be delayed, queued, imported, or reconciled with server events.

When used:

```txt
2026-08-06T14:32:18.541Z
```

## 12. Identity

Handle identity centrally.

Keep these concepts separate:

```txt
anonymous_id
user_id
session_id
```

A `user_id` must:

- be a stable first-party identifier
- contain no email address, phone number, or name
- be used only where appropriate
- be removed or reset correctly on logout

Do not manually set destination-managed identity fields as ordinary event properties.

Do not turn temporary event context into persistent user properties.

Persistent user properties should describe stable or long-lived account characteristics, not the latest action or page.

## 13. Privacy And Consent

Never include the following in shared browser tracking events:

```txt
email address
phone number
full name
postal address
password
authentication token
session token
payment information
health information
free-text form content
unfiltered URL query parameters
```

For each property, verify:

- which question it answers
- which destination needs it
- whether it is already collected
- whether a less sensitive value is sufficient

Consent handling must be centralised.

Individual components must not independently bypass or recreate consent logic.

Development and test events must not pollute production analytics.

## 14. Central Tracking Implementation

All custom tracking must pass through one central tracking module.

Product code should call typed event functions:

```ts
trackVehicleViewed({
  vehicle,
  pageType: 'vehicle_detail',
  language: 'pt',
  market: 'pt',
  locale: 'pt-PT',
})

trackComparisonCreated({
  comparisonId,
  comparisonType: 'manual',
  vehicles,
  pageType: 'comparison',
  language: 'pt',
  market: 'pt',
  locale: 'pt-PT',
})
```

Avoid arbitrary tracking calls throughout components:

```ts
track('something', arbitraryPayload)
```

A generic dispatcher may exist internally.

The central tracking client must:

1. generate or accept an `event_id`
2. construct the canonical payload
3. remove undefined values
4. validate the payload
5. check consent and environment
6. dispatch to configured destinations
7. handle errors without breaking product functionality

Do not initialise analytics SDKs or event listeners repeatedly.

## 15. Application And Destination Responsibilities

The application defines:

- what action occurred
- when it occurred
- the canonical event name
- stable entity identifiers
- business classifications
- derived business values

The destination mapping layer defines:

- which destinations receive the event
- destination-specific event names
- destination-specific property names
- transformations required by destination limitations
- which parameters are exposed for reporting or activation

Do not infer important business meaning from button text, CSS selectors, DOM structure, or URL parsing when the application can provide it directly.

## 16. Data-Layer Rules

Initialise without overwriting existing values:

```js
window.dataLayer = window.dataLayer || []
```

Push one complete event object for each action:

```js
window.dataLayer.push({
  event: 'comparison_created',
  event_id: eventId,
  comparison_id: comparisonId,
  comparison_type: comparisonType,
  vehicle_count: vehicles.length,
  vehicles: vehicles.map(toAnalyticsVehicle),
  page_type: 'comparison',
  language: 'pt',
  market: 'pt',
  locale: 'pt-PT',
})
```

Each event must contain the values required for that event.

Do not rely on event-specific properties left behind by previous pushes.

Do not create variables or transformations that are not used by a destination, trigger, or validation rule.

## 17. Destination Mapping

For each event, document:

```txt
canonical event name
destination event name
properties sent
properties renamed
properties omitted
properties transformed
consent requirement
reporting or activation purpose
```

Use a destination's recommended event only when its semantic meaning matches the canonical action.

Do not change the canonical event model merely to fit one destination.

Do not automatically expose every collected property as a reportable dimension.

Review high-cardinality values such as:

```txt
vehicle_id
comparison_id
recommendation_id
link_url
```

before making them reportable dimensions.

Do not automatically model every vehicle interaction as ecommerce. Use ecommerce semantics only where the user action and business model genuinely match them.

## 18. Initial Event Catalogue

Codex must verify existing behaviour before modifying these events.

### vehicle_viewed

A valid vehicle or variant detail view was displayed.

Required:

```txt
event_id
vehicle_id
brand
model
page_type
locale
```

Optional:

```txt
model_slug
variant
model_year
source
```

### model_viewed

A model-level detail or overview was displayed.

Required:

```txt
event_id
model_id
brand
model
model_slug
page_type
locale
```

Optional:

```txt
model_year
variant_count
source
```

Do not fire both `vehicle_viewed` and `model_viewed` for the same semantic view without a documented reason.

### comparison_created

A valid vehicle comparison became available.

Required:

```txt
event_id
comparison_id
comparison_type
vehicle_count
vehicles
page_type
locale
```

Validation:

```txt
vehicle_count equals vehicles.length
at least two vehicles exist
vehicle IDs are unique
```

### recommendation_completed

A recommendation flow was completed and valid results were generated.

Required:

```txt
event_id
recommendation_id
knowledge_mode
result_count
page_type
locale
```

Optional:

```txt
top_vehicle_id
top_brand
completion_duration_ms
answer_count
```

Determine valid `knowledge_mode` values from the existing product.

### content_shared

The user initiated a supported share action.

Required:

```txt
event_id
content_type
share_method
page_type
locale
```

Optional:

```txt
content_id
vehicle_id
comparison_id
recommendation_id
```

The definition must state whether the event represents share initiation or confirmed completion.

### contact_intent_submitted

A valid contact-intent action was successfully submitted.

Required:

```txt
event_id
contact_type
page_type
locale
```

Optional:

```txt
vehicle_id
model_id
dealer_id
lead_id
source
```

Never include entered contact details or free-text content.

### outbound_link_clicked

The user selected a destination outside MotorZero.

Required:

```txt
event_id
link_domain
link_type
page_type
locale
```

Optional:

```txt
sanitised_link_path
vehicle_id
model_id
content_id
position
```

Do not send unsanitised query parameters.

## 19. Tracking Plan

Maintain a machine-readable tracking plan.

Recommended minimum fields for each event:

```txt
name
description
business question
owner
status
trigger
required properties
optional properties
property types
enum values
privacy classification
destination mappings
version
deprecation replacement
```

Example:

```yaml
version: 1.0.0
events:
  comparison_created:
    description: >
      A valid comparison containing the selected vehicles became available.
    owner: product_growth
    status: active
    trigger: comparison creation succeeds
    properties:
      event_id:
        type: string
        required: true
      comparison_id:
        type: string
        required: true
      comparison_type:
        type: string
        required: true
        enum:
          - manual
          - recommended
          - shared
      vehicle_count:
        type: integer
        required: true
        minimum: 2
      vehicles:
        type: array
        required: true
        minimum_items: 2
      page_type:
        type: string
        required: true
        enum:
          - comparison
      locale:
        type: string
        required: true
```

The tracking plan and implementation must remain aligned.

## 20. Validation

Use static types and runtime validation.

Static typing alone is insufficient because runtime values may still be invalid.

Validation must check:

- required properties
- property types
- enum values
- array limits
- entity uniqueness
- relationships such as `vehicle_count === vehicles.length`
- prohibited data
- URL sanitisation

Behaviour:

- development: show useful validation errors
- tests: fail on invalid events
- production: do not break the user journey
- production: do not dispatch invalid events blindly

Use the validation approach already present in the project where suitable.

## 21. Versioning And Deprecation

Use semantic versioning for the tracking specification:

```txt
major.minor.patch
```

Increase the major version for breaking changes, including:

- renaming an event
- changing event meaning
- removing or renaming a property
- changing a property type
- making an optional property required

Increase the minor version for backward-compatible additions, including:

- adding an event
- adding an optional property
- adding a destination mapping

Increase the patch version for documentation or validation corrections that do not change event meaning.

Never silently rename or repurpose an event.

Deprecate the previous definition, introduce the replacement, and document the migration.

Avoid names such as:

```txt
comparison_created_v2
comparison_created_new
comparison_created_final
```

unless the version has an actual stable business meaning.

## 22. Testing

Unit tests should cover:

- valid payload construction
- missing required values
- wrong types
- invalid enums
- array rules
- entity uniqueness
- derived-property consistency
- undefined removal
- sanitisation
- consent routing
- environment controls

Integration tests should confirm, for each critical product action:

- exactly one canonical event is created
- the correct event name is used
- required properties are present
- the same `event_id` is used across destinations
- prohibited data is absent
- failed actions do not generate successful-outcome events

Browser validation should cover:

```txt
vehicle view
model view
comparison creation
recommendation completion
content sharing
contact-intent submission
outbound-link navigation
```

Test repeated actions, SPA navigation, rerenders, and hydration behaviour.

Destination validation should verify:

- event delivery
- event name
- property values and types
- identity
- consent
- duplicate events
- destination mapping

An event appearing in one destination is not sufficient proof that the implementation is complete.

## 23. Performance And Resilience

Tracking must not:

- block rendering
- block navigation
- interrupt product actions
- send complete application state
- send large database records
- initialise SDKs repeatedly
- create duplicate event listeners
- capture unnecessary duplicate context

Keep arrays bounded and payloads focused.

Use descriptive names rather than cryptic abbreviations.

## 24. Implementation Sequence

### Phase 1: Audit

Return:

- current analytics architecture
- all events and properties found
- every direct destination call
- duplicate or inconsistent tracking
- privacy and consent risks
- identity handling
- likely duplicate-event risks

### Phase 2: Proposal

Define:

- target tracking-client structure
- event schemas
- migration mapping
- destination mappings
- validation approach
- consent integration
- duplicate-prevention approach
- testing plan

Prefer improving existing working code over replacing it unnecessarily.

### Phase 3: Core Implementation

Implement:

1. shared event types
2. runtime schemas
3. central dispatcher
4. destination adapters
5. consent and environment controls
6. identity handling
7. automated tests

### Phase 4: Event Migration

Migrate one event at a time.

Recommended order:

1. `vehicle_viewed`
2. `model_viewed`
3. `comparison_created`
4. `recommendation_completed`
5. `content_shared`
6. `contact_intent_submitted`
7. `outbound_link_clicked`

For every event:

- confirm the exact trigger
- implement a typed function
- remove duplicate legacy calls
- add tests
- document mappings
- validate delivery

## 25. Required Codex Output

Return:

### Audit Summary

- existing architecture
- existing event catalogue
- duplicate tracking
- direct destination calls
- identity and consent handling
- data-quality risks
- privacy risks
- performance risks

### Recommended Changes

For each recommendation:

```txt
issue
impact
recommended change
files affected
migration risk
```

### Change Log

For every changed file:

```txt
file path
purpose
events affected
tests added
migration impact
```

### Validation Report

For each migrated event:

```txt
canonical payload validated
destination mappings validated
duplicate prevention tested
consent tested
prohibited-data review completed
```

### Outstanding Work

Clearly distinguish between:

- repository changes
- external configuration
- unresolved product decisions
- production validation still required

Do not claim external work was completed when it was not visible or performed.

## 26. Acceptance Criteria

The implementation is complete when:

1. Custom product events use the central tracking client.
2. Duplicate direct calls are removed for migrated events.
3. Events and properties have documented meanings and types.
4. Critical events have runtime validation and automated tests.
5. Consent and identity are handled centrally.
6. Development data does not pollute production analytics.
7. One canonical event is produced per user action.
8. Destination mappings are documented.
9. High-cardinality reporting fields are deliberately reviewed.
10. No prohibited personal data appears in event payloads.
11. SPA and rerender duplication risks are tested.
12. The tracking plan matches the code.
13. Analytics failures do not interrupt the product.
14. Outstanding external configuration is clearly identified.

## 27. First Instruction

Audit the existing MotorZero repository against this specification before making structural changes.

Return:

1. the current tracking architecture
2. every event and property found
3. every direct analytics call
4. duplicate or inconsistent implementations
5. privacy and consent risks
6. identity handling
7. likely duplicate-event risks
8. the recommended target architecture
9. a migration plan ordered by risk and value
10. the exact files that should change

Do not invent configuration that cannot be verified from the repository.
