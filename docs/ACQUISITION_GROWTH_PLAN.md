# MotorZero Acquisition Growth Plan

Objective: grow qualified traffic and repeat usage for MotorZero in Portugal by turning structured EV data into useful pages, shareable tools, and measurable acquisition loops.

## Positioning

MotorZero should be positioned as a Portugal-first electric car decision platform, not only as a catalogue.

Core promise:

> Compare electric cars in Portugal with clear prices, range, charging, and practical recommendations for real daily use.

This matters because most users are not searching for raw specifications. They are searching for answers:

- Which electric car should I buy?
- Is this model good for my budget?
- Should I buy new, used, or imported?
- How much range do I really need?
- How long does charging take?
- What is the best EV for family, city, motorway, or apartment living?

## Priority Overview

| Priority | Initiative | Impact | Effort | Why it matters |
|---|---:|---:|---:|---|
| 1 | Programmatic SEO pages | Very high | Medium | Uses existing JSON data to create scalable acquisition pages. |
| 2 | Shareable comparison and recommendation URLs | Very high | Medium | Car decisions are social; users share options with friends, partners, and family. |
| 3 | Beginner-friendly recommendation funnel | High | Medium | Converts casual visitors who do not understand EV specs. |
| 4 | Trust, freshness, and methodology | High | Low/Medium | Increases confidence in data, prices, and recommendations. |
| 5 | Lead capture and saved intent | High | Medium | Turns one-time visitors into owned audience. |
| 6 | Analytics event quality | High | Low | Makes acquisition measurable instead of guesswork. |
| 7 | Internal linking system | Medium/High | Low | Improves SEO discovery and user depth. |
| 8 | Content distribution formats | Medium | Medium | Converts app insights into social/search content. |
| 9 | Partnerships | Medium/High | High | Valuable later, once product and data quality are stronger. |

## 1. Programmatic SEO Pages

Create useful landing pages from structured vehicle data.

Recommended page families:

- Best EVs by budget:
  - `/pt/melhores-carros-eletricos/ate-30000`
  - `/pt/melhores-carros-eletricos/ate-40000`
  - `/pt/melhores-carros-eletricos/ate-50000`

- Best EVs by use case:
  - `/pt/melhores-carros-eletricos/familia`
  - `/pt/melhores-carros-eletricos/cidade`
  - `/pt/melhores-carros-eletricos/viagens`
  - `/pt/melhores-carros-eletricos/apartamento`

- Market-specific pages:
  - `/pt/carros-eletricos/novos`
  - `/pt/carros-eletricos/usados`
  - `/pt/carros-eletricos/importados`

- Comparison pages:
  - `/pt/comparador/tesla-model-y-vs-kia-ev5`
  - `/pt/comparador/volvo-ex30-vs-smart-1`

Each page should include:

- clear H1 matching search intent
- short human explanation
- ranked list generated from data
- filters or links to refine
- links to model pages
- links to recommender and comparator
- data freshness and price context
- FAQ block for long-tail SEO

Success metrics:

- impressions by page family
- clicks from Google Search Console
- organic sessions
- click-through to model pages
- recommender starts from SEO pages

## 2. Shareable Comparison And Recommendation URLs

Make outputs easy to share and revisit.

Recommended improvements:

- stable comparison URLs for models and versions
- clean route for SEO/share:
  - `/pt/comparador/modelos/tesla-model-y-vs-kia-ev5`
  - `/pt/comparador/versoes/tesla-model-y-long-range-vs-kia-ev5-tech`
- Open Graph title and description per comparison
- share button on comparison result
- copy link button
- result summary that makes sense in WhatsApp/iMessage previews
- recommendation result URL with encoded quiz state or saved lightweight state

Why this matters:

Buying a car is rarely a solo decision. People send options to partners, friends, family, WhatsApp groups, and forums.

Success metrics:

- share button clicks
- copied links
- return visits to shared URLs
- comparisons created per session
- recommendation result views

## 3. Beginner-Friendly Recommendation Funnel

The recommender should serve two groups:

- beginners who do not understand EV specs
- proficient users who want control and detail

Recommended flow:

- keep Simple / Advanced mode
- make Simple mode more conversational:
  - "Where will you charge most often?"
  - "How many people usually travel with you?"
  - "Do you do motorway trips often?"
  - "Are you open to used/imported cars?"

- Advanced mode should expose:
  - AC/DC importance
  - motorway range
  - battery size
  - price market: new, used, imported
  - body type
  - ownership priority

Result improvements:

- show "why this fits" in plain language
- show "what to watch out for"
- show price type clearly:
  - New from
  - Used from
  - Imported used from
  - Reference new price
- show data confidence
- show next best action:
  - compare with another model
  - view details
  - adjust budget
  - include used/imported

Success metrics:

- quiz starts
- quiz completions
- completion rate by device
- result card clicks
- compare-starts from recommendation results

## 4. Trust, Freshness, And Methodology

MotorZero needs visible trust signals because price, range, and recommendations affect high-value decisions.

Recommended additions:

- methodology page
- data confidence explanation
- price type explanation:
  - official Portugal new price
  - national used market reference
  - imported used reference
  - historical new reference
- "last updated" per vehicle/price
- source type labels
- disclaimer on final dealer price, campaigns, import costs, and availability

Where to show this:

- model pages
- comparison result pages
- recommender result cards
- FAQ
- footer

Success metrics:

- lower bounce rate on model/comparison pages
- more comparison starts
- more contact/data correction submissions
- fewer confused price-related comments

## 5. Lead Capture And Saved Intent

Add low-friction capture without making the app feel pushy.

Good acquisition/conversion offers:

- "Send this comparison to my email"
- "Save this comparison"
- "Notify me when this model has updated prices"
- "Receive EV buying guide for Portugal"
- "Tell me when more used/imported data is available"

Start simple:

- email capture through a lightweight form provider or safe backend route
- no account required initially
- consent-aware analytics event

Later:

- saved comparisons
- price alerts
- account-based garage/watchlist

Success metrics:

- email capture rate
- saved comparison rate
- returning visitors
- alert signups by vehicle/model

## 6. Analytics Event Quality

Track acquisition and conversion behavior with GTM/GA4 after consent.

Recommended events:

- `search_performed`
- `model_filter_used`
- `model_viewed`
- `comparison_started`
- `comparison_completed`
- `comparison_shared`
- `recommendation_started`
- `recommendation_completed`
- `recommendation_result_clicked`
- `language_switched`
- `contact_prepared`
- `cookie_consent_updated`

Recommended event properties:

- locale
- route
- market
- device category
- selected vehicle IDs or model slugs where privacy-safe
- purchase type
- knowledge mode: simple or advanced
- result count

Success metrics:

- conversion path from landing page to tool usage
- top acquisition pages by downstream engagement
- drop-off points in quiz
- most used filters
- most compared vehicles

## 7. Internal Linking System

Every page should naturally lead to the next useful action.

Examples:

- model page -> compare this model
- model page -> similar models
- model page -> used/imported explanation
- comparison page -> relevant buying guide
- guide page -> recommender
- FAQ answer -> specific model/comparator/recommender route
- homepage -> recommender + top SEO pages

Recommended components:

- "Related comparisons"
- "Similar models"
- "Popular for this use case"
- "Learn before choosing"
- "Continue with recommender"

Success metrics:

- pages per session
- internal CTR
- reduced bounce from SEO pages
- more comparison/recommendation starts

## 8. Content Distribution Formats

Turn data into recurring content.

Formats:

- "Best EVs under 30k in Portugal"
- "3 used EVs worth comparing this week"
- "New vs used: which one wins?"
- "EV charging explained in 60 seconds"
- "Range myths: WLTP vs real use"
- "Comparison screenshot: Model A vs Model B"

Channels:

- Google Search
- TikTok
- Instagram Reels/carousels
- YouTube Shorts
- LinkedIn
- Reddit/Facebook EV groups, carefully and helpfully
- newsletters

Important:

Do not distribute generic car content. The advantage is Portugal-specific data and practical decision framing.

Success metrics:

- referral traffic
- social saves/shares
- branded search growth
- direct visits
- comparison/recommender starts from social

## 9. Partnerships

Partnerships should come after the app has stronger data, SEO pages, and shareable results.

Potential partners:

- EV communities
- used EV dealers
- import specialists
- leasing companies
- home charger installers
- energy providers
- insurance partners
- newsletters and creators

Partnership assets needed first:

- clear traffic numbers
- audience intent data
- top searched models
- top compared models
- methodology/trust page
- clean commercial contact page

Success metrics:

- referral traffic
- qualified leads
- partner landing page conversion
- revenue per partner route

## Recommended Roadmap

### Phase 1: Measurement And Shareability

Goal: know what users do and make useful outputs shareable.

Tasks:

- add analytics events
- add share/copy link to comparison
- improve recommendation result URLs
- add Open Graph metadata for comparison/recommendation pages
- add methodology/trust page

### Phase 2: Programmatic SEO Foundation

Goal: create scalable acquisition pages from existing structured data.

Tasks:

- define page templates
- create budget pages
- create use-case pages
- create new/used/imported pages
- add FAQ blocks
- add internal linking
- include sitemap entries

### Phase 3: Conversion And Retention

Goal: capture demand and bring users back.

Tasks:

- email capture for saved comparison
- price update alert
- "notify me when data improves"
- comparison history or saved links
- contact/feedback loops

### Phase 4: Distribution And Partnerships

Goal: grow beyond organic search.

Tasks:

- create recurring content templates
- publish comparison snippets
- test social formats
- approach partners with data-backed insights

## Best Next Implementation Step

The strongest next technical step is:

1. Add analytics events for recommender, comparator, model filters, and search.
2. Add shareable comparison URLs with strong metadata.
3. Build the first programmatic SEO template: "best electric cars by budget".

This sequence is strong because it creates measurable acquisition, improves sharing, and starts organic growth without needing a large editorial operation.

