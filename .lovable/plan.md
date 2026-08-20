# Treatment FAQs (SEO) + staff editing

Add a per-treatment FAQ section to each treatment page, placed just above "Other treatments you may like", with proper SEO markup, and let staff manage those FAQs from Admin → Treatments.

## Public treatment page

- New "Frequently asked questions" section directly above the related treatments block.
- Accordion layout matching the site theme (deep green / gold), questions as headings so they're crawlable — answers stay in the DOM for search engines even when visually collapsed.
- Only renders when that treatment has FAQs; nothing changes for treatments without any.

## SEO

- Add a second JSON-LD block on the treatment page with an `FAQPage` schema (each question/answer as `Question` + `acceptedAnswer`), alongside the existing `Service` schema.
- Only emitted when the treatment has at least one FAQ, so no empty/invalid structured data.
- Semantic headings and plain-text answers so Google can surface FAQ rich results.

## Staff editing (Admin → Treatments)

- New "FAQs" block inside the treatment editor dialog, styled like the existing before/after and pricing editors.
- "+ Add FAQ" button, per-row question input, answer textarea, and a delete (trash) button per row.
- Drag-free simple ordering: FAQs save in the order listed; empty rows are dropped on save.
- Saved with the rest of the treatment — changes appear on the public page immediately.

## Technical details

- Migration: add `faqs jsonb not null default '[]'` to `public.treatments` (shape: `[{ question, answer }]`). No new table, matching how `price_options` and `before_after` already work.
- `src/lib/content/queries.ts`: map the new column into the `Treatment` type as `faqs`.
- `src/routes/treatments.$slug.tsx`: render the FAQ accordion above the related section and extend `head().scripts` with the conditional `FAQPage` JSON-LD.
- `src/routes/admin.treatments.tsx`: add `faqs` to the row type, defaults, load mapping, and save payload sanitisation; add the editor UI block.
