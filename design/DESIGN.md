---
name: Urban Harmony
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#464555'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#5a5f62'
  on-secondary: '#ffffff'
  secondary-container: '#dce0e4'
  on-secondary-container: '#5e6367'
  tertiary: '#8b1b34'
  on-tertiary: '#ffffff'
  tertiary-container: '#ab354b'
  on-tertiary-container: '#ffd0d3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dfe3e7'
  secondary-fixed-dim: '#c3c7cb'
  on-secondary-fixed: '#171c1f'
  on-secondary-fixed-variant: '#43474b'
  tertiary-fixed: '#ffdadc'
  tertiary-fixed-dim: '#ffb2b9'
  on-tertiary-fixed: '#400010'
  on-tertiary-fixed-variant: '#891933'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is centered on the concept of "Domestic Serenity." It caters to students navigating the high-pressure housing market in Israel, aiming to reduce anxiety through a UI that feels organized, spacious, and supportive. 

The aesthetic is **Modern Minimalism** infused with a **Tactile** warmth. By leveraging generous whitespace, we create a sense of breathing room. The interface avoids aggressive marketing tactics, instead utilizing soft transitions and a structured layout to build long-term trust. The emotional response should be one of "finding home"—a feeling that is welcoming, reliable, and effortlessly contemporary.

## Colors

The palette is designed to balance authority with energy. 

- **Primary (Indigo):** Used for structural brand elements, active states, and navigation icons. It provides the "professional" anchor.
- **Accent (Coral):** Reserved strictly for primary Call-to-Action (CTA) moments and critical interactive elements to ensure high conversion and visibility.
- **Secondary (Pastel Mix):** A range of soft, desaturated hues derived from the primary and accent colors (e.g., Indigo-50, Coral-50, Emerald-50) used exclusively for tag backgrounds and filter chips.
- **Surface & Text:** A warm off-white background (#FAFAF9) prevents eye strain, while Dark Slate (#1E293B) ensures WCAG AA compliance for all body text.

## Typography

This design system utilizes **Geist** for its technical precision and modern humanist feel, which resonates well with a tech-savvy student demographic.

- **Headlines:** Use Bold and Semi-Bold weights with slight negative letter spacing to create a compact, editorial look.
- **Body:** Standardized at 16px for optimal legibility. Use "Regular" for long-form content and "Medium" for emphasis within paragraphs.
- **Localization Note:** As the product serves the Israeli market, ensure line-heights are generous (1.5x minimum) to accommodate Hebrew characters comfortably without clipping.

## Layout & Spacing

The layout follows a **Fluid Grid** model with high-margin "safe zones" to emphasize the airy brand personality.

- **Desktop:** 12-column grid, 24px gutters, and 80px side margins.
- **Tablet:** 8-column grid, 16px gutters, 40px side margins.
- **Mobile:** 4-column grid, 16px gutters, 20px side margins.

Use the `2xl` (64px) spacing for vertical section padding to maintain the "generous whitespace" requirement. Elements should prioritize grouping through proximity, using whitespace rather than dividers wherever possible.

## Elevation & Depth

Visual hierarchy is achieved through **Ambient Shadows** and **Tonal Layering**. 

- **Level 0 (Base):** Warm off-white (#FAFAF9).
- **Level 1 (Cards):** Pure White (#FFFFFF) with a very soft, diffused shadow: `0 4px 20px -2px rgba(30, 41, 59, 0.05)`.
- **Level 2 (Hover/Floating):** Increased shadow spread: `0 10px 30px -4px rgba(30, 41, 59, 0.08)`.

Avoid heavy inner shadows or sharp drops. The goal is to make elements appear as if they are resting gently on a soft surface rather than floating high above it.

## Shapes

The shape language is defined by the **2xl radius (16px / 1rem)**. This generous rounding is applied to all primary container elements (Cards, Input Fields, Modals). 

- **Pills:** Interactive tags and the language toggle use a full "pill" radius (999px) to distinguish them from structural containers.
- **Buttons:** Follow the 1rem radius to maintain consistency with the card language, creating a unified, friendly geometry across the entire interface.

## Components

### Header
A sticky top bar using a Level 1 elevation (white background + soft shadow). 
- **Language Toggle:** A pill-shaped component. The active state should use a Soft Indigo background with Indigo text.
- **Nav Links:** Dark Slate text, Medium weight, transitioning to Indigo on hover with a subtle 2px bottom bar.

### Cards
All apartment and roommate listings are contained in `rounded-2xl` cards. 
- **Image:** Top-cropped with a 1rem top-radius.
- **Content:** Generous 24px internal padding.

### Pills & Tags
Used for amenities (e.g., "Wifi," "Balcony"). 
- **Styling:** Soft pastel backgrounds (Indigo-50, Emerald-50) with matching darkened text. No borders.

### Buttons
- **Primary (CTA):** Coral (#FB7185) with White text. High-contrast, 1rem radius.
- **Secondary:** White background with Indigo border and text.

### Floating AI Assistant
A circular button fixed to the bottom-right. Use the Primary Indigo color with a Level 2 shadow. On hover, it should expand slightly to reveal a "Need help?" label.

### Inputs
Large touch targets (48px height minimum) with 1rem rounded corners and a soft 1px Slate-200 border. Focused state uses an Indigo 2px ring.