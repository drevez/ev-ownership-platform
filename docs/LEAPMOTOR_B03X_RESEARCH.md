# Leapmotor B03X — Portugal catalog addition

Reviewed on 22 November 2026. Add the two Portuguese configurations confirmed by
Leapmotor's national press release: **Life Pro 39.8 kWh** and **Design ProMax
53.0 kWh**. The international brochure also mentions Life ProMax; it is not added
because a Portuguese offer for that configuration was not established.

## Sources and selected data

- [Current Portuguese product page](https://www.leapmotor.net/pt-pt/modelos/b03x):
  the advertised starting campaign is **€23,000**, VAT included, for private
  customers, excluding registration/legalization and transport expenses (DLTP).
  Assign this entry-level starting price to Life Pro and make the inference explicit
  in the displayed offer note. WLTP: 292 / 382 km; DC maximum: 100 / 133 kW.
  Normal luggage volume is 405 L; 510 L includes the additional 105 L GigaBox.
- [Portuguese launch update, 15 September 2026](https://www.media.stellantis.com/pt-pt/leapmotor/press/leapmotor-revoluciona-a-mobilidade-urbana-com-o-b03x-o-suv-compacto-100-eletrico-mais-acessivel-em-portugal):
  confirms the two local configurations, front-wheel drive and LFP chemistry.
  Dimensions: 4270 × 1810 × 1635 mm, wheelbase 2605 mm; rear legroom 947 mm;
  luggage capacity with seats folded 1605 L. Design's listed tariff is **€28,285**,
  dated September, with medium confidence for its present applicability. Its old
  €26,025 launch promotion is mentioned only as historical context in the offer
  note, not used as the current price. Likewise, the old Life €22,345 promotion is
  superseded by the current product-page starting price.
- [Official brochure linked from the Portuguese product page](https://www.leapmotor.net/docs/default-source/b03x-documents/5845-26_leapmotor-brochure-b03x.pdf):
  AC charging 11 kW for both configurations. The technical table distinguishes
  Pro 130 kW from ProMax 145 kW motor output; motor output has no supported catalog
  module field, so it is not inserted into an unrelated specification.

## Deliberately unfilled fields

Battery capacity appears in the version names as advertised. Gross versus usable
capacity is not clearly distinguished by these sources, so neither numeric field
is guessed. Likewise, there are no invented real-world ranges or consumption
estimates. Official charging claims cover **30–80%**, so they are not copied into
the catalog's **10–80%** field. Comfort flags remain unspecified where not verified.

Some product-page translations and brochure details differ (e.g. ADAS count and
wheel descriptions); these unneeded details are not encoded. The site's model
headline has appeared in search caches with 401 km, whereas its battery-specific
figures, brochure and Portuguese press release agree on 292/382 km; use those
configuration-specific figures.

## Images

`data/model-media.json` records the official outdoor model photo and original URL.
The Life and Design versions use separate official brown/beige side-profile images.
All three were downloaded from the Portuguese product page and visually inspected;
no generated car imagery is used. Product images are illustrative: paint, wheels
and equipment shown are not a guarantee of a particular Portuguese trim.

Sources and output metadata for version photos are recorded in
`data/internal/vehicle-image-candidates.json`. Local outputs:

- `public/cars/leapmotor-b03x-model.webp` — outdoor model photo, 1280×720.
- `public/cars/leapmotor-b03x-life-pro-39kwh.webp` — Life representative image.
- `public/cars/leapmotor-b03x-design-pro-max-53kwh.webp` — Design representative image.

## Publication and verification

Use the established Supabase skill and existing validated catalog import workflow;
no schema, RLS or permission changes are needed. Import mode refuses different
existing records and preserves revision history. Publish image assets and model
media configuration through GitHub → Vercel first, then import the two versions:

```sh
node scripts/apply-catalog-update.mjs data/catalog-updates/2026-11-22-leapmotor-b03x.json
npm run catalog:apply-update -- data/catalog-updates/2026-11-22-leapmotor-b03x.json --apply
npm run catalog:verify
```

Expected catalog afterwards: **86 versions, 67 model families**. Verify the public
model page, both version pages, image URLs, catalog API and two-version comparison.
