// Simple theming
const themeBtn = document.getElementById('toggle-theme');
if (themeBtn){
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  if (localStorage.getItem('theme') === 'light' || (!localStorage.getItem('theme') && prefersLight)) {
    document.body.classList.add('light');
  }
  themeBtn.addEventListener('click',()=>{
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });
}


// Helper to generate ranges
function range(n){return Array.from({length:n},(_,i)=>i)}

// Color palette
const c = {
  accent: getCss('--accent'),
  accent2: getCss('--accent-2'),
  ok: getCss('--ok'),
  warn: getCss('--warn'),
  danger: getCss('--danger'),
  grid: getCss('--grid'),
  text: getCss('--text'),
  muted: getCss('--muted'),
};

function getCss(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function gridColor(alpha=0.2){ return c.grid + (alpha? '' : ''); }

// Global Toxin Index chart (mock rising trend with regional variance)
const toxinsCtx = document.getElementById('toxinsChart');
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const toxinBase = [52,54,55,58,60,63,65,67,69,70,72,74]; // arbitrary index
const toxinNorth = toxinBase.map((v,i)=>v + (i%4===0?4:0) + (Math.random()*3));
const toxinTropics = toxinBase.map((v,i)=>v - 6 + Math.sin(i/2)*2 + (Math.random()*2));

const toxinsChart = new Chart(toxinsCtx,{
  type:'line',
  data:{
    labels:months,
    datasets:[
      {label:'Global Avg', data:toxinBase, tension:.35, borderColor:c.accent, backgroundColor:'transparent', pointRadius:2},
      {label:'North Atlantic', data:toxinNorth, tension:.35, borderColor:c.warn, backgroundColor:'transparent', pointRadius:2},
      {label:'Tropical Pacific', data:toxinTropics, tension:.35, borderColor:c.danger, backgroundColor:'transparent', pointRadius:2}
    ]
  },
  options:{
    responsive:true, maintainAspectRatio:false,
    responsive:true,
    plugins:{legend:{labels:{color:c.muted}}},
    scales:{
      x:{ grid:{color:c.grid}, ticks:{color:c.muted}},
      y:{ grid:{color:c.grid}, ticks:{color:c.muted}, title:{display:true, text:'Index (0-100)', color:c.muted}}
    }
  }
});

// Temperature distribution (violin-like via bar overlay)
const tempCtx = document.getElementById('tempChart');
const regions = ['Arctic','Mid‑Lat','Tropics','S. Ocean'];
const surface = [3, 18, 28, 6];
const depth200 = [-1, 8, 13, 1];

const tempChart = new Chart(tempCtx,{
  type:'bar',
  data:{
    labels:regions,
    datasets:[
      {label:'Surface', data:surface, backgroundColor:c.accent2},
      {label:'200m Depth', data:depth200, backgroundColor:c.accent}
    ]
  },
  options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:c.muted}}}, scales:{x:{grid:{color:c.grid}, ticks:{color:c.muted}}, y:{grid:{color:c.grid}, ticks:{color:c.muted}, title:{display:true, text:'°C', color:c.muted}}}}
});

// Fish Biomass by Region (mock relative to 2035)
const fishCtx = document.getElementById('fishChart');
const fishRegions = ['N. Atl','S. Atl','Ind.','W. Pac','E. Pac'];
const biomass = [92, 78, 84, 71, 88];

const fishChart = new Chart(fishCtx,{
  type:'radar',
  data:{
    labels:fishRegions,
    datasets:[{label:'Biomass % of 2035', data:biomass, borderColor:c.ok, backgroundColor:hexToRgba(c.ok,0.2), pointBackgroundColor:c.ok}]
  },
  options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:c.muted}}}, scales:{ r:{ angleLines:{color:c.grid}, grid:{color:c.grid}, pointLabels:{color:c.muted}, ticks:{display:false, color:c.muted, backdropColor:'transparent'} } }}
});

// Reef Module Health (stacked bars)
const reefCtx = document.getElementById('reefChart');
const zones = ['Alpha','Brine','Coralum','Dorsal'];
const healthy = [62, 55, 68, 50];
const watch = [28, 32, 22, 30];
const critical = [10, 13, 10, 20];

const reefChart = new Chart(reefCtx,{
  type:'bar',
  data:{
    labels:zones,
    datasets:[
      {label:'Healthy', data:healthy, backgroundColor:c.ok, stack:'s'},
      {label:'Watch', data:watch, backgroundColor:c.warn, stack:'s'},
      {label:'Critical', data:critical, backgroundColor:c.danger, stack:'s'}
    ]
  },
  options:{
    responsive:true, maintainAspectRatio:false,
    plugins:{legend:{labels:{color:c.muted}}},
    scales:{
      x:{stacked:true, grid:{color:c.grid}, ticks:{color:c.muted}},
      y:{stacked:true, grid:{color:c.grid}, ticks:{color:c.muted}, title:{display:true, text:'% of modules', color:c.muted}}
    }
  }
});

// Mock map heat bubbles
const mapEl = document.getElementById('map');
const mapBubbles = [
  {x:20,y:40,r:60,color:'#ff3b3b'}, // North Atlantic
  {x:55,y:50,r:40,color:'#ffb94d'}, // Indian
  {x:75,y:55,r:55,color:'#ff6d6d'}, // West Pacific
  {x:35,y:65,r:35,color:'#7cffc6'}, // South Atlantic (ok)
];
mapBubbles.forEach(b=>{
  const d=document.createElement('div');
  d.className='bubble';
  d.style.left=b.x+'%';
  d.style.top=b.y+'%';
  d.style.width=d.style.height=b.r+'px';
  d.style.background=`radial-gradient(circle, ${hexToRgba(b.color,0.55)} 0%, ${hexToRgba(b.color,0.12)} 50%, transparent 70%)`;
  mapEl.appendChild(d);
});

// Incidents timeline
const incidents = [
  {t:'2041‑03‑12', title:'Microplastic spike – Tropics', detail:'Desalination intake filters saturated; short‑term advisory issued.'},
  {t:'2041‑04‑08', title:'Overfishing alert – Dorsal', detail:'Catch per unit effort exceeded threshold for 2 weeks.'},
  {t:'2041‑04‑22', title:'Seafloor stress', detail:'Pile driving near trench raised monitoring alarms; work paused.'},
  {t:'2041‑05‑03', title:'Biotoxin bloom', detail:'Dinoflagellate bloom detected near Brine sector.'}
];
const incEl = document.getElementById('incidents');
incidents.forEach(ev=>{
  const card=document.createElement('div');
  card.className='event';
  card.innerHTML = `<h4>${ev.t} — ${ev.title}</h4><p>${ev.detail}</p>`;
  incEl.appendChild(card);
});

// Utils
function hexToRgba(hex, a){
  const h = hex.replace('#','');
  const bigint = parseInt(h,16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}


// Additional charts
const energyCtx = document.getElementById('energyChart');
const energyChart = new Chart(energyCtx,{
  type:'doughnut',
  data:{
    labels:['Solar','Tidal','Thermal','Diesel'],
    datasets:[{data:[38,24,30,8], backgroundColor:[c.accent, c.ok, c.accent2, c.warn], borderColor:'transparent'}]
  },
  options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:c.muted}}}}
});

const waterCtx = document.getElementById('waterChart');
const waterChart = new Chart(waterCtx,{
  type:'bar',
  data:{labels:months,
    datasets:[
      {label:'Desalination (ML/day)', data:range(12).map(()=> 180+Math.random()*40), backgroundColor:c.accent},
      {label:'Reclaimed (%)', data:range(12).map(()=> 45+Math.random()*15), type:'line', yAxisID:'y1', borderColor:c.ok, tension:.35}
    ]},
  options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:c.muted}}}, scales:{x:{grid:{color:c.grid},ticks:{color:c.muted}}, y:{grid:{color:c.grid},ticks:{color:c.muted}}, y1:{position:'right', grid:{display:false}, ticks:{color:c.muted}}}}
});

const gasCtx = document.getElementById('gasChart');
const gasChart = new Chart(gasCtx,{
  type:'line',
  data:{labels:months,
    datasets:[
      {label:'O2 (mg/L)', data:range(12).map((i)=> 6.2 + Math.sin(i/3)*0.3 + (Math.random()*.2)), borderColor:c.ok, tension:.35},
      {label:'CO2 (ppm)', data:range(12).map((i)=> 420 + i*2 + (Math.random()*5)), borderColor:c.danger, tension:.35}
    ]},
  options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:c.muted}}}, scales:{x:{grid:{color:c.grid},ticks:{color:c.muted}}, y:{grid:{color:c.grid},ticks:{color:c.muted}}}}
});

const occCtx = document.getElementById('occupancyChart');
const occupancyChart = new Chart(occCtx,{
  type:'bar',
  data:{labels:['Alpha','Brine','Coralum','Dorsal','Eddy'],
    datasets:[
      {label:'Population (k)', data:[42,35,51,30,28], backgroundColor:c.accent},
      {label:'kWh/cap', data:[14,16,12,17,13], type:'line', yAxisID:'y1', borderColor:c.accent2, tension:.3}
    ]},
  options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:c.muted}}}, scales:{x:{grid:{color:c.grid},ticks:{color:c.muted}}, y:{grid:{color:c.grid},ticks:{color:c.muted}}, y1:{position:'right', grid:{display:false}, ticks:{color:c.muted}}}}
});

// KPI values and sparklines
const sparkCharts = {};
function setText(id, val){ const el=document.getElementById(id); if(el) el.textContent=val; }
function sparkline(elId, series, color){
  const el = document.getElementById(elId);
  if(!el) return;
  const labels = series.map((_, i) => i + 1);
  let chart = sparkCharts[elId];
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = series;
    chart.data.datasets[0].borderColor = color;
    chart.update();
    return;
  }
  chart = new Chart(el,{
    type:'line',
    data:{
      labels: labels,
      datasets:[{
        data: series,
        borderColor: color,
        backgroundColor: 'transparent',
        pointRadius: 0,
        tension: 0.3
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{x:{display:false}, y:{display:false}},
      elements:{line:{borderWidth:2}}
    }
  });
  sparkCharts[elId] = chart;
}

function refreshKPIs(){
  const toxinAvg = avg(toxinsChart.data.datasets[0].data);
  const fishAvg = avg([92, 78, 84, 71, 88]);
  const o2Avg = avg(gasChart.data.datasets[0].data);
  const compliance = Math.max(0, Math.min(100, Math.round(100 - (toxinAvg-50)*0.8 - (100-fishAvg)*0.3)));

  setText('kpi-toxin', toxinAvg.toFixed(1));
  setText('kpi-fish', Math.round(fishAvg)+'%');
  setText('kpi-o2', o2Avg.toFixed(2)+' mg/L');
  setText('kpi-compliance', compliance+'%');

  sparkline('spark-toxin', toxinsChart.data.datasets[0].data, c.danger);
  sparkline('spark-fish', [92,88,86,90,87,85,84,83,82,81,80,79], c.ok);
  sparkline('spark-o2', gasChart.data.datasets[0].data, c.accent);
  sparkline('spark-comp', range(12).map((i)=> 90 + Math.sin(i/2)*5), c.accent2);
}

function avg(a){return a.reduce((s,v)=>s+v,0)/a.length}

// Watchlist table
const watchRows = [
  {site:'Alpha‑03', reg:'NA', toxin:72, fish:78, reef:55},
  {site:'Brine‑12', reg:'WP', toxin:69, fish:71, reef:50},
  {site:'Coralum‑07', reg:'IN', toxin:65, fish:82, reef:62},
  {site:'Dorsal‑02', reg:'EP', toxin:75, fish:68, reef:48},
  {site:'Eddy‑09', reg:'SA', toxin:62, fish:86, reef:60},
];
const tbody = document.querySelector('#watchlist tbody');
if (tbody){
  tbody.innerHTML = watchRows.map(r=>{
    const risk = r.toxin>70||r.fish<75||r.reef<55 ? 'High' : r.toxin>65||r.fish<80||r.reef<60 ? 'Med' : 'Low';
    return `<tr><td>${r.site}</td><td>${r.reg}</td><td>${r.toxin}</td><td>${r.fish}%</td><td>${r.reef}%</td><td>${risk}</td></tr>`;
  }).join('');
}

// Filters wiring (mocked adjustments)
const regionSel = document.getElementById('filter-region');
const yearRange = document.getElementById('filter-year');
const yearLabel = document.getElementById('year-label');
const yearBadge = document.getElementById('year-badge');
const scenarioSel = document.getElementById('filter-scenario');
const randomizeBtn = document.getElementById('btn-randomize');

function applyFilters(){
  const yr = parseInt(yearRange.value,10);
  if(yearLabel) yearLabel.textContent = yr;
  if(yearBadge) yearBadge.textContent = yr;
  const scale = scenarioSel.value === 'expansion' ? 1.1 : scenarioSel.value === 'mitigation' ? 0.95 : 1.0;
  // Adjust toxins baseline with year and scenario
  toxinsChart.data.datasets[0].data = months.map((_,i)=> 50 + i*2*scale + (yr-2041)*0.8 + Math.random()*2);
  toxinsChart.update();
  refreshKPIs();
}

if (regionSel && yearRange && scenarioSel){
  yearRange.addEventListener('input', applyFilters);
  regionSel.addEventListener('change', applyFilters);
  scenarioSel.addEventListener('change', applyFilters);
}

if (randomizeBtn){
  randomizeBtn.addEventListener('click', ()=>{
    // Randomize series a bit
    toxinsChart.data.datasets.forEach(ds=>{ ds.data = ds.data.map(v=> v + (Math.random()*6-3)); });
    tempChart.data.datasets.forEach(ds=>{ ds.data = ds.data.map(v=> v + (Math.random()*2-1)); });
    fishChart.data.datasets[0].data = fishChart.data.datasets[0].data.map(v=> v + (Math.random()*6-3));
    reefChart.data.datasets.forEach(ds=>{ ds.data = ds.data.map(v=> Math.max(0, Math.min(100, v + (Math.random()*8-4)))); });
    gasChart.data.datasets.forEach(ds=>{ ds.data = ds.data.map(v=> v + (Math.random()*2-1)); });
    energyChart.data.datasets[0].data = energyChart.data.datasets[0].data.map(v=> Math.max(3, v + Math.round(Math.random()*4-2)));
    occupancyChart.data.datasets[0].data = occupancyChart.data.datasets[0].data.map(v=> v + Math.round(Math.random()*6-3));
    [toxinsChart,tempChart,fishChart,reefChart,waterChart,gasChart,energyChart,occupancyChart].forEach(c=>c.update());
    refreshKPIs();
  });
}

applyFilters();
refreshKPIs();
