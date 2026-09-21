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

Use flat reading surfaces and hairline separators. Reserve subtle shadows for interactive hover and the cookie overlay. Use flat midnight navy compositions for the philosophy and 4D method. The Approach explorer permits subtle SVG shading only within its architectural planes to explain depth and stage selection. Avoid ornamental gradients elsewhere and repeated boxed-card layouts; establish hierarchy with type, real images, space and rules.

## Shapes

Controls keep the existing 2px corner radius. The logo geometry in `components/mark-geometry.ts` remains authoritative for all brand assets.

## Components

The homepage hero uses a generated architectural terrace and distant business horizon as a decorative, full-width background. It suggests direction and progress without depicting an actual WOY office or client engagement. One 83.7 KB local WebP is shared by both themes through responsive Next Image delivery. Warm translucent overlays protect dark copy in light mode; navy overlays protect light copy in dark mode. Cropping changes for the stacked mobile layout. The hero introduces partner-led consulting since 2015 and uses italic red emphasis for “sustained performance.” through the existing theme-aware text accent token. Website copy avoids em dashes. Keep the photo visible at the edges and horizon, preserve the red animated logo, avoid parallax, and retain a readable solid fallback when the image fails or forced colors are active.

Practitioner portraits come from the supplied deck and render at a base width no greater than 284 CSS pixels to respect the smallest source. Fine-pointer devices start in monochrome; profile hover or keyboard focus restores colour and scales the image by 1.045 inside its fixed frame. Touch and reduced-motion users see colour without needing hover; reduced motion disables zoom. Full biographies use native details/summary disclosures. The compact About page shows eight brands, with the full roster in a native disclosure and the source disclaimer always visible. The homepage 4D compass uses four semantic tabs, arrow/Home/End keyboard navigation, stable panel height, no autoplay and a visible link to the full approach page.

Navigation includes an explicit Home link and excludes Expertise on both desktop and mobile. The footer retains an Expertise link. Expertise is a homepage section at `/#expertise`, not a standalone page; legacy `/expertise` links permanently redirect to it. Three outcome columns expose six native capability disclosures, with one open at a time. Capability anchors open their corresponding disclosure on direct/hash navigation. The initial view remains concise; detailed lists are available on demand.

The Approach page extends the 4D system into four ascending architectural planes linked by one trajectory. Tabs illuminate the matching plane and show canonical stage content, three outputs and a concise outcome. Use navy, fixed red artwork and readable on-navy text; no autoplay, parallax or heavy animation libraries. Keyboard arrows/Home/End, previous/next controls, stable panels, inert inactive content, reduced motion and a complete no-JavaScript fallback preserve usability. Keep the ownership section concise.

Case studies use a featured engagement with its real planning horizons, followed by industry/outcome rows. Detail pages separate the situation, WOY’s work and observed outcomes, with native section links. The homepage teaser follows this same hierarchy. Numbers only describe evidenced work, not invented performance metrics; avoid decorative client imagery, repeated floating cards and additional animation.

Primary CTA is consistently “Start a conversation” opening `mailto:hello@woyconsulting.com`, the email supplied by the site owner. The contact page remains accessible through the footer and includes the same direct email alongside the existing enquiry form. Email links do not configure form delivery. Legal links, FAQs and cookie preferences are secondary. Contact inputs have client and server validation, explicit errors, stable busy button geometry and preserved values on failure. The shared footer combines the closing conversation prompt and site directory in one navy composition. Large Geist typography, the exact WOY compass glyph within fine orbital lines, fixed red accents and brief hover/focus motion create the futuristic signature. The compass treatment is decorative and does not autoplay; reduced motion removes movement. Keep the email address visible, group navigation into Explore and WOY Consulting, and retain Privacy policy, Terms & conditions, Cookie preferences and the linked “Made by AvlysAI” credit. Company name and location follow the owner-supplied footer reference; do not fabricate a D-U-N-S badge or profile destination. Separate page-bottom CTA sections are retired to avoid repeated invitations.

Theme is usable without storage; theme memory is optional and enabled only by consent. No analytics/advertising scripts are included. Initial content remains visible during hydration. The logo formation uses one 12-second timeline: a red circle, outlined five-point star and detailed compass rose reveal separately, converge, resolve into the exact existing WOY mark, hold and fade before resetting. Fine alignment guides and a single low-opacity ring emphasize convergence; the completed logo is clear of effects. All animated artwork stays red, and reduced motion displays the complete static lockup. Keep the existing marquee. Per the site owner’s instruction, there are no visible pause/resume animation controls. Reduced-motion preferences still disable nonessential motion; off-screen logo animation pauses automatically. Focus rings, scrollbars and control boundaries remain visible in both themes and forced-color mode.

## Do's and Don'ts

Keep the existing mark, brand tone, genuine partner names and anonymised case studies. Do not invent headshots, destinations, qualifications or client endorsements. Decorative stock photos have empty alt text; meaningful logos have brand-name alternatives. Do not store secrets in NEXT_PUBLIC variables, client storage, browser bundles or logs. Keep implementation details out of visitor-facing copy.
