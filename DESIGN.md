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
    fontFamily: "Georgia, Times New Roman, Times, serif"
  display:
    fontFamily: "Georgia, Times New Roman, Times, serif"
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

The owner’s expertise reference establishes an editorial serif direction across the whole website. Use the Georgia-based stack `Georgia, "Times New Roman", Times, serif` for headings, body, navigation, controls and captions; this is a visual approximation of the reference, not an assertion of its exact font. Runtime ownership remains in `app/globals.css`: `--font-editorial` is consumed by the body and exposed through both Tailwind `--font-sans` (the default compatibility alias) and `--font-serif`. System fonts avoid an external font request or font-loading layout shift. Georgia supplies real regular, bold and italic faces; use regular editorial headings, italic red emphasis and existing bold emphasis where needed. The shared display utilities use slightly looser tracking (-0.02em to -0.025em) and line heights of 1.08–1.15 to accommodate serif shapes. Keep the existing fluid type sizes and readable line lengths (roughly 46–62ch). Allow long headings to wrap on narrow phones. Legal body text uses comfortable line height and explicit section headings.

## Layout

Shared `.shell`: width 100%, maximum 1320px, fluid horizontal padding clamp(1.25rem, 5vw, 4.5rem). Document owns vertical scroll; navigation is sticky at 72px. Mobile navigation can scroll in short landscape windows. Test 320, 375, 390, 414, 768, 1024, 1440 and 1920 CSS px, plus 200% reflow. Cookie choices use a nonmodal fixed banner with an end spacer and focus visibility protection.

## Elevation & Depth

Use flat reading surfaces and hairline separators. Reserve subtle shadows for interactive hover and the cookie overlay. Use flat midnight navy compositions for the About-page philosophy and 4D method. The homepage philosophy uses the theme-aware raised reading surface. The Approach explorer permits subtle SVG shading only within its architectural planes to explain depth and stage selection. Avoid ornamental gradients elsewhere and repeated boxed-card layouts; establish hierarchy with type, real images, space and rules.

## Shapes

Controls keep the existing 2px corner radius. The logo geometry in `components/mark-geometry.ts` remains authoritative for shared brand assets. The hero animation has an owner-requested W/Y proportion adjustment in `LogoFormation.tsx`: their painted top and bottom align with the ring, while width and stroke weight stay consistent.

## Components

The homepage hero uses the plain light/dark background token with no photograph, overlay or logo halo. It introduces partner-led consulting since 2015 and retains italic red emphasis for “sustained performance.” The caption below the animation has two levels: “Win Over Yourself.” as a small heading, then the balanced line “Growth. Excellence. Agility.” in secondary ink. Its punctuation accent uses the accessible red text token. Website copy avoids em dashes.

Practitioner portraits come from the supplied deck and render at a base width no greater than 284 CSS pixels to respect the smallest source. Fine-pointer devices start in monochrome; profile hover or keyboard focus restores colour and scales the image by 1.045 inside its fixed frame. Touch and reduced-motion users see colour without needing hover; reduced motion disables zoom. Full biographies use native details/summary disclosures. Personal proof points use qualitative expertise: business leadership, HR and culture, and executive coaching. Replace headcounts, coaching-hour totals and years-of-experience claims with the relevant roles and contribution; retain verified employers, regions and credentials. The compact About page shows eight brands, with the full roster in a native disclosure and the source disclaimer always visible. The homepage 4D compass uses four semantic tabs, arrow/Home/End keyboard navigation, stable panel height, no autoplay and a visible link to the full approach page.

Navigation includes an explicit Home link and excludes Expertise on both desktop and mobile. The footer retains an Expertise link. Expertise is a homepage section at `/#expertise`, not a standalone page; legacy `/expertise` links permanently redirect to it. The homepage uses a two-column editorial expertise section: “Business ambition. Human possibility.” beside four native disclosures for strategy, leadership, organisation and people systems. The first opens initially; only one stays open at a time. Each contains a short description and three deliverables. Red italic emphasis, quiet dividers and a small rotating chevron provide hierarchy without decorative cards. The four visible areas own Service metadata, while all six saved capability anchors still open the relevant area. A single secondary link leads to case studies. Stack the introduction above the disclosures on phones and disable disclosure motion for reduced-motion preferences.

The homepage philosophy sits between the client marquee and 4D method. A large “Win Over Yourself.” heading and concise introduction lead to three open, ruled columns explaining the circle, five-point star and compass. Use the canonical philosophy copy from `lib/content.ts` and shared source-symbol geometry from `mark-geometry.ts`, so the static explanation and hero formation agree. Symbols use the theme-aware red token for contrast and remain decorative, with their meaning in accessible HTML. Shared grid rows keep the three desktop explanations aligned when headings wrap. The section renders fully on the server, has no looping animation or new client interaction, and stacks into three short rows on phones. “From philosophy to practice” links to the Approach page.

The Approach page extends the 4D system into four ascending architectural planes linked by one trajectory. Tabs illuminate the matching plane and show canonical stage content, three outputs and a concise outcome. Use navy, fixed red artwork and readable on-navy text; no autoplay, parallax or heavy animation libraries. Keyboard arrows/Home/End, previous/next controls, stable panels, inert inactive content, reduced motion and a complete no-JavaScript fallback preserve usability. Keep the ownership section concise.

The case-study index uses an editorial hero, a featured education brief beside a navy outcome panel, and open two-column engagement previews with a wider final story. Industry labels, clear challenge/outcome hierarchy and restrained link motion make all six cases browsable without filtering or new JavaScript. The former planning-horizons diagram and governance/culture/people workstream block are removed. Index styles are isolated from the case-detail styles. Detail pages separate the situation, WOY’s work and observed outcomes, with native section links. The homepage closes with a leadership section instead of a case-study teaser: a genuine owner-supplied Vipin portrait, navy HTML nameplate, italic red editorial heading, concise partnership copy and a ruled experience strip. The Business leadership credential and named organisations describe Vipin’s strategy, execution and P&L background. The photograph remains in colour and is framed with CSS to exclude the supplied baked-in caption; all identity text is accessible HTML. The section links to Practitioners and sits directly above the footer. On phones the headline precedes the portrait, copy and experience strip. Numbers only describe evidenced work, not invented performance metrics; avoid decorative client imagery, repeated floating cards and additional animation.

Primary CTA is consistently “Start a conversation” opening `mailto:hello@woyconsulting.com`, the email supplied by the site owner. The contact page remains accessible through the footer and includes the same direct email alongside the existing enquiry form. Email links do not configure form delivery. Legal links, FAQs and cookie preferences are secondary. Contact inputs have client and server validation, explicit errors, stable busy button geometry and preserved values on failure. The shared footer uses a compact navy editorial composition: “A clearer direction. Let’s begin.” with coral italic emphasis, a red conversation action and visible email, followed by company identity/address, two navigation columns and one grouped D&B credential. Remove orbital artwork and the separate registration strip. Three groups share the desktop row; tablet navigation and credentials stack beside the company identity, and phones use a single main column. A quiet lower rule separates legal links, attribution and back-to-top navigation. Keep the email address visible, group navigation into Explore and WOY Consulting, and retain Privacy policy, Terms & conditions, Cookie preferences and the linked “Made by AvlysAI” credit. Company name and location follow the owner-supplied footer reference. The compact D-U-N-S group shows the seal and the profile URL decoded from the owner-supplied QR. The verified number remains in canonical source data but is not rendered in the footer. “Show QR code” aligns directly below the profile link, close to the seal. Expanded QR content stays inside the group, retaining its 225px scan area when space allows. The original supplied seal/QR pixels are framed with CSS. Native details toggles the QR without JavaScript; retain its white quiet zone, visible profile link, and responsive scan size. Do not add claims of creditworthiness or endorsement. Separate page-bottom CTA sections are retired to avoid repeated invitations.

Theme is usable without storage; theme memory is optional and enabled only by consent. No analytics/advertising scripts are included. Initial content remains visible during hydration. The logo formation uses one 12-second timeline: a red circle, outlined five-point star and detailed compass rose reveal separately, converge, resolve into the WOY mark with balanced W/Y heights, hold and fade before resetting. Fine alignment guides and a single low-opacity ring emphasize convergence; the completed logo is clear of effects. All animated artwork stays red, and reduced motion displays the complete static lockup. Keep the existing marquee. Per the site owner’s instruction, there are no visible pause/resume animation controls. Reduced-motion preferences still disable nonessential motion; off-screen logo animation pauses automatically. Focus rings, scrollbars and control boundaries remain visible in both themes and forced-color mode.

## Do's and Don'ts

Keep the existing mark, brand tone, genuine partner names and anonymised case studies. Do not invent headshots, destinations, qualifications or client endorsements. Decorative stock photos have empty alt text; meaningful logos have brand-name alternatives. Do not store secrets in NEXT_PUBLIC variables, client storage, browser bundles or logs. Keep implementation details out of visitor-facing copy.
