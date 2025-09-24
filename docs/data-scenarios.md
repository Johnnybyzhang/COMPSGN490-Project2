# Data & Scenario Reference

All analytics in the GOOS Dashboard are derived from `generateDashboardData(filters, variant)` within `src/App.jsx`. The function combines a deterministic pseudo-random generator, baseline constants, and scenario multipliers to produce convincing yet entirely fictional metrics. This reference explains what each dataset represents and how filters influence the outputs.

## Deterministic Randomisation

- `mulberry32(seed)` produces a repeatable stream of floating-point numbers in the range `[0, 1)`.
- The seed blends the selected year, the `variant` value, and the ASCII code of the scenario string. As a result, identical filter combinations reproduce the same figures even after browser refreshes.
- The "Randomize Mock Data" button simply updates `variant` to `Date.now()`, forcing a new seed and therefore a fresh data realisation.

## Filters & Scenarios

Three filter groups shape the dataset:

| Filter | Purpose | Impact |
| --- | --- | --- |
| `region` | Used for watchlist filtering and labelling. | Does not recalculate data, but controls which rows appear in the compliance table. |
| `year` | Integer between 2038 and 2042. | Applies gradual drifts (positive or negative) to many metrics to emulate time series evolution. |
| `scenario` | `baseline`, `mitigation`, or `expansion`. | Adjusts values via multipliers and offsets to paint optimistic or pessimistic narratives. |

Scenario modifiers follow these high-level rules:

- **Baseline** – Uses raw `BASE_DATA` with minor noise.
- **Mitigation** – Lowers toxins and CO₂, raises fish biomass and reef health, slightly reduces desalination load, increases reclaimed water share.
- **Rapid Expansion** – Opposite of mitigation: higher toxin scores and CO₂, reduced biomass, heavier desalination dependence, more watchlist alerts.

## Metric Breakdown

The table below summarises the key fields returned by `generateDashboardData`:

| Key | Description | Notes |
| --- | --- | --- |
| `toxins.global` | 12-month composite toxin index. | Baseline values (`BASE_DATA.toxinBase`) adjusted by seasonal sine waves, year drift, scenario shifts, and noise. |
| `toxins.north` | North Atlantic toxin index. | Derived from global values with additional seasonal spikes. |
| `toxins.tropics` | Tropical Pacific toxin index. | Global baseline minus mitigation offsets and tropical-specific sine noise. |
| `temps.surface` | Surface water temperatures across four macro regions. | Scenario factor changes amplitude; mitigation slightly cools, expansion warms. |
| `temps.depth` | 200m depth temperatures. | Smaller drift compared to surface temperatures. |
| `fish` | Relative biomass percentages for five fishing regions. | Clamped between 58 and 108 to remain realistic. |
| `reef.healthy` | Share of reef modules in good condition. | Scenario shift ±7–8% plus yearly drift. |
| `reef.watch` | Modules requiring monitoring. | Calculated against the healthy segment to keep totals near 100%. |
| `reef.critical` | Modules at risk. | Complements the other reef segments, with caps to stay between 3 and 35%. |
| `desal` | Monthly desalination throughput (megalitres/day). | Scenario factor ±25 ML plus random wobble, clamped between 160 and 260. |
| `reclaimed` | Percentage of water recycled. | Slightly increases under mitigation, decreases under expansion. |
| `gasses.o2` | Dissolved oxygen (mg/L). | Scenario offsets ±0.12 with yearly drift favouring mitigation. |
| `gasses.co2` | Carbon dioxide (ppm). | Expansion adds ~6 ppm, mitigation removes ~4 ppm, plus yearly increase. |
| `occupancy.population` | Population (in thousands) across five habitats. | Drift reflects growth or decline with scenario emphasis. |
| `occupancy.kwh` | kWh per capita. | Expansion increases energy usage; mitigation reduces slightly. |
| `kpis` | Aggregated toxin, fish, oxygen, and compliance metrics with sparkline history. | Compliance is a composite derived from toxin average, fish average, and scenario adjustments. |
| `watchlist` | Array of site risk entries. | Base rows from `WATCHLIST_BASE`, recalculated to include toxin/fish/reef values and a qualitative risk label. |
| `incidents` | Timeline events with severity levels. | Severity reclassified based on scenario (expansion pushes towards `critical`). |
| `map` | Heatmap points for each ocean region. | Intensities drift with scenario and year, mapping to `calm`, `warning`, or `critical`. |
| `energyMix` | Array of four energy source shares. | Hard-coded per scenario to narrate the power story. |

## Watchlist Risk Calculation

Each watchlist entry is enriched as follows:

1. Toxin, fish, and reef values are adjusted using scenario multipliers, year drift, and seeded noise.
2. A risk score is computed: `0.45 * toxin + 0.3 * (100 - fish) + 0.35 * (70 - reef)`.
3. Risk categories correspond to thresholds: `High` if score > 32, `Moderate` if > 18, otherwise `Watch`.

Selecting a specific `region` filter on the dashboard limits the table to matching entries; `all` shows every row.

## Incident Severity

Baseline incidents include metadata such as `date`, `title`, and `detail`. `generateDashboardData` recalculates the severity tag by:

- Translating the baseline severity (`high`, `medium`) into a numerical base score.
- Applying a scenario shift (+0.12 for expansion, −0.12 for mitigation) and random noise.
- Mapping the final score to `critical` (> 0.72), `warning` (> 0.48), or `info`.

## Map Intensities

`MAP_POINTS` store static coordinates and base intensities for six ocean regions. Scenario and year adjustments produce final intensities between 0.2 and 0.98. Thresholds map to qualitative states:

- `critical` for intensity > 0.72,
- `warning` for intensity > 0.55,
- `calm` otherwise.

These fields drive both the bubble size and colour class of each overlay element in `MapPanel`.

## KPI Trends

`kpis.trends` holds sparkline sequences for toxins, fish, dissolved oxygen, and compliance. Each sequence is influenced by:

- Average values from the main dataset (e.g., mean fish biomass).
- Sinusoidal modulation to mimic seasonality.
- Scenario adjustments to emphasise risk or recovery narratives.

The dashboard displays the current aggregate values alongside these trends in the KPI grid.

## Energy Mix

Energy mix values are scenario-dependent constants:

- **Baseline:** `[38, 24, 30, 8]` — balanced reliance on solar, tidal, thermal, and diesel backup.
- **Mitigation:** `[42, 28, 26, 4]` — heavier tilt toward renewables with minimal diesel.
- **Rapid Expansion:** `[32, 26, 28, 14]` — increased diesel usage due to aggressive construction.

Adjust the arrays if your narrative calls for different power assumptions.
