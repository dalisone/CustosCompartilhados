---
name: Shared Finance Design System
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d3c1d5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#9b8c9e'
  outline-variant: '#4f4253'
  surface-tint: '#eab2ff'
  primary: '#eab2ff'
  on-primary: '#510072'
  primary-container: '#8a05be'
  on-primary-container: '#edb9ff'
  inverse-primary: '#941cc7'
  secondary: '#4ae183'
  on-secondary: '#003919'
  secondary-container: '#06bb63'
  on-secondary-container: '#00431f'
  tertiary: '#ffb4a9'
  on-tertiary: '#690001'
  tertiary-container: '#a81e15'
  on-tertiary-container: '#ffbbb1'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f7d8ff'
  primary-fixed-dim: '#eab2ff'
  on-primary-fixed: '#320047'
  on-primary-fixed-variant: '#7400a0'
  secondary-fixed: '#6bfe9c'
  secondary-fixed-dim: '#4ae183'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4a9'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#910807'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  stats-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1200px
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style

This design system is engineered for the modern couple navigating financial intimacy. It balances the high-stakes nature of finance with the collaborative, fluid nature of shared lives. The aesthetic is "Technical Elegance"—merging the precision of developer tools with the premium feel of boutique fintech.

The style is primarily **Minimalist** with **Glassmorphism** used as a functional layer for depth. It leverages a "Dark Mode First" philosophy, using deep charcoal surfaces to reduce visual noise and allow financial data to take center stage. Drawing inspiration from the structural integrity of Linear and the rhythmic clarity of Notion, the system utilizes a sophisticated grid and crisp, 1px borders to define spaces rather than heavy shadows. The emotional response should be one of calm, control, and mutual transparency.

## Colors

The palette is rooted in a deep charcoal base (#0B0B0B) to provide a premium, low-glare environment. 

- **Primary Purple (#8A05BE):** Used sparingly for primary actions, progress indicators, and "Shared" status markers. It represents the "joint" aspect of the app.
- **Semantic Green & Red:** Income (#2ECC71) and Expenses (#E74C3C) use slightly desaturated tones to ensure they remain legible against dark backgrounds without causing eye strain.
- **Grays:** A scale of neutral grays is used to create a hierarchy of information. Borders are strictly defined by low-opacity whites to create a "notched" or "etched" look similar to high-end hardware interfaces.

## Typography

This design system uses a tri-font strategy to maximize clarity and technical sophistication:

1.  **Hanken Grotesk (Headlines):** A sharp, contemporary sans-serif that gives the app a modern, tech-forward edge. 
2.  **Inter (Body & Stats):** The workhorse for financial data, chosen for its exceptional legibility and neutral character.
3.  **JetBrains Mono (Labels/Metadata):** Used for small data points, transaction timestamps, and currency codes to evoke a sense of precision and "ledger-style" accuracy.

Large display sizes should use tighter letter spacing to maintain a "premium" feel. Financial figures should always use tabular lining (tnum) to ensure numbers align vertically in lists.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** model. On desktop and tablet, content is constrained to a 12-column grid to maintain readability. On mobile, a single-column fluid layout is used with generous 20px side margins.

The spacing rhythm is based on a 4px baseline grid. 
- **Containers:** Use 16px (md) or 24px (lg) padding to group related financial items.
- **Information Density:** Lists (like transaction histories) should use a compact 12px vertical spacing to maximize data visibility, while dashboard sections use 40px (xl) to breathe.
- **Grids:** Use subtle 1px borders (#FFFFFF at 8% opacity) instead of wide gutters to separate content, creating the "Notion-like" structured feel.

## Elevation & Depth

Depth in this design system is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional drop shadows.

1.  **The Base:** The background is #0B0B0B.
2.  **The Surface:** Cards and containers use a slightly lighter gray (#161616).
3.  **Glass Layers:** Modals, navigation bars, and floating action buttons use a semi-transparent background (70% opacity of the surface color) with a 20px background blur (backdrop-filter).
4.  **Stroke Elevation:** Instead of a shadow, an "Inner Glow" or "Top Border" is used for elevated elements. A 1px border at the top of a card with 15% white opacity mimics a light source hitting an edge.

## Shapes

The shape language is **Soft (0.25rem)**. This design system avoids hyper-rounded "bubble" aesthetics to maintain a professional, serious tone. 

- **Primary Elements:** Buttons and Input fields use a 4px (0.25rem) radius.
- **Containers:** Larger cards or dashboard modules use 8px (0.5rem) to provide a clear but subtle distinction from the background.
- **Selection States:** Active tabs or pills use a slightly higher radius (rounded-lg) to make them feel distinct from the structural grid.

## Components

**Buttons**
- **Primary:** Solid Vibrant Purple (#8A05BE) with white text. No gradient.
- **Secondary:** Transparent background with a 1px border (#FFFFFF at 15%). 
- **Ghost:** No border or background, purple text for "low-priority" actions.

**Input Fields**
- Background: #161616.
- Border: 1px solid #FFFFFF (8% opacity).
- Focus State: Border changes to Purple (#8A05BE) with a subtle 2px outer glow of the same color.

**Cards**
- Cards are the primary container. They must have a 1px border (Subtle) and no shadow. 
- "Shared" cards can feature a 2px top-border in Purple to signify joint ownership.

**Chips & Tags**
- Use JetBrains Mono for text.
- Backgrounds should be low-opacity versions of the semantic colors (e.g., Green at 10% opacity for "Income").

**Transaction Lists**
- Use a "clean row" style. Left-aligned title (Inter Bold), subtitle (Inter Muted), and right-aligned amount (Inter Medium). 
- Use the semantic Green/Red for the amount text.

**Progress Bars (Budgets)**
- Track: #222222.
- Fill: A subtle linear gradient from #8A05BE to a lighter nuance of purple.