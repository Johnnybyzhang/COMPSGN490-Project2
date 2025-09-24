# Global Ocean Observing System Mock Dashboard

> **Project status:** This repository is now archived and kept in read-only mode. The installation and verification steps
> below remain accurate, and the dashboard was last validated with Node.js 20 by running `npm run build` and `npm run lint`
> prior to archiving.

The **GOOS Dashboard** is a Vite-powered React application that visualises a fictional environmental monitoring feed for underwater settlement scenarios. It was originally built for a mock trial exercise where students examine impacts of industrial activity on marine ecosystems. All figures are procedurally generated to create a convincing narrative while remaining safe for classroom use.

The goal of this repository is to supply everything you need to run, present, and extend the dashboard experience. This documentation covers project layout, data generation, live collaboration features, and guidance for adapting the visuals to your own story.

## Features at a Glance

- 📊 **Comprehensive analytics** – Ten chart-based exhibits (line, bar, radar, and doughnut) summarise toxin trends, water usage, biomass, reef health, energy mix, and more.
- 🌍 **Scenario switching** – Toggle between Baseline, Mitigation, and Rapid Expansion narratives to explore divergent futures.
- 🎚️ **Presenter controls** – A `/controls` route exposes a remote control surface with shared state broadcasting for live demos.
- 🌓 **Dynamic theming** – Dark/light themes are persisted locally and sync across participants.
- 🔄 **Procedural data** – Deterministic pseudo-random generation keeps the story consistent while allowing variance with a "Randomize Mock Data" button.

## Repository Layout

```
COMPSGN490-Project2/
├── README.md                # You are here!
├── docs/                    # Additional in-depth documentation
└── mock_dashboard/          # Vite project root
    ├── index.html
    ├── package.json
    ├── src/
    │   ├── App.jsx          # All application logic and React components
    │   ├── main.jsx         # React entry point
    │   ├── styles.css       # Theme tokens and layout rules
    │   └── assets/
    │       └── risk-map.png # Background texture for the risk map
    └── vite.config.js
```

Each topic receives deeper treatment inside the [`docs/`](docs) directory:

- [`architecture.md`](docs/architecture.md) explains component composition, routing, and state management.
- [`data-scenarios.md`](docs/data-scenarios.md) documents how synthetic metrics are produced and scaled.
- [`presenter-mode.md`](docs/presenter-mode.md) outlines how to share control between multiple viewers.
- [`style-guide.md`](docs/style-guide.md) highlights CSS tokens and how to retheme the experience.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **18.x or 20.x** (Vite 5 requires an actively supported LTS release).
- npm (bundled with Node). Yarn and pnpm work as well if you adapt the commands.

### Install dependencies

```bash
cd mock_dashboard
npm install
```

### Run the development server

```bash
npm run dev
```

Vite prints a local URL (for example `http://localhost:5173/`). Open it in your browser to explore the dashboard. Hot Module Replacement keeps the view in sync with any code or style edits.

### Build for production

```bash
npm run build
```

The command outputs a fully static bundle in `mock_dashboard/dist`. Use `npm run preview` to verify the production build locally.

### Lint the project

```bash
npm run lint
```

ESLint checks JSX and hook usage. Address any warnings before committing classroom modifications.

## Application Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Launches Vite dev server with hot reloading. |
| `npm run build` | Creates an optimized production bundle. |
| `npm run preview` | Serves the production build locally for verification. |
| `npm run lint` | Runs ESLint with the React, Hooks, and Refresh plugins. |

## High-Level Architecture

At runtime, `src/main.jsx` mounts the `<App />` component inside a React Router `<BrowserRouter>`. The application exposes two routes:

- `/` renders the primary dashboard view with charts, watchlists, and an incident timeline.
- `/controls` renders a presenter console that manipulates the same application state (region, year, scenario, theme, and random seed).

The central `App.jsx` file contains:

- Scenario definitions, baseline datasets, and helper utilities for deterministic randomisation.
- `generateDashboardData` – builds all derived metrics (toxins, temperatures, biomass, reef health, etc.) based on the current filters.
- `buildChartConfigs` – prepares Chart.js configuration objects for each visualisation.
- React components for KPI cards, map overlays, watchlists, and charts.
- Live collaboration hooks that optionally subscribe to `/api/stream` (Server-Sent Events) and broadcast state changes to `/api/controls`.

Review [`docs/architecture.md`](docs/architecture.md) for a component-by-component breakdown.

## Data Generation Overview

All dashboard numbers are fictitious but coherent. A seeded pseudo-random generator (`mulberry32`) allows the same filters to produce stable outputs, while reseeding through the "Randomize Mock Data" button yields plausible variants. `generateDashboardData` derives values for toxins, temperatures, fish biomass, reef health, desalination usage, atmospheric gases, occupancy, energy mix, and a watchlist of at-risk sites.

Scenarios influence data through multiplicative and additive factors, enabling consistent storytelling:

- **Baseline** keeps metrics close to the seed data.
- **Mitigation** rewards sustainable policies (higher fish biomass, healthier reefs, lower toxins).
- **Rapid Expansion** stresses the system (elevated toxins, higher CO₂, heavier desalination draw).

The [data reference](docs/data-scenarios.md) documents each field and how the modifiers are applied.

## Presenter Workflow

The dashboard is designed for collaborative presentations:

1. Open the main dashboard in a classroom display (route `/`).
2. On a secondary device, navigate to `/controls` to adjust scenario settings.
3. When the hosting environment implements the optional `/api/stream` and `/api/controls` endpoints, changes sync live via Server-Sent Events and `fetch` updates. Otherwise, the controls still work locally without remote broadcast.

Detailed presenter tips and recommended setups live in [`docs/presenter-mode.md`](docs/presenter-mode.md).

## Customisation Tips

- **Theming** – Toggle between dark/light modes or edit the CSS custom properties in `styles.css`. The [style guide](docs/style-guide.md) explains the available tokens.
- **Charts** – Update labels, tooltips, or Chart.js options inside `buildChartConfigs`.
- **Narrative** – Modify `SCENARIO_INFO`, `WATCHLIST_BASE`, or the static copy blocks to match your storyline.
- **Assets** – Replace `risk-map.png` with your own background to change the look of the risk heatmap.

## Contributing

Issues and pull requests are welcome for documentation, visual polish, or data tweaks. Please run `npm run lint` before submitting changes.

## License

This project is released for educational purposes. Adapt freely for classroom demos and cite the original assignment where appropriate.
