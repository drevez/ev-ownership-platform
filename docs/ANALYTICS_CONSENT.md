# Analytics And Consent

MotorZero uses Google Tag Manager as its only tracking container and implements a lightweight first-party consent banner with Google Consent Mode v2.

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
lib/cookieConsent.ts                  Storage, updates, expiry, and GA cookie removal
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

Use GTM Preview to verify:

1. Consent Default
2. Consent Initialization
3. Initialization
4. Container Loaded
5. Consent Update after a visitor choice

Also verify that the container contains only one Google tag/page-view configuration. Next.js client navigation must generate exactly one intended page view.

## Future Product Analytics Plan

The preferred future setup is to keep two free analytics tools with distinct responsibilities:

```txt
GA4 through GTM    Acquisition, SEO, traffic sources, campaigns, Search Console context
PostHog            Product behaviour, funnels, recommender/comparator usage, feedback events
```

Do not replace the existing GTM/GA4 setup immediately. GA4 should remain inside GTM only, with no direct `gtag.js` or `GoogleAnalytics` install in the app.

If PostHog is added later, implement it as a lightweight, consent-aware client integration:

- Load PostHog only after analytics consent is granted.
- Use a dynamic import so PostHog is not part of the initial JavaScript bundle.
- Initialize after the page is interactive, ideally during `requestIdleCallback` or a small post-load delay.
- Use the EU host if available for the project.
- Disable session replay at first.
- Disable or limit autocapture at first.
- Track only a small set of manual events that answer product and growth questions.
- Keep GTM as the only Google tracking container.

Suggested future environment variables:

```env
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

Suggested initial PostHog events:

```txt
recommendation_started
recommendation_completed
comparison_created
comparison_shared
vehicle_viewed
model_filter_used
page_feedback_voted
page_feedback_note_sent
```

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
