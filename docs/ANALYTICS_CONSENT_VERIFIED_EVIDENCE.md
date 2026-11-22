# Google Consent Mode Verified Test Evidence

> Provenance note added 22 November 2026: this file was already present locally
> before the analytics release review. Its results are retained as historical
> manual evidence. They were not rerun for the identifier/quality payload release,
> and do not establish ingestion of its new fields in GA4/PostHog. Current release
> scope and automated checks are documented in `ANALYTICS_CONSENT.md`.

This document records completed manual verification of MotorZero's Google Consent Mode implementation. Results marked **Verified** are completed test evidence, not assumptions or future recommendations. Do not request that these tests be repeated unless the implementation changes.

## Project

- Website: `https://www.motorzero.pt/pt`
- GTM container: `GTM-MG49P4DS`
- GA4 measurement ID: `G-050C1KBYPK`
- Consent implementation: Google Advanced Consent Mode v2

## Test 1 — Clean First Visit (No User Interaction)

**Status: Verified**

### Procedure

1. In Chrome DevTools, used Application → Storage → Clear site data.
2. Reloaded the website.
3. Did not click Accept, Reject, or Manage Preferences.

### Cookie banner

- Displayed correctly.

### Chrome Application → Cookies

- `_ga` was not present.
- `_ga_050C1KBYPK` was not present.
- The only functional cookie present was `locale=pt`.

### Tag Assistant

| Consent type | State |
| --- | --- |
| `analytics_storage` | `denied` |
| `ad_storage` | `denied` |
| `ad_user_data` | `denied` |
| `ad_personalization` | `denied` |
| `functionality_storage` | `granted` |
| `security_storage` | `granted` |

### Network

A GA4 request was sent to:

```text
https://www.google-analytics.com/g/collect
```

Relevant request parameters:

```text
tid = G-050C1KBYPK
gcs = G100
gcd = 13p3p3p3p5l1
npa = 1
dma = 0
pscdl = denied
cid = 363714668.1786102540
en = page_view
```

### Verified conclusions

- The Google Tag initialized successfully.
- Consent Mode parameters were attached to the request.
- `analytics_storage` remained denied.
- No GA cookies existed.
- GA4 sent a cookieless request.
- The presence of `cid` without a `_ga` cookie indicates an in-memory, non-persistent Client ID.
- This matches Google Advanced Consent Mode behavior.

## Test 2 — Accept All

**Status: Verified**

### Procedure

Starting from the clean session in Test 1, clicked **Accept all**.

### Cookies

Immediately after accepting:

- `_ga` was created.
- `_ga_050C1KBYPK` was created.

### Network

The GA4 request changed. Relevant request parameters:

```text
tid = G-050C1KBYPK
gcs = G111
gcd = 13r3r3r3r5l1
gcu = 1
gcut = 3
npa = 0
dma = 0
pscdl = noapi
cid = 363714668.1786102540
```

### Verified conclusions

- Consent state changed from denied to granted.
- Analytics cookies were created only after consent.
- Network consent encoding changed correctly.
- `npa` changed from `1` to `0`.
- The same Client ID (`cid`) was preserved.
- GA persisted the previously generated in-memory Client ID into the `_ga` cookie instead of generating a new identifier.

## Test 3 — Reject All

**Status: Verified — PASS**

### Procedure

Used a fresh browser session and selected **Reject all**.

### Cookies and storage

- The only cookie present was the functional `locale` cookie.
- `_ga` was not present.
- The measurement-specific `_ga_*` cookie was not present.
- Local Storage contained `motorzero_cookie_consent_v1` with:

```text
analytics: false
marketing: false
```

### Tag Assistant

| Consent type | State |
| --- | --- |
| `analytics_storage` | `denied` |
| `ad_storage` | `denied` |
| `ad_user_data` | `denied` |
| `ad_personalization` | `denied` |
| `functionality_storage` | `granted` |
| `security_storage` | `granted` |

The GA4 Configuration tag fired once, as expected for Advanced Consent Mode.

The consent update was:

```js
gtag('consent', 'update', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
})
```

### Custom-event gating

None of the following custom events fired:

- `model_viewed`
- `vehicle_viewed`
- `comparison_created`
- `recommendation_completed`
- `content_shared`
- `outbound_click`
- `contact_intent`

### Verified conclusion

Reject All correctly persisted denied consent, created no GA cookies, allowed only the expected cookieless GA4 configuration behavior, and blocked custom GA4 events.

## Test 4 — Accept All and Custom Events

**Status: Verified — PASS**

### Procedure

Used a fresh browser session and selected **Accept all**.

### Cookies and storage

- `_ga` was created.
- The measurement-specific `_ga_*` cookie was created.
- Local Storage contained `motorzero_cookie_consent_v1` with:

```text
analytics: true
marketing: true
```

### Tag Assistant

| Consent type | State |
| --- | --- |
| `analytics_storage` | `granted` |
| `ad_storage` | `granted` |
| `ad_user_data` | `granted` |
| `ad_personalization` | `granted` |

### Custom events and network

GA4 custom events fired normally. The verified `model_viewed` example included:

- `brand`
- `model`
- `model_slug`
- `canonical_path`
- `page_type`
- `market`
- `language`
- `locale`
- `variant_count`

The `collect?v=2` request contained `npa=0`, included cookies, and exhibited normal consented GA4 request behavior.

### Verified conclusion

Accept All correctly granted consent, persisted the choice, created GA cookies, and enabled custom GA4 events with the intended parameters.

## Test 5 — Reload Persistence After Reject

**Status: Verified — PASS**

After rejecting and reloading:

- The cookie banner did not appear again.
- Consent was restored automatically from Local Storage.
- The consent default executed first with denied storage and `wait_for_update: 500`.
- A consent update immediately restored all four optional consent types to denied.
- The current consent state remained denied.
- No GA cookies were created.
- Only the cookieless GA4 configuration ping was sent.
- No custom GA4 events fired.

## Test 6 — Reload Persistence After Accept

**Status: Verified — PASS**

After accepting and reloading:

- Consent was restored automatically.
- The denied consent default executed first.
- The consent update immediately switched all four optional consent types to granted.
- GA cookies were recreated.
- The GA4 Configuration tag fired.
- Custom GA4 events operated normally.

## Tag Assistant Observations

**Status: Verified**

Before consent, the Google Tag (GA4) reported **Succeeded** while:

```text
analytics_storage = denied
ad_storage = denied
```

GA4 Event tags did not fire.

This behavior is expected in Google Advanced Consent Mode and must not be considered a defect. Do not recommend delaying or blocking the Google Tag merely because it fires during Initialization.

## Implementation Order

**Status: Verified from code**

1. Inline consent defaults execute inside `<head>`.
2. Default consent is set to denied.
3. Saved consent is restored if valid.
4. GTM loads.
5. The Google Tag initializes.
6. The cookie banner mounts.
7. The user chooses consent.
8. The choice is stored.
9. `gtag('consent', 'update', ...)` executes.
10. `consent_update` is pushed into `dataLayer`.

## Overall Verified Conclusion

The implementation behaves consistently with Google Advanced Consent Mode v2.

Verified:

- Consent defaults are established before GTM executes.
- The Google Tag initializes while consent is denied.
- GA4 sends cookieless `page_view` requests before consent.
- No `_ga` or `_ga_*` cookies exist before consent.
- `_ga` and `_ga_050C1KBYPK` are created only after Accept All.
- Consent parameters (`gcs` and `gcd`) change correctly after consent.
- The same Client ID is preserved across the denied → granted transition.
- The presence of `cid` before consent is not evidence of a defect because no persistent Analytics storage existed.

Therefore, do not recommend delaying or blocking the Google Tag simply because it fires during Initialization. This is expected and correct for Advanced Consent Mode.

## Final Validation Status

The implementation has been fully validated in GTM Preview, Chrome DevTools, and GA4 network requests.

| Validation area | Result |
| --- | --- |
| Google Consent Mode v2 | PASS |
| Advanced Consent Mode | PASS |
| Consent persistence | PASS |
| Reject flow | PASS |
| Accept flow | PASS |
| GA4 Configuration behavior | PASS |
| Cookieless pings before consent | PASS |
| Cookies only after consent | PASS |
| Custom GA4 events respect consent | PASS |
| No duplicate tracking detected | PASS |
| No consent persistence issues detected | PASS |

The implementation is considered production-ready.

## Remaining Tests

The core implementation is fully validated. The following preference combination was listed previously but is not required to support the production-readiness conclusion above:

- Manage Preferences with Analytics allowed and Marketing denied.
