---
version: alpha
colors:
  background: "#FBF9F7"
  ink: "#14171D"
  secondary: "#4B525C"
  muted: "#626A75"
  primary: "#CD1421"
  action: "#C81926"
  actionHover: "#A50F1A"
  darkAccent: "#FF7466"
  darkBackground: "#0E1013"
  brandNavy: "#041D41"
  onNavy: "#F6F2EE"
  onNavyMuted: "#BAC5D6"
typography:
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
rounded:
  control: "2px"
omitted:
  - section: spacing
    reason: "Existing responsive Tailwind spacing remains canonical."
  - section: components
    reason: "Shared component behavior is described below; no generated component token system."
---

# WOY Consulting design context

## Overview

WOY is a practitioner-led leadership advisory for business leaders. The September 2026 introduction deck guides the identity: midnight navy, WOY red, measured compass geometry and warm paper reading surfaces. Use confident editorial headings and genuine practitioner portraits to communicate senior experience. This is a brand/content site with a short contact flow, not an admin application. The signatures are the assembling red WOY mark and an interactive four-stage compass; avoid generic dashboard cards, invented client claims and decorative photography presented as real engagements.

## Colors

Runtime ownership is Model B: `app/globals.css` owns tokens; its `@theme inline` block exposes Tailwind utilities. This file mirrors accepted intent and values. `--c-ink`, `--c-ink2`, `--c-ink3` map to primary, secondary and muted copy. Light muted text is #626A75; dark muted text is #99A1AC. White logo bands override text tokens to their light equivalents. `--c-red` is the brand/text role (#CD1421 light, #FF7466 dark). `--c-redb` is the readable accent on dark blocks (#FF7466). Solid actions use separate `--c-action` #C81926 and `--c-action-hover` #A50F1A with white text in both themes. `--c-danger` is #A50F1A light, #FF9A90 dark. Input outlines use `--c-control` #7A7068 light, #8993A1 dark. Animated artwork uses separate fixed `--c-logo-red` #CD1421 and `--c-logo-accent` #E83928 tokens in both themes, preserving the red logo independently of accessible text colors. These changes correct text contrast without recoloring the artwork. Fixed brand sections use `--c-navy` #041D41, `--c-on-navy` #F6F2EE and `--c-on-navy-muted` #BAC5D6 in both themes; these mirror the deck’s navy/red direction.

## Typography

Geist is self-hosted through next/font; display weight 400–500, headings 400–600, body 300–400, controls 500. Editorial About, Practitioners and 4D headings use weight 500 and a larger fluid scale. Keep the shared fluid display scale and readable line lengths (roughly 46–62ch). Allow long headings to wrap on narrow phones. Legal body text uses comfortable line height and explicit section headings.

## Layout

Shared `.shell`: width 100%, maximum 1320px, fluid horizontal padding clamp(1.25rem, 5vw, 4.5rem). Document owns vertical scroll; navigation is sticky at 72px. Mobile navigation can scroll in short landscape windows. Test 320, 375, 390, 414, 768, 1024, 1440 and 1920 CSS px, plus 200% reflow. Cookie choices use a nonmodal fixed banner with an end spacer and focus visibility protection.

## Elevation & Depth

Use flat reading surfaces and hairline separators. Reserve subtle shadows for interactive hover and the cookie overlay. Use flat midnight navy compositions for the philosophy and 4D method. Avoid decorative gradients and repeated boxed-card layouts; establish hierarchy with type, real images, space and rules.

## Shapes

Controls keep the existing 2px corner radius. The logo geometry in `components/mark-geometry.ts` remains authoritative for all brand assets.

## Components

Practitioner portraits come from the supplied deck, remain in their original colours and render at no more than 284 CSS pixels wide to respect the smallest source. Full biographies use native details/summary disclosures. The compact About page shows eight brands, with the full roster in a native disclosure and the source disclaimer always visible. The homepage 4D compass uses four semantic tabs, arrow/Home/End keyboard navigation, stable panel height, no autoplay and a visible link to the full approach page.

Primary CTA is consistently “Request a conversation” linking to `/contact`. Legal links, FAQs and cookie preferences are secondary. Contact inputs have client and server validation, explicit errors, stable busy button geometry and preserved values on failure. The footer contains Privacy policy, Terms & conditions, Cookie preferences and the linked “Made by AvlysAI” credit.

Theme is usable without storage; theme memory is optional and enabled only by consent. No analytics/advertising scripts are included. Initial content remains visible during hydration. Keep the existing assembling logo animation and marquee. Per the site owner’s instruction, there are no visible pause/resume animation controls. Reduced-motion preferences still disable nonessential motion; off-screen logo animation pauses automatically. Focus rings, scrollbars and control boundaries remain visible in both themes and forced-color mode.

## Do's and Don'ts

Keep the existing mark, brand tone, genuine partner names and anonymised case studies. Do not invent headshots, destinations, qualifications or client endorsements. Decorative stock photos have empty alt text; meaningful logos have brand-name alternatives. Do not store secrets in NEXT_PUBLIC variables, client storage, browser bundles or logs. Keep implementation details out of visitor-facing copy.
