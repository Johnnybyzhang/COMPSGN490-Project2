# Application Architecture

This document describes how the GOOS Dashboard React application is assembled. Use it as a companion while exploring `src/App.jsx` and related files.

## Bootstrapping

`src/main.jsx` mounts the root `<App />` component within a `BrowserRouter`, ensuring client-side routing for the dashboard and the presenter controls. Global styles from `styles.css` are imported here so they apply before any components render.

Chart.js elements required by the visualisations (line, bar, radar, doughnut) are registered at the top of `App.jsx` to keep bundle size lean while providing all chart types used throughout the dashboard.

## Top-Level State

`App.jsx` maintains all shared state via React hooks:

- `theme` – toggles between the `DARK_THEME` and `LIGHT_THEME` palettes, persists to `localStorage`, and synchronises via live updates.
- `filters` – includes `region`, `year`, and `scenario`. These drive data generation, chart selection, and textual labels.
- `variant` – a numeric seed passed into the random generator to refresh the mock dataset on demand.
- `liveState` plus ref helpers – track the status of the optional Server-Sent Events (SSE) connection.
- `eventSourceRef`, `retryTimeoutRef`, `skipBroadcastRef`, `hasHydratedRef` – mutable refs that manage SSE reconnection logic and prevent echoing incoming updates back to the server.

Two `useEffect` hooks orchestrate side effects:

1. Writing the selected `theme` to the `<html data-theme>` attribute and to `localStorage` for persistence.
2. Establishing an SSE connection to `/api/stream`, listening for `update` and `sync` events, and broadcasting local changes to `/api/controls` via `fetch` (unless the change originated remotely).

## Data Pipeline

All display metrics are computed at runtime. The pipeline follows three sequential steps whenever `filters`, `variant`, or `theme` change:

1. `generateDashboardData(filters, variant)` produces toxin indices, temperatures, fish biomass, reef conditions, desalination throughput, gas levels, occupancy, energy mix, a site watchlist, incidents, and map intensities.
2. `buildChartConfigs(data, palette)` converts those numbers into Chart.js datasets and options with colours drawn from the active palette.
3. `useMemo` caches both results to avoid recomputation unless dependencies change.

`regionLabel` and `scenarioMeta` are derived from static lookups to power UI copy, while `filteredWatchlist` applies an additional filter when a specific region is selected.

## Component Catalogue

Although everything lives inside one file, the code is organised into functional components for clarity:

- **`KpiCard`** – Displays a headline metric with an inline sparkline rendered via Chart.js line charts.
- **`MapPanel`** – Renders animated bubbles over the textured background map using CSS custom properties.
- **`Timeline`** – Lists recent incidents with severity pills.
- **`WatchlistTable`** – Tabular view of sites nearing compliance thresholds with risk badges.
- **`SimulationControlsPanel`** – Form inputs (selects, range slider, theme toggle, randomiser) used on the `/controls` route.
- **`ControlsPage`** – Wrapper around the controls panel plus presenter tips.
- **`DashboardView`** – The main analytics grid containing KPI cards, charts, watchlist, map, and timeline.

Each chart card uses the data produced by `buildChartConfigs`, ensuring colour tokens and axis styling stay in sync with the current theme.

## Routing and Layout

React Router maps `/`, `/controls`, and a wildcard route to either the dashboard or controls view. Layout is composed of three structural areas:

1. **Topbar** – Contains the project title, scenario metadata pills, and live feed indicator.
2. **Main content** – Renders either the dashboard grid or the controls page within a centred column.
3. **Footer** – Reiterates that the dataset is fictional and provides a fictitious copyright.

CSS custom properties defined in `styles.css` power both dark and light presentations. The `<html>` element receives a `data-theme` attribute so selectors can swap tokens without rerendering components.

## Live Collaboration

When the hosting environment implements the `/api/stream` SSE endpoint and the `/api/controls` POST endpoint, multiple viewers remain synchronised:

- Incoming SSE messages call `applyRemoteUpdate`, update state, and temporarily disable outbound broadcasts to avoid loops.
- Disconnections trigger exponential reconnection with a five-second delay.
- Local state changes issue background POST requests that servers can relay to other dashboard instances.

If SSE is unavailable (detected via feature check), the dashboard gracefully degrades by setting the live indicator to `unsupported` while retaining full local functionality.
