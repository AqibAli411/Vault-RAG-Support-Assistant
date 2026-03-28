---
name: Vault Design System
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
  on-surface-variant: '#c2caad'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8c9479'
  outline-variant: '#434933'
  surface-tint: '#a0d800'
  primary: '#ffffff'
  on-primary: '#253600'
  primary-container: '#b7f700'
  on-primary-container: '#506e00'
  inverse-primary: '#4b6700'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#303030'
  tertiary-container: '#e4e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b7f700'
  primary-fixed-dim: '#a0d800'
  on-primary-fixed: '#141f00'
  on-primary-fixed-variant: '#374e00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  currency-display:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.03em
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
  container-padding: 24px
  gutter: 16px
---

## Brand & Style

This design system is built for a high-end, intelligent financial environment. It centers on an aesthetic of "Technical Sophistication," merging the precision of a high-tech laboratory with the exclusivity of a private banking suite. The brand personality is calm, authoritative, and instantaneous.

The UI employs a **Corporate Modern** foundation infused with **High-Contrast Minimalism**. By using a near-black canvas, we eliminate visual noise, allowing the AI's insights and the user's financial data to command full attention. The emotional response should be one of "effortless control"—where the complexity of global finance is distilled into a sleek, manageable interface.

## Colors

The palette is anchored by "Absolute Obsidian" to provide maximum contrast for the "Vibrant Lime" primary accent. This specific green is chosen for its high visibility and its association with growth and digital vitality. 

- **Primary Action:** Used exclusively for high-priority calls to action and critical status indicators.
- **Surface Hierarchy:** The background uses a deep charcoal to prevent eye strain. Elements closer to the user (cards, bubbles) use slightly lighter shades of charcoal to create a perceived Z-axis.
- **Accents:** Secondary colors are reserved for data visualization and status badges (confidence levels), utilizing glowing effects to stand out against the dark canvas.

## Typography

This design system utilizes a dual-font strategy to balance technical edge with readability. 

**Space Grotesk** is used for headlines and financial figures. Its geometric, slightly industrial character emphasizes the AI's precision and the "tech-first" nature of the product. **Manrope** serves as the primary typeface for body text and interactive labels, chosen for its exceptional legibility in dark mode and its professional, balanced tone.

Hierarchy is maintained through significant size differentials. Currency is always displayed with high prominence using the `currency-display` token to ensure immediate recognition of value.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for mobile-first interactions, centering content to maintain focus. A rigorous 8px rhythm (2 units) dictates the vertical flow, ensuring all components align to a predictable baseline.

- **Margins:** Standardized 24px (xl) side margins provide a "premium" sense of whitespace, preventing the UI from feeling cramped.
- **Stacking:** Chat-based interactions follow a focused single-column layout, while data-heavy screens utilize cards that span the full width of the safe area.
- **Padding:** Internal component padding is generous (minimum 16px) to accommodate high-touch interaction areas.

## Elevation & Depth

In this dark-mode environment, depth is communicated through **Tonal Layering** rather than traditional heavy shadows. 

1.  **Level 0 (Base):** The primary background (`#0F0F0F`).
2.  **Level 1 (Surface):** Message bubbles and cards (`#1A1A1A`). These use a subtle 1px border of `#262626` to define edges against the base.
3.  **Level 2 (Interaction):** Floating buttons or active states. These employ **Ambient Shadows** with a slight green tint (`rgba(189, 255, 0, 0.15)`) to create a "glowing" effect, suggesting the element is powered by the AI.

Backdrop blurs (20px-30px) are used behind fixed headers and navigation bars to maintain context while scrolling.

## Shapes

The shape language is defined by large, friendly radii that contrast with the "sharp" technical nature of the typography. 

- **Primary Corners:** 16px to 24px (rounded-lg to rounded-xl). This creates a "softened-tech" feel, making the interface feel approachable despite its high-contrast color scheme.
- **Message Bubbles:** Use 20px rounding on most corners, with a smaller 4px radius on the "tail" corner to indicate the speaker.
- **Buttons:** Fully pill-shaped (rounded-full) for primary actions to distinguish them clearly from informational cards.

## Components

### Message Bubbles
AI bubbles use a Level 1 surface color with a subtle green left-accent border. User bubbles are more discreet, utilizing a dark-grey ghost style with no fill to distinguish the human voice from the assistant's insights.

### Glowing Confidence Badges
Small, high-visibility chips used to indicate AI certainty. They feature a low-opacity background of the semantic color (green, amber, red) with a high-intensity 4px "outer glow" shadow of the same hue.

### Refined Document Cards
Used for file attachments or bank statements. These feature a Level 2 surface with a `label-bold` category tag at the top left and a high-contrast icon. The background of the card should be a subtle gradient from `#1A1A1A` to `#262626`.

### Inputs & Buttons
- **Primary Button:** Solid Vibrant Lime with black text. High-contrast and impossible to miss.
- **Secondary Action:** Ghost style with a 1.5px Lime border.
- **Input Fields:** Minimalist design with only a bottom-border in active states, or a fully enclosed Level 1 surface with 16px corner radius.

### Financial Graphs
Line charts should use a "Neon Path" style—a primary lime stroke with a semi-transparent gradient fill (fading to 0% opacity at the baseline).