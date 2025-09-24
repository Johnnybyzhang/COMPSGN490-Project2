# Style & Theming Guide

The dashboard's visual identity is controlled entirely via CSS custom properties and utility classes defined in `src/styles.css`. Use this guide to understand how colours, layout, and interactive states are composed so you can confidently retheme or extend the UI.

## Theme Tokens

The root scope defines all colour values and shadows used across components:

| Token | Dark Theme (default) | Purpose |
| --- | --- | --- |
| `--app-bg` | Radial gradient anchored top-right | Page background. |
| `--panel` | `rgba(17, 26, 46, 0.92)` | Background for large panels (`.panel`). |
| `--card` | `rgba(19, 30, 54, 0.92)` | Background for chart cards (`.card`). |
| `--border` | `#23345f` | Border colour for panels, cards, tables. |
| `--text` | `#e6eefc` | Primary text colour. |
| `--muted` | `#9bb0d1` | Secondary text (captions, labels). |
| `--grid` | `#1f2b47` | Chart grid lines. |
| `--accent` | `#22d3ee` | Primary accent (buttons, dataset lines). |
| `--accent-2` | `#7c3aed` | Secondary accent (surfaces, gradients). |
| `--ok` | `#10b981` | Positive states. |
| `--warn` | `#f59e0b` | Warnings. |
| `--danger` | `#ef4444` | Alerts. |
| `--shadow` | `0 28px 60px rgba(8, 14, 28, 0.45)` | Soft drop shadow for depth. |

The light theme overrides these tokens via the `:root[data-theme='light']` selector. When the React state changes `theme`, `<html data-theme="light">` is set automatically, causing the overrides to apply without additional JavaScript.

## Layout Structure

- `.app` – Flex container ensuring the footer stays pinned to the bottom.
- `.topbar` – Sticky header with blurred backdrop, brand section, and metadata pills. The live indicator inherits colour cues from the token set.
- `.content` – Centres content (`max-width: 1320px`) and applies consistent vertical spacing between panels and grids.
- `.primary-grid` – Responsive grid for the scenario context and KPI panels.
- `.cards-grid` – Multi-column grid for the remaining charts, map, timeline, and tables. Cards expand to full width on smaller screens.

Responsive breakpoints adjust padding, grid columns, and card heights at `960px` and `640px` to maintain readability on tablets and phones.

## Panels & Cards

- `.panel` – Used on the scenario overview and controls pages. Includes a subtle gradient overlay (`::after`) to add depth.
- `.card` – General-purpose container for charts with a radial highlight in the corner.
- `.card-wide` – Spans two grid columns for the toxin chart and watchlist. Media queries collapse it to single-column on narrow screens.
- `.map-card` / `.timeline-card` – Ensure the map and timeline take up available vertical space within the grid.

## Typography & Badges

- `.pill` classes display metadata (scenario, region, live status). Additional modifiers (`.danger`, `.warn`, `.live`) set context-specific colours.
- `.badge.ghost` – Small soft badge used above charts to indicate cadence.
- `.risk` modifiers (`.risk-high`, `.risk-medium`, `.risk-low`) communicate compliance levels inside the watchlist table.
- `.kpi-card` – Houses headline metrics with `.kpi-label`, `.kpi-value`, and `.kpi-sparkline` sub-elements. A gradient overlay ties the cards into the rest of the palette.

## Forms & Buttons

Form controls inside `.controls-grid` inherit the theme tokens to stay legible in both modes. Inputs are uppercase labelled for clarity. Buttons (`.btn`, `.btn.secondary`) use gradients and respond to hover with a slight elevation and accent glow.

## Map & Timeline Styling

- `.map` – Sets up the textured background (`--map-image`), gradient fill, and border. Light mode brightens both the gradient and background image.
- `.map-bubble` – Absolute-positioned elements sized by JavaScript. Colour gradients shift based on status (`calm`, `warning`, `critical`).
- `.timeline` – Scrollable column with custom scrollbars, while `.timeline-item` cards inherit accent gradients for each entry.

## Tables

`.data-table` styles the compliance watchlist: compact padding, uppercase headers, and row hover highlights. The `.empty` class provides centred, italicised copy when no rows match the selected region.

## Footer

`.footer` completes the layout with a subtle background and border. Light mode swaps the background for a translucent white and adds an upward shadow for separation.

## Customisation Workflow

1. Adjust colour tokens under `:root` and `:root[data-theme='light']` to introduce new brand colours.
2. Modify gradients or box shadows to change the depth aesthetic.
3. Extend utility classes (e.g., add `.risk-critical`) as needed—the React components use straightforward class names and will automatically pick up new styles.
4. For typography changes, update the Google Fonts import at the top of `styles.css` and adjust font sizes within the relevant classes.

Because all thematic decisions are centralised in CSS, no component code needs to change to experiment with new looks.
