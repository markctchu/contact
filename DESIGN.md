# Design System Specification: Editorial Play

## 1. Overview & Creative North Star: "The Human Lexicon"
This design system rejects the clinical coldness of standard mobile gaming interfaces in favor of "The Human Lexicon"—a Creative North Star that treats the UI as a living, breathing sketchbook. It is an editorial-first approach where the words are the hero, supported by intentional asymmetry and organic geometry. 

We break the "template" look by ignoring rigid, boxed-in grids. Instead, we use expansive breathing room (whitespace) and "floating" elements that feel as though they were placed by hand onto a premium paper surface. The goal is a high-end, bespoke digital experience that feels light, airy, and intellectually playful.

---

## 2. Color & Surface Philosophy
The palette is built on a foundation of sophisticated neutrals punctuated by "Electric Energy" accents. 

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning content. Boundaries must be defined solely through background color shifts. 
- To separate a header from a body, transition from `surface` (#f7f6f1) to `surface-container-low` (#f1f1ec). 
- Lines create visual "noise" that traps the eye; color blocks allow the words to flow.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine paper sheets. 
- **Base Layer:** `surface` (#f7f6f1)
- **Secondary Content:** `surface-container` (#e9e8e3)
- **Floating Cards:** `surface-container-lowest` (#ffffff) to create a subtle "lift" against the off-white background.

### Signature Textures & Gradients
Avoid flat "pop" colors for primary actions. To provide professional polish, use a subtle linear gradient for main CTAs: 
- **Primary CTA:** Transition from `primary` (#695b00) to `primary_container` (#fadd30) at a 135-degree angle. This gives the "vibrant yellow" a tactile, sun-drenched depth.
- **Glassmorphism:** For overlays or floating navigation, use `surface_container_low` at 80% opacity with a `20px` backdrop-blur.

---

## 3. Typography: The Editorial Voice
Typography is the primary mechanic of this design system. We use a high-contrast scale to create an authoritative yet quirky hierarchy.

*   **Display & Headlines (Plus Jakarta Sans):** Our "Quirky" anchor. The rounded terminals of Plus Jakarta Sans provide a friendly, human touch. Use `display-lg` (3.5rem) for game wins or major milestones to create "Big Type" moments that feel like a magazine cover.
*   **Body & Utility (Work Sans):** Our "Functional" anchor. Work Sans provides exceptional legibility at small sizes. Use `body-lg` (1rem) for game text to ensure the focus remains on the words being played.
*   **The Weight Contrast:** Always pair a `bold` Headline with a `regular` Body. Avoid "medium" weights; the goal is clear, intentional contrast.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often too heavy for a "light and airy" feel. We achieve depth through the **Layering Principle**.

*   **Ambient Shadows:** If an element must float (like a modal), use a shadow with a 32px blur, 0px offset, and 6% opacity using the `on_surface` (#2e2f2c) color. It should look like a soft glow, not a dark cast.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-contrast modes), use the `outline_variant` (#adada9) at 15% opacity. Never use 100% opaque borders.
*   **Organic Rounding:** Use the `xl` (1.5rem) or `full` (9999px) roundedness for buttons and active states to maintain the "playful" hand-drawn aesthetic. Standard `md` (0.75rem) should be used for game tiles.

---

## 5. Components & Interface Primitives

### Buttons (The "Pill" Aesthetic)
*   **Primary:** `primary_container` background, `on_primary_container` text. Shape: `full`. No border.
*   **Secondary:** `secondary_container` background. Shape: `full`. 
*   **State Change:** On hover/active, shift the background to its `_dim` variant (e.g., `primary_dim`).

### Game Tiles (The "Letter" Component)
*   **Structure:** Use `surface_container_lowest` (#ffffff). Shape: `md`. 
*   **Interaction:** Upon selection, transition background to `tertiary_fixed` (#96adff) to provide the "Electric Blue" pop.
*   **Spacing:** Use `spacing.3` (1rem) between tiles to allow the "off-white" background to breathe through.

### Inputs & Search
*   **Style:** Minimalist. No bottom line or box. Use a `surface_container` background with `xl` rounding. 
*   **Focus:** Transition background to `surface_container_high` and add a `2px` "Ghost Border" using `tertiary`.

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Separation:** Use `spacing.6` (2rem) of vertical whitespace or a subtle shift from `surface` to `surface_container_low`. 
*   **Organic Touch:** Icons within lists should have a slightly "imperfect" stroke weight (e.g., 1.5px or 2.5px) to mimic a hand-drawn feel.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. A headline might be left-aligned while the body text is slightly indented to the right.
*   **Do** lean into the "Big Type" aesthetic. If there is a "Word of the Day," make it `display-lg`.
*   **Do** use the `tertiary` (#004ddc) color sparingly for "Success" or "Action" moments to keep its impact high.

### Don’t:
*   **Don’t** use pure black (#000000). Always use `on_background` (#2e2f2c) for text to maintain the sophisticated, editorial feel.
*   **Don’t** use the `DEFAULT` (0.5rem) roundedness for major components; it feels too "Standard UI." Go `xl` or `none` for a more intentional look.
*   **Don’t** crowd the screen. If a screen feels "full," increase the `surface` area. This game is about the clarity of thought.