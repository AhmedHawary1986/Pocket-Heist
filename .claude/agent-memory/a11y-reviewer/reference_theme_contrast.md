---
name: theme-contrast-ratios
description: Verified WCAG contrast ratios for pocket-heist theme accent colors on card/page backgrounds
metadata:
  type: reference
---

Computed WCAG 2.x contrast ratios for this project's theme tokens. Card surface is `lighter` #101828; page bg is `dark` #030712. All values clear the 4.5:1 AA normal-text threshold — do NOT flag these accent-on-card pairings as contrast failures.

On `lighter` #101828 (card/row surface):
- secondary #FB64B6: 6.42:1
- primary #C27AFF: 6.36:1
- body #99A1AF: 6.82:1
- success #05DF72: 9.98:1
- error #FF6467: 6.14:1

StatusBadge text over its own `color-mix(in srgb, color 15%, transparent)` tint over `lighter`:
- success text on #0e3633: 7.40:1
- failure text on #342331: 5.08:1 (lowest in the design, still passes AA)

On `dark` #030712:
- body #99A1AF: 7.74:1

**How to apply:** When reviewing these components, contrast is already a Win, not an issue. Recompute only if a new color/background pairing appears (e.g., accent on `dark` directly, or a lighter surface).
