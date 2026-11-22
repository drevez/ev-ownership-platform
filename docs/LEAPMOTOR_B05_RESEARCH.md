# Leapmotor B05 catalog addition — reviewed 22 November 2026

## Publication scope

Add model family `leapmotor-b05` and two Portuguese versions through the existing
Supabase save function. The versioned addition file is
`data/catalog-updates/2026-11-22-leapmotor-b05.json`. It is an audit/import input,
not a second live source; subsequent editorial changes belong in the vehicle panel.

| Vehicle ID | Version | WLTP | Peak DC | Price basis |
| --- | --- | --- | --- | --- |
| leapmotor-b05-life-pro-56kwh | Life Pro 56.2 kWh | 401 km | 156 kW | €25,000 official private-customer campaign; VAT included, legalisation and transport excluded |
| leapmotor-b05-design-pro-max-67kwh | Design Pro Max 67.1 kWh | 482 km | 174 kW | €30,787 secondary-source reference, explicitly awaiting confirmation; low confidence, availability status unknown |

Do not present the Design reference as a confirmed official campaign. Its source
was updated 13 November 2026 and explicitly marks the price `a confirmar`.
The €26,285/€30,285 list prices and €24,445.48/€28,166.48 launch campaigns in the
6 October press release are historical evidence and are not inserted as current offers.

## Sources and decisions

- Portuguese product page, current offer, version equipment, range and charging:
  https://www.leapmotor.net/pt-pt/modelos/b05
- Campaign listing explicitly associating €25,000 with Life Pro 56.2 kWh:
  https://www.guiadoautomovel.pt/campanhas/passageiros
- Design reference and unconfirmed 60.8 kWh listing:
  https://eletricos.online/carros/leapmotor/b05/
- Portuguese launch announcement confirming Life Pro and Design Pro Max locally:
  https://www.media.stellantis.com/pt-pt/leapmotor/press/leapmotor-b05-chegou-a-portugal-um-novo-patamar-na-mobilidade-eletrica-desportiva
- Brochure linked by the Portuguese page, dimensions and AC charging:
  https://www.leapmotor.net/docs/default-source/b05-library/leapmotor_brochure_b05final_compressed.pdf?sfvrsn=ff4c56e9_1

Classify the model as a C-segment hatchback, consistent with the Portuguese launch
announcement, despite the product page's coupé marketing. Record RWD, five doors,
five seats, 11 kW AC, dimensions 4430 × 1880 × 1520 mm, 2735 mm wheelbase and
345/1400 L luggage space. Record the panoramic roof on Design only.

### Deliberately unknown

The advertised capacities are preserved in the version names. The official material
reviewed does not clearly distinguish gross from usable battery capacity, so neither
numeric schema field is guessed. Battery chemistry, voltage, real-world/motorway
range and real-world consumption are omitted. The brochure and page disagree on
consumption figures; none are converted into real-world consumption.

The advertised 16/18 minute charging times cover **30–80%**, not the schema's
**10–80%**. `charge10to80Min` is intentionally absent. Equipment not confidently
verified for the Portuguese trim is left unknown, rather than set to false.
Life Pro Max and the reported 60.8 kWh Life Pro remain excluded pending clearer
Portuguese availability/specification evidence. Paint choices are not separate versions.

## Images

Official product assets were downloaded, resized and encoded to WebP. No generated
car images or unrelated placeholders are used for these entries.

- Life: https://www.leapmotor.net/images/default-source/b05/starry_night__blue__left_side_view_-_life-117b4e78806fb45bfafc4f305b44029ab.png?sfvrsn=e24fa29c_37
- Design: https://www.leapmotor.net/images/default-source/b05/b05_design_yellow_enhanced_-_side-1.png?sfvrsn=826efa78_37

The final local paths are `public/cars/{vehicle-id}.webp`. Publish these assets
and the price-note UI before importing the records, so the live entries have their
images and offer qualifications immediately.

## Apply and verify

```sh
node scripts/apply-catalog-update.mjs data/catalog-updates/2026-11-22-leapmotor-b05.json
npm run catalog:apply-update -- data/catalog-updates/2026-11-22-leapmotor-b05.json --apply
npm run catalog:verify
```

Dry run validates every module before any writes. Applying preflights the whole
batch and uses the idempotent import mode: existing different records are refused,
identical records are left unchanged. Writes retain database revision history.
Verification now includes versioned additions alongside the original JSON migration.
Expected catalog after these additions: 66 model families and 84 vehicle versions.
