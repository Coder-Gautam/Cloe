# SENIOR DEVELOPER CODING CONSTRAINTS

## CSS Rules
- Use CSS Variables (:root) for typography, colors, and spacing tokens from Figma.
- No inline styles. No `!important` unless strictly unavoidable for third-party overrides.
- Use Modern CSS: CSS Grid, Flexbox, `clamp()` for fluid typography and spacing.
- Zero border-radius on buttons: All buttons across the site must have `border-radius: 0;` (sharp rectangular corners matching Figma).

## JavaScript & GSAP Rules
- Vanilla ES6+ only (no jQuery, no bulky helper libraries).
- GSAP Context & Scoping: Wrap animations inside `gsap.context()` for clean scoping and garbage collection.
- ScrollTrigger pins must explicitly specify `pinSpacing: true/false` and trigger markers cleanup.
- Never attach direct raw `window.addEventListener('scroll')` — use ScrollTrigger or `requestAnimationFrame`.