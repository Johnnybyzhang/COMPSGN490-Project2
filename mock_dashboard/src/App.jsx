import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import mapTexture from './assets/risk-map.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TEMP_REGIONS = ['Arctic', 'Mid-Lat', 'Tropics', 'S. Ocean'];
const FISH_REGIONS = ['N. Atl', 'S. Atl', 'Ind.', 'W. Pac', 'E. Pac'];
const REEF_ZONES = ['Alpha', 'Brine', 'Coralum', 'Dorsal'];
const REGION_OPTIONS = [
  { value: 'all', label: 'All Oceans' },
  { value: 'na', label: 'North Atlantic' },
  { value: 'sa', label: 'South Atlantic' },
  { value: 'wp', label: 'West Pacific' },
  { value: 'ep', label: 'East Pacific' },
  { value: 'ind', label: 'Indian' },
  { value: 'arc', label: 'Arctic' },
  { value: 'sou', label: 'Southern' },
];

const SCENARIO_INFO = {
  baseline: {
    label: 'Baseline',
    blurb: 'Steady-state operations with standard mitigation controls active.',
  },
  mitigation: {
    label: 'Mitigation',
    blurb: 'Aggressive restoration efforts and carbon draw-down yield healthier metrics.',
  },
  expansion: {
    label: 'Rapid Expansion',
    blurb: 'Construction booms strain support systems and elevate environmental risk.',
  },
};

const DARK_THEME = {
  name: 'dark',
  text: '#e6eefc',
  muted: '#9bb0d1',
  grid: '#1f2b47',
  accent: '#22d3ee',
  accent2: '#7c3aed',
  ok: '#10b981',
  warn: '#f59e0b',
  danger: '#ef4444',
};

const LIGHT_THEME = {
  name: 'light',
  text: '#0f1628',
  muted: '#51607a',
  grid: '#d9e3ff',
  accent: '#22d3ee',
  accent2: '#7c3aed',
  ok: '#0f9d8a',
  warn: '#cc7a05',
  danger: '#d62839',
};

const BASE_DATA = {
  toxinBase: [52, 54, 55, 58, 60, 63, 65, 67, 69, 70, 72, 74],
  surfaceTemps: [3, 18, 28, 6],
  depthTemps: [-1, 8, 13, 1],
  fishBiomass: [92, 78, 84, 71, 88],
  reefHealthy: [62, 55, 68, 50],
  reefWatch: [28, 32, 22, 30],
  reefCritical: [10, 13, 10, 20],
  desal: [186, 190, 196, 205, 212, 219, 226, 232, 228, 220, 210, 198],
  reclaimed: [47, 48, 50, 51, 53, 54, 55, 56, 55, 54, 52, 50],
  o2: [6.2, 6.28, 6.35, 6.32, 6.3, 6.38, 6.42, 6.4, 6.37, 6.35, 6.33, 6.31],
  co2: [520, 521, 524, 527, 529, 532, 534, 536, 539, 541, 544, 546],
  population: [42, 35, 51, 30, 28],
  kwhCap: [14, 16, 12, 17, 13],
};

const WATCHLIST_BASE = [
  { site: 'Alpha-03', region: 'na', toxin: 72, fish: 78, reef: 55 },
  { site: 'Brine-12', region: 'wp', toxin: 69, fish: 71, reef: 50 },
  { site: 'Coralum-07', region: 'ind', toxin: 65, fish: 82, reef: 62 },
  { site: 'Dorsal-02', region: 'ep', toxin: 75, fish: 68, reef: 48 },
  { site: 'Eddy-09', region: 'sa', toxin: 62, fish: 86, reef: 60 },
];

const INCIDENTS_BASE = [
  {
    date: '2041-03-12',
    title: 'Microplastic spike — Tropics',
    detail: 'Desalination intake filters saturated; short-term advisory issued.',
    severity: 'high',
  },
  {
    date: '2041-04-08',
    title: 'Overfishing alert — Dorsal',
    detail: 'Catch per unit effort exceeded threshold for two weeks.',
    severity: 'medium',
  },
  {
    date: '2041-04-22',
    title: 'Seafloor stress',
    detail: 'Pile driving near trench raised monitoring alarms; work paused.',
    severity: 'medium',
  },
  {
    date: '2041-05-03',
    title: 'Biotoxin bloom',
    detail: 'Dinoflagellate bloom detected near Brine sector.',
    severity: 'high',
  },
];

const MAP_POINTS = [
  { id: 'na', label: 'North Atlantic', x: 41, y: 38, base: 0.78 },
  { id: 'sa', label: 'South Atlantic', x: 45, y: 68, base: 0.52 },
  { id: 'ind', label: 'Indian Ocean', x: 70, y: 55, base: 0.61 },
  { id: 'ep', label: 'East Pacific', x: 15, y: 56, base: 0.72 },
  { id: 'wp', label: 'West Pacific', x: 90, y: 45, base: 0.48 },
  { id: 'arc', label: 'Arctic', x: 51, y: 18, base: 0.57 },
];

function mulberry32(seed) {
  let t = seed + 0x6d2b79f5;
  return function () {
    t |= 0;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    t += 0x6d2b79f5;
    return result;
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function average(values) {
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function generateDashboardData(filters, variant) {
  const { year, scenario } = filters;
  const scenarioFactor = scenario === 'expansion' ? 1.08 : scenario === 'mitigation' ? 0.94 : 1;
  const scenarioShift = scenario === 'expansion' ? 4 : scenario === 'mitigation' ? -3 : 0;
  const rand = mulberry32(year * 131 + variant * 971 + scenario.charCodeAt(0));

  const globalToxins = BASE_DATA.toxinBase.map((value, index) => {
    const yearShift = (year - 2041) * 0.8;
    const seasonal = Math.sin((index / 12) * Math.PI * 2) * 1.4;
    const noise = (rand() - 0.5) * 2.6;
    const scaled = value * scenarioFactor + scenarioShift + yearShift + seasonal + noise;
    return Number(scaled.toFixed(1));
  });

  const northToxins = globalToxins.map((value, index) => {
    const seasonal = index % 3 === 0 ? 2.2 : 1.4;
    const noise = (rand() - 0.5) * 2.4;
    return Number((value + seasonal + noise).toFixed(1));
  });

  const tropicsToxins = globalToxins.map((value, index) => {
    const seasonal = Math.sin((index + 2) / 2) * 1.8;
    const noise = (rand() - 0.5) * 2.2;
    return Number((value - 6 + seasonal + noise).toFixed(1));
  });

  const surfaceTemps = BASE_DATA.surfaceTemps.map((value) => {
    const shift = (scenarioFactor - 1) * 6 + (year - 2041) * 0.25;
    return Number((value + shift + (rand() - 0.5) * 1.1).toFixed(1));
  });

  const depthTemps = BASE_DATA.depthTemps.map((value) => {
    const shift = (scenarioFactor - 1) * 3 + (year - 2041) * 0.18;
    return Number((value + shift + (rand() - 0.5) * 0.9).toFixed(1));
  });

  const fishBiomass = BASE_DATA.fishBiomass.map((value) => {
    const mitigationBonus = scenario === 'mitigation' ? 6 : scenario === 'expansion' ? -7 : 0;
    const yearDrift = (2041 - year) * 1.4;
    const adjusted = value + mitigationBonus + yearDrift + (rand() - 0.5) * 5.5;
    return Math.round(clamp(adjusted, 58, 108));
  });

  const reefHealthy = BASE_DATA.reefHealthy.map((value) => {
    const shift = scenario === 'mitigation' ? 8 : scenario === 'expansion' ? -7 : 0;
    const adjusted = value + shift + (2041 - year) * 1.2 + (rand() - 0.5) * 4.5;
    return Math.round(clamp(adjusted, 35, 92));
  });

  const reefWatch = BASE_DATA.reefWatch.map((value, index) => {
    const base = value - (reefHealthy[index] - BASE_DATA.reefHealthy[index]) * 0.4;
    const drift = scenario === 'expansion' ? 4 : scenario === 'mitigation' ? -3 : 0;
    return Math.round(clamp(base + drift + (rand() - 0.5) * 3.5, 8, 46));
  });

  const reefCritical = BASE_DATA.reefCritical.map((value, index) => {
    const remainder = 100 - reefHealthy[index] - reefWatch[index];
    const drift = scenario === 'expansion' ? 4 : scenario === 'mitigation' ? -2 : 0;
    return Math.round(clamp(remainder + drift + (rand() - 0.5) * 2.4, 3, 35));
  });

  const desal = BASE_DATA.desal.map((value, index) => {
    const swing = (scenarioFactor - 1) * 25 + (year - 2041) * 4;
    return Math.round(clamp(value + swing + (rand() - 0.5) * 9, 160, 260));
  });

  const reclaimed = BASE_DATA.reclaimed.map((value) => {
    const swing = scenario === 'mitigation' ? 4 : scenario === 'expansion' ? -3 : 0;
    return Number((value + swing + (rand() - 0.5) * 2.2).toFixed(1));
  });

  const o2 = BASE_DATA.o2.map((value) => {
    const swing = scenario === 'mitigation' ? 0.12 : scenario === 'expansion' ? -0.16 : 0;
    const drift = (2041 - year) * 0.03;
    return Number((value + swing + drift + (rand() - 0.5) * 0.12).toFixed(2));
  });

  const co2 = BASE_DATA.co2.map((value) => {
    const swing = scenario === 'expansion' ? 6 : scenario === 'mitigation' ? -4 : 0;
    const drift = (year - 2041) * 1.6;
    return Math.round(value + swing + drift + (rand() - 0.5) * 6);
  });

  const population = BASE_DATA.population.map((value) => {
    const growth = scenario === 'expansion' ? 6 : scenario === 'mitigation' ? -1 : 2;
    const drift = (year - 2041) * 0.8;
    return Math.round(clamp(value + growth + drift + (rand() - 0.5) * 2.4, 18, 78));
  });

  const kwhCap = BASE_DATA.kwhCap.map((value) => {
    const swing = scenario === 'expansion' ? 3 : scenario === 'mitigation' ? -1.5 : 0;
    return Number((value + swing + (rand() - 0.5) * 1.8).toFixed(1));
  });

  const kpiTrends = {
    toxin: globalToxins.map((value) => Number(value.toFixed(1))),
    fish: MONTHS.map((_, index) => {
      const baseline = average(fishBiomass);
      const wobble = Math.sin(index / 2) * 3.4;
      return Number((baseline + wobble + (rand() - 0.5) * 2.2).toFixed(1));
    }),
    o2,
    compliance: MONTHS.map((_, index) => {
      const base = 92 + Math.sin(index / 3) * 3;
      const adjust = scenario === 'mitigation' ? 4 : scenario === 'expansion' ? -6 : 0;
      return Math.round(clamp(base + adjust + (rand() - 0.5) * 3, 60, 100));
    }),
  };

  const toxinAvg = average(globalToxins);
  const fishAvg = average(fishBiomass);
  const o2Avg = average(o2);
  const compliance = Math.round(
    clamp(
      100 - (toxinAvg - 50) * 0.9 - (85 - fishAvg) * 0.8 + (scenario === 'mitigation' ? 6 : scenario === 'expansion' ? -5 : 0),
      52,
      99,
    ),
  );

  const watchlist = WATCHLIST_BASE.map((row) => {
    const toxin = Math.round(clamp(row.toxin + scenarioShift + (year - 2041) * 1.1 + (rand() - 0.5) * 5.5, 55, 96));
    const fish = Math.round(
      clamp(row.fish + (scenario === 'mitigation' ? 4 : scenario === 'expansion' ? -6 : 0) + (rand() - 0.5) * 4.5, 58, 96),
    );
    const reef = Math.round(
      clamp(row.reef + (scenario === 'mitigation' ? 7 : scenario === 'expansion' ? -7 : 0) + (rand() - 0.5) * 4.8, 42, 91),
    );
    const riskScore = toxin * 0.45 + (100 - fish) * 0.3 + (70 - reef) * 0.35;
    const risk = riskScore > 32 ? 'High' : riskScore > 18 ? 'Moderate' : 'Watch';
    return { ...row, toxin, fish, reef, risk };
  });

  const incidents = INCIDENTS_BASE.map((item) => {
    const severityShift = scenario === 'expansion' ? 0.12 : scenario === 'mitigation' ? -0.12 : 0;
    const baseScore = item.severity === 'high' ? 0.8 : item.severity === 'medium' ? 0.55 : 0.3;
    const score = clamp(baseScore + severityShift + (rand() - 0.5) * 0.08, 0, 1);
    const severity = score > 0.72 ? 'critical' : score > 0.48 ? 'warning' : 'info';
    return { ...item, severity };
  });

  const map = MAP_POINTS.map((point) => {
    const shift = scenario === 'expansion' ? 0.08 : scenario === 'mitigation' ? -0.06 : 0;
    const yearShift = (year - 2041) * 0.025;
    const intensity = clamp(point.base + shift + yearShift + (rand() - 0.5) * 0.07, 0.2, 0.98);
    const status = intensity > 0.72 ? 'critical' : intensity > 0.55 ? 'warning' : 'calm';
    return { ...point, intensity, status };
  });

  const energyMix =
    scenario === 'expansion' ? [32, 26, 28, 14] : scenario === 'mitigation' ? [42, 28, 26, 4] : [38, 24, 30, 8];

  return {
    toxins: { global: globalToxins, north: northToxins, tropics: tropicsToxins },
    temps: { surface: surfaceTemps, depth: depthTemps },
    fish: fishBiomass,
    reef: { healthy: reefHealthy, watch: reefWatch, critical: reefCritical },
    desal,
    reclaimed,
    gasses: { o2, co2 },
    occupancy: { population, kwh: kwhCap },
    kpis: {
      toxin: Number(toxinAvg.toFixed(1)),
      fish: Math.round(fishAvg),
      o2: Number(o2Avg.toFixed(2)),
      compliance,
      trends: kpiTrends,
    },
    watchlist,
    incidents,
    map,
    energyMix,
  };
}

function buildChartConfigs(data, palette) {
  const lineBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: palette.muted } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        grid: { color: palette.grid },
        ticks: { color: palette.muted },
      },
      y: {
        grid: { color: palette.grid },
        ticks: { color: palette.muted },
      },
    },
  };

  return {
    toxins: {
      data: {
        labels: MONTHS,
        datasets: [
          {
            label: 'Global Avg',
            data: data.toxins.global,
            borderColor: palette.accent,
            backgroundColor: 'transparent',
            tension: 0.35,
            pointRadius: 2,
          },
          {
            label: 'North Atlantic',
            data: data.toxins.north,
            borderColor: palette.warn,
            backgroundColor: 'transparent',
            tension: 0.35,
            pointRadius: 2,
          },
          {
            label: 'Tropical Pacific',
            data: data.toxins.tropics,
            borderColor: palette.danger,
            backgroundColor: 'transparent',
            tension: 0.35,
            pointRadius: 2,
          },
        ],
      },
      options: {
        ...lineBase,
        scales: {
          ...lineBase.scales,
          y: {
            ...lineBase.scales.y,
            title: { display: true, text: 'Index (0-100)', color: palette.muted },
          },
        },
      },
    },
    temp: {
      data: {
        labels: TEMP_REGIONS,
        datasets: [
          {
            label: 'Surface',
            data: data.temps.surface,
            backgroundColor: palette.accent2,
            borderRadius: 12,
            borderSkipped: false,
          },
          {
            label: '200m Depth',
            data: data.temps.depth,
            backgroundColor: palette.accent,
            borderRadius: 12,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...lineBase,
        scales: {
          x: lineBase.scales.x,
          y: {
            ...lineBase.scales.y,
            title: { display: true, text: '°C', color: palette.muted },
          },
        },
      },
    },
    fish: {
      data: {
        labels: FISH_REGIONS,
        datasets: [
          {
            label: 'Biomass % of 2035',
            data: data.fish,
            borderColor: palette.ok,
            backgroundColor: hexToRgba(palette.ok, 0.16),
            pointBackgroundColor: palette.ok,
            pointBorderColor: palette.ok,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: palette.muted } } },
        scales: {
          r: {
            angleLines: { color: palette.grid },
            grid: { color: palette.grid },
            suggestedMin: 50,
            pointLabels: { color: palette.muted },
            ticks: { display: false },
          },
        },
      },
    },
    reef: {
      data: {
        labels: REEF_ZONES,
        datasets: [
          {
            label: 'Healthy',
            data: data.reef.healthy,
            backgroundColor: palette.ok,
            stack: 'reef',
            borderRadius: 10,
            borderSkipped: false,
          },
          {
            label: 'Watch',
            data: data.reef.watch,
            backgroundColor: palette.warn,
            stack: 'reef',
            borderRadius: 10,
            borderSkipped: false,
          },
          {
            label: 'Critical',
            data: data.reef.critical,
            backgroundColor: palette.danger,
            stack: 'reef',
            borderRadius: 10,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...lineBase,
        scales: {
          x: { ...lineBase.scales.x, stacked: true },
          y: {
            ...lineBase.scales.y,
            stacked: true,
            title: { display: true, text: '% of modules', color: palette.muted },
          },
        },
      },
    },
    energy: {
      data: {
        labels: ['Solar', 'Tidal', 'Thermal', 'Diesel'],
        datasets: [
          {
            data: data.energyMix,
            backgroundColor: [palette.accent, palette.ok, palette.accent2, palette.warn],
            borderColor: 'transparent',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: palette.muted, padding: 16 },
          },
        },
      },
    },
    water: {
      data: {
        labels: MONTHS,
        datasets: [
          {
            type: 'bar',
            label: 'Desalination (ML/day)',
            data: data.desal,
            backgroundColor: palette.accent,
            borderRadius: 10,
            borderSkipped: false,
          },
          {
            type: 'line',
            label: 'Reclaimed (%)',
            data: data.reclaimed,
            borderColor: palette.ok,
            backgroundColor: 'transparent',
            tension: 0.35,
            yAxisID: 'y1',
            pointRadius: 2,
          },
        ],
      },
      options: {
        ...lineBase,
        scales: {
          x: lineBase.scales.x,
          y: lineBase.scales.y,
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: { color: palette.muted },
          },
        },
      },
    },
    gasses: {
      data: {
        labels: MONTHS,
        datasets: [
          {
            label: 'O2 (mg/L)',
            data: data.gasses.o2,
            borderColor: palette.ok,
            backgroundColor: 'transparent',
            tension: 0.35,
            pointRadius: 2,
          },
          {
            label: 'CO2 (ppm)',
            data: data.gasses.co2,
            borderColor: palette.danger,
            backgroundColor: 'transparent',
            tension: 0.35,
            pointRadius: 2,
          },
        ],
      },
      options: lineBase,
    },
    occupancy: {
      data: {
        labels: ['Alpha', 'Brine', 'Coralum', 'Dorsal', 'Eddy'],
        datasets: [
          {
            type: 'bar',
            label: 'Population (k)',
            data: data.occupancy.population,
            backgroundColor: palette.accent2,
            borderRadius: 10,
            borderSkipped: false,
          },
          {
            type: 'line',
            label: 'kWh per capita',
            data: data.occupancy.kwh,
            borderColor: palette.accent,
            backgroundColor: 'transparent',
            tension: 0.3,
            yAxisID: 'y1',
            pointRadius: 2,
          },
        ],
      },
      options: {
        ...lineBase,
        scales: {
          x: lineBase.scales.x,
          y: lineBase.scales.y,
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: { color: palette.muted },
          },
        },
      },
    },
  };
}

function KpiCard({ title, value, suffix, dataset, color }) {
  const chartData = useMemo(
    () => ({
      labels: dataset.map((_, index) => index + 1),
      datasets: [
        {
          data: dataset,
          borderColor: color,
          backgroundColor: 'transparent',
          tension: 0.35,
          pointRadius: 0,
        },
      ],
    }),
    [dataset, color],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { borderWidth: 2 }, point: { radius: 0 } },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
    }),
    [],
  );

  return (
    <div className="kpi-card">
      <div className="kpi-text">
        <span className="kpi-label">{title}</span>
        <span className="kpi-value">
          {value}
          {suffix ? <span className="kpi-suffix">{suffix}</span> : null}
        </span>
      </div>
      <div className="kpi-sparkline">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

function severityClass(level) {
  switch (level) {
    case 'critical':
      return 'pill danger';
    case 'warning':
      return 'pill warn';
    default:
      return 'pill';
  }
}

function severityLabel(level) {
  if (level === 'critical') return 'Critical';
  if (level === 'warning') return 'Watch';
  return 'Info';
}

function riskClass(level) {
  if (level === 'High') return 'risk risk-high';
  if (level === 'Moderate') return 'risk risk-medium';
  return 'risk risk-low';
}

function MapPanel({ points }) {
  return (
    <div className="map" style={{ '--map-image': `url(${mapTexture})` }}>
      <div className="map-overlay" />
      {points.map((point) => (
        <div
          key={point.id}
          className={`map-bubble ${point.status}`}
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: `${44 + point.intensity * 60}px`,
            height: `${44 + point.intensity * 60}px`,
          }}
        >
          <span>{point.label}</span>
        </div>
      ))}
    </div>
  );
}

function Timeline({ events }) {
  return (
    <div className="timeline">
      {events.map((event) => (
        <div key={`${event.date}-${event.title}`} className="timeline-item">
          <div className="timeline-meta">
            <span className={severityClass(event.severity)}>{severityLabel(event.severity)}</span>
            <span className="timeline-date">{event.date}</span>
          </div>
          <h4>{event.title}</h4>
          <p>{event.detail}</p>
        </div>
      ))}
    </div>
  );
}

function WatchlistTable({ rows, regionLabel }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Site</th>
            <th>Region</th>
            <th>Toxin</th>
            <th>Fish Stock</th>
            <th>Reef Health</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.site}>
                <td>{row.site}</td>
                <td>{row.region.toUpperCase()}</td>
                <td>{row.toxin}</td>
                <td>{row.fish}%</td>
                <td>{row.reef}%</td>
                <td>
                  <span className={riskClass(row.risk)}>{row.risk}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="empty">
                No flagged sites for {regionLabel}.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SimulationControlsPanel({ filters, setFilters, scenarioMeta, setVariant, setTheme, theme }) {
  return (
    <section className="panel filters controls-panel">
      <div className="panel-header">
        <h2>Simulation Controls</h2>
        <p className="panel-subtext">Tune scenario parameters to explore alternate narratives in the evidence bundle.</p>
      </div>
      <div className="controls-grid">
        <label>
          <span>Region</span>
          <select value={filters.region} onChange={(event) => setFilters((prev) => ({ ...prev, region: event.target.value }))}>
            {REGION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Year</span>
          <input
            type="range"
            min="2038"
            max="2042"
            step="1"
            value={filters.year}
            onChange={(event) => setFilters((prev) => ({ ...prev, year: Number(event.target.value) }))}
          />
          <div className="range-value">{filters.year}</div>
        </label>
        <label>
          <span>Scenario</span>
          <select value={filters.scenario} onChange={(event) => setFilters((prev) => ({ ...prev, scenario: event.target.value }))}>
            {Object.entries(SCENARIO_INFO).map(([value, info]) => (
              <option key={value} value={value}>
                {info.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="scenario-blurb">
        <strong>{scenarioMeta.label}:</strong> {scenarioMeta.blurb}
      </div>
      <div className="button-row">
        <button type="button" className="btn" onClick={() => setVariant(Date.now())}>
          Randomize Mock Data
        </button>
        <button type="button" className="btn" onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}>
          {theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        </button>
      </div>
    </section>
  );
}

function ControlsPage({ filters, setFilters, scenarioMeta, setVariant, setTheme, theme, regionLabel }) {
  return (
    <div className="controls-page">
      <SimulationControlsPanel
        filters={filters}
        setFilters={setFilters}
        scenarioMeta={scenarioMeta}
        setVariant={setVariant}
        setTheme={setTheme}
        theme={theme}
      />
      <section className="panel info-panel">
        <div className="panel-header">
          <h2>Presenter Tips</h2>
          <p className="panel-subtext">Share <code>/controls</code> to control the dashboard from another device.</p>
        </div>
        <ul className="quick-tips">
          <li>
            Start from the baseline scenario, then switch to alternative narratives while classmates follow the main dashboard.
          </li>
          <li>
            Use "Randomize Mock Data" between slides to highlight how the exhibits can shift under different assumptions.
          </li>
          <li>
            Theme toggles apply globally, so the dashboard updates its look instantly.
          </li>
          <li>Current region preview: <strong>{regionLabel}</strong>.</li>
        </ul>
        <div className="button-row">
          <Link to="/" className="btn secondary">
            Return to Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}

function DashboardView({ data, charts, palette, filteredWatchlist, regionLabel, filters, scenarioMeta }) {
  return (
    <>
      <div className="primary-grid">
        <section className="panel context">
          <div className="panel-header">
            <h2>Scenario Context</h2>
            <p className="panel-subtext">
              Following dramatic sea-level rise, underwater cities shelter displaced populations. The dashboard summarises fictional monitoring data referenced during mock trial deliberations.
            </p>
          </div>
          <ul className="fact-list">
            <li>
              <span>Habitats online</span>
              <strong>37 underwater districts</strong>
            </li>
            <li>
              <span>Artificial reefs</span>
              <strong>612 modules installed</strong>
            </li>
            <li>
              <span>Fishing zones</span>
              <strong>128 regulated grids</strong>
            </li>
          </ul>
          <div className="legend">
            <span>
              <span className="dot ok" /> Stable
            </span>
            <span>
              <span className="dot warn" /> Watch
            </span>
            <span>
              <span className="dot danger" /> Critical
            </span>
          </div>
          <div className="note">
            <strong>Note:</strong> All figures are illustrative and fabricated for educational storytelling.
          </div>
        </section>

        <section className="panel kpis">
          <div className="panel-header">
            <h2>Key Indicators</h2>
            <p className="panel-subtext">Quick-look metrics derived from live monitoring streams.</p>
          </div>
          <div className="kpi-grid">
            <KpiCard
              title="Avg Toxin Index"
              value={data.kpis.toxin.toFixed(1)}
              dataset={data.kpis.trends.toxin}
              color={palette.danger}
            />
            <KpiCard
              title="Fish Stock Health"
              value={`${data.kpis.fish}%`}
              dataset={data.kpis.trends.fish}
              color={palette.ok}
            />
            <KpiCard
              title="O₂ at 200m"
              value={data.kpis.o2.toFixed(2)}
              suffix=" mg/L"
              dataset={data.kpis.trends.o2}
              color={palette.accent}
            />
            <KpiCard
              title="Water Temp At Construction"
              value={`${data.kpis.compliance}℉`}
              dataset={data.kpis.trends.compliance}
              color={palette.accent2}
            />
          </div>
        </section>
      </div>

      <section className="cards-grid">
        <article className="card card-wide">
          <div className="card-header">
            <div>
              <h3>Global Toxin Index</h3>
              <p>Composite of heavy metals, microplastics, nitrates</p>
            </div>
            <span className="badge ghost">Monthly cadence</span>
          </div>
          <div className="chart-container">
            <Line data={charts.toxins.data} options={charts.toxins.options} />
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h3>Sea Temperature Distribution</h3>
              <p>Surface vs. 200m depth (°C)</p>
            </div>
          </div>
          <div className="chart-container small">
            <Bar data={charts.temp.data} options={charts.temp.options} />
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h3>Fish Biomass by Region</h3>
              <p>Relative biomass vs. 2035 baseline</p>
            </div>
          </div>
          <div className="chart-container small">
            <Radar data={charts.fish.data} options={charts.fish.options} />
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h3>Reef Module Health</h3>
              <p>Distribution of healthy, watch, and critical modules</p>
            </div>
          </div>
          <div className="chart-container small">
            <Bar data={charts.reef.data} options={charts.reef.options} />
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h3>Energy Mix</h3>
              <p>Solar topside, tidal, thermal, diesel backup</p>
            </div>
          </div>
          <div className="chart-container small">
            <Doughnut data={charts.energy.data} options={charts.energy.options} />
          </div>
        </article>

        <article className="card card-wide map-card">
          <div className="card-header">
            <div>
              <h3>Map: Risk Heatmap</h3>
              <p>Higher intensity indicates greater environmental stress</p>
            </div>
          </div>
          <MapPanel points={data.map} />
        </article>

        <article className="card timeline-card">
          <div className="card-header">
            <div>
              <h3>Incidents Timeline</h3>
              <p>Reported spills, overfishing alerts, seismic stress events</p>
            </div>
          </div>
          <Timeline events={data.incidents} />
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h3>Desalination &amp; Wastewater</h3>
              <p>Daily throughput vs. reclaimed (%)</p>
            </div>
          </div>
          <div className="chart-container small">
            <Bar data={charts.water.data} options={charts.water.options} />
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h3>O₂ / CO₂ Levels</h3>
              <p>Dissolved O₂ (mg/L) vs. CO₂ (ppm)</p>
            </div>
          </div>
          <div className="chart-container small">
            <Line data={charts.gasses.data} options={charts.gasses.options} />
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h3>Occupancy &amp; Consumption</h3>
              <p>Population, kWh per capita</p>
            </div>
          </div>
          <div className="chart-container small">
            <Bar data={charts.occupancy.data} options={charts.occupancy.options} />
          </div>
        </article>

        <article className="card card-wide">
          <div className="card-header">
            <div>
              <h3>Compliance Watchlist</h3>
              <p>Sites nearing regulatory thresholds</p>
            </div>
          </div>
          <WatchlistTable rows={filteredWatchlist} regionLabel={regionLabel} />
        </article>
      </section>
    </>
  );
}

function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

  const [filters, setFilters] = useState({ region: 'all', year: 2041, scenario: 'baseline' });
  const [variant, setVariant] = useState(0);
  const [liveState, setLiveState] = useState({ status: 'idle', lastUpdate: null });
  const eventSourceRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const skipBroadcastRef = useRef(false);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!('EventSource' in window)) {
      setLiveState({ status: 'unsupported', lastUpdate: null });
      return undefined;
    }

    let isMounted = true;

    const applyRemoteUpdate = (payload) => {
      skipBroadcastRef.current = true;
      if (payload.filters) {
        setFilters(payload.filters);
      }
      if (typeof payload.variant === 'number' && Number.isFinite(payload.variant)) {
        setVariant(payload.variant);
      }
      if (typeof payload.theme === 'string') {
        const normalizedTheme = payload.theme === 'light' ? 'light' : 'dark';
        setTheme(normalizedTheme);
      }

      const timestamp = payload.timestamp ?? new Date().toISOString();
      setLiveState({ status: 'connected', lastUpdate: timestamp });

      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          skipBroadcastRef.current = false;
        });
      } else {
        skipBroadcastRef.current = false;
      }
    };

    const connect = () => {
      if (!isMounted) return;

      setLiveState((prev) => ({ ...prev, status: 'connecting' }));

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const source = new EventSource('/api/stream');
      eventSourceRef.current = source;

      source.onopen = () => {
        if (!isMounted) return;
        setLiveState((prev) => ({ ...prev, status: 'connected' }));
      };

      const handleMessage = (event) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(event.data);
          applyRemoteUpdate(payload);
        } catch (error) {
          console.warn('Failed to parse SSE payload', error);
        }
      };

      source.addEventListener('update', handleMessage);
      source.addEventListener('sync', handleMessage);

      source.onerror = () => {
        if (!isMounted) return;
        setLiveState((prev) => ({ ...prev, status: 'disconnected' }));
        source.close();
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (skipBroadcastRef.current) {
      return undefined;
    }
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return undefined;
    }

    const controller = new AbortController();
    const payload = {
      filters,
      variant,
      theme,
      timestamp: new Date().toISOString(),
    };

    fetch('/api/controls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).catch((error) => {
      console.warn('Failed to broadcast dashboard state', error);
    });

    return () => controller.abort();
  }, [filters, theme, variant]);

  const palette = theme === 'light' ? LIGHT_THEME : DARK_THEME;
  const data = useMemo(() => generateDashboardData(filters, variant), [filters, variant]);
  const charts = useMemo(() => buildChartConfigs(data, palette), [data, palette]);

  const regionLabel = REGION_OPTIONS.find((option) => option.value === filters.region)?.label ?? 'All Oceans';
  const scenarioMeta = SCENARIO_INFO[filters.scenario];

  const filteredWatchlist = useMemo(
    () => (filters.region === 'all' ? data.watchlist : data.watchlist.filter((row) => row.region === filters.region)),
    [data.watchlist, filters.region],
  );

  const livePillLabel = (() => {
    if (liveState.status === 'connected') {
      if (liveState.lastUpdate) {
        const time = new Date(liveState.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `Live feed · ${time}`;
      }
      return 'Live feed · connected';
    }
    if (liveState.status === 'connecting') return 'Live feed · connecting…';
    if (liveState.status === 'disconnected') return 'Live feed · reconnecting…';
    if (liveState.status === 'unsupported') return 'Live feed · unsupported';
    return 'Live feed · idle';
  })();

  const dashboardElement = (
    <DashboardView
      data={data}
      charts={charts}
      palette={palette}
      filteredWatchlist={filteredWatchlist}
      regionLabel={regionLabel}
      filters={filters}
      scenarioMeta={scenarioMeta}
    />
  );

  const controlsElement = (
    <ControlsPage
      filters={filters}
      setFilters={setFilters}
      scenarioMeta={scenarioMeta}
      setVariant={setVariant}
      setTheme={setTheme}
      theme={theme}
      regionLabel={regionLabel}
    />
  );

  const isControlsRoute = location.pathname.startsWith('/controls');

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo" aria-hidden="true">
            🌊
          </div>
          <div>
            <h1>GOOS Dashboard</h1>
            <p>Global Ocean Observing System - Environmental Impact Monitoring — Trial Exhibit A</p>
          </div>
        </div>
        <div className="topbar-meta">
          <span className="pill danger">Class Action · Sylva Legal vs. Thalassa Corp.</span>
          <span className="pill">Year {filters.year}</span>
          <span className="pill">{regionLabel}</span>
          <span className={`pill live ${liveState.status}`}>{livePillLabel}</span>
          {/* <Link to={isControlsRoute ? '/' : '/controls'} className="pill nav-pill">
            {isControlsRoute ? 'Back to Dashboard' : 'Open Controls'}
          </Link> */}
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={dashboardElement} />
          <Route path="/controls" element={controlsElement} />
          <Route path="*" element={dashboardElement} />
        </Routes>
      </main>

      <footer className="footer">
        <span>Fictional data for class mock trial. Not real measurements.</span>
        <span>© 2042 Ocean Settlements Bureau</span>
      </footer>
    </div>
  );
}

export default App;
