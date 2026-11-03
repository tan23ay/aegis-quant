/* AEGIS QUANT — local, synthetic product demonstration. No trade is submitted. */
(() => {
  'use strict';

  const RAW = window.AEGIS_DATA || {};
  const D = { ...RAW };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const first = (...values) => values.find(v => v !== undefined && v !== null && v !== '');
  const list = value => Array.isArray(value) ? value : [];
  const pretty = value => typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  const get = (obj, ...keys) => first(...keys.map(key => obj?.[key]), '—');
  // Adapt display-only fixture fields without deriving financial values.
  D.metrics=list(RAW.metrics).map(m=>({...m,direction:m.trend,note:m.detail}));
  D.equityRanges=Object.fromEntries(Object.entries(RAW.equityRanges||{}).map(([key,r])=>[key,{...r,value:r.end}]));
  D.overview={...RAW.overview,allocation:list(RAW.overview?.allocation).map(a=>({...a,visualShare:a.points}))};
  D.risk={...RAW.risk,overallStatus:'Within fixture limits',summary:'Recorded controls · no live risk service',overviewChecks:list(RAW.risk?.limits).map(l=>({...l,status:l.state})),checks:list(RAW.risk?.controls).map(c=>({...c,status:c.state})),limits:list(RAW.risk?.limits).map(l=>({...l,status:l.state,visualPercent:l.bar,note:`Recorded utilization: ${l.utilization}`})),breakers:list(RAW.risk?.controls).filter(c=>/stop|live/i.test(c.label)).map(c=>({...c,status:c.state}))};
  D.agents=list(RAW.agents).map(a=>({...a,latestTask:a.detail,scope:a.authority,updated:a.lastRun,responsibilities:[`Inputs: ${a.inputs}`,`Outputs: ${a.outputs}`,`Last decision: ${a.lastDecision}`,a.model]}));
  D.agentActivity=list(RAW.agentActivity).map(a=>({...a,message:a.title,status:a.type}));
  D.opportunities=list(RAW.opportunities).map(o=>({...o,symbol:o.instrument,route:`${o.buyVenue} → ${o.sellVenue}`}));
  D.audits=list(RAW.audits).map(a=>({...a,event:a.title,component:a.actor}));
  D.positions=list(RAW.positions).map(p=>({...p,entryPrice:p.averagePrice,markPrice:p.price,currency:list(RAW.instruments).find(i=>i.symbol===p.symbol)?.currency||'USD'}));
  D.trades=list(RAW.trades).map(t=>({...t,currency:t.market==='Indian equities'?'INR':'USD',realizedPnl:t.net}));
  D.pnl={...RAW.pnl,trades:D.trades};
  D.backtests=list(RAW.backtests).map(r=>({...r,description:r.limitations,assumptions:[r.assumptions,r.limitations,`Evidence: ${r.evidence}`,`Baseline: ${r.baseline}`]}));
  D.strategies=list(RAW.strategies).map(s=>({...s,rules:[s.description,`Baseline: ${s.baseline}`,`Simulation fidelity: ${s.fidelity}`,`Evidence: ${s.evidence}`,s.limitations]}));
  D.sizingPresets=list(RAW.sizingPresets).map(p=>({...p,netEdge:p.net,notional:p.capital,limitPrice:p.buyVwap}));
  D.comparisons=[...[...new Set(list(RAW.comparisons).map(c=>c.instrument))].map(symbol=>({id:symbol,symbol,market:'Crypto',currency:'USD',sizes:D.sizingPresets,venues:list(RAW.comparisons).filter(c=>c.instrument===symbol).map(c=>({...c,sellVwap:c.bid,fees:c.fee,depth:c.liquidity,status:c.eligibility}))})),...list(RAW.brokerComparisons).map(c=>({...c,symbol:c.instrument,sizes:c.presets}))];
  D.terminalFixtures=Array.isArray(RAW.terminalFixtures)?RAW.terminalFixtures:RAW.terminalFixtures?[{...RAW.terminalFixtures,symbol:RAW.terminalFixtures.instrument,presets:D.sizingPresets,orderBook:RAW.terminalFixtures,orderType:'Limit · recorded fixture',venue:'Synthetic venue A',timeInForce:'Not recorded'}]:[];
  D.health={...RAW.health,providers:[...list(first(RAW.health?.providers,RAW.health?.services,RAW.health?.feeds,RAW.feeds)).map(p=>({...p,description:p.detail,latency:'Not measured',lastSeen:RAW.snapshot?.label})),...list(RAW.integrations).map((p,i)=>({...p,id:`integration-${i}`,source:'Not connected',market:p.type,latency:'Not measured',freshness:'Not connected',lastSeen:RAW.snapshot?.label}))]};
  D.integrations=list(RAW.integrations).map(i=>({...i,nextStep:({'Market data':'Configure permitted provider access','Research':'Connect an inference service','Backend':'Implement durable backend services','Capability':'Separate future package · outside website scope'}[i.type]||'Separate implementation required')}));
  D.orders=list(RAW.orders).map(o=>({...o,timeline:[{time:o.time,title:humanizeOrder(o.status),detail:o.detail,status:o.status}]}));
  D.execution={...RAW.execution,orders:D.orders};
  function humanizeOrder(status){return String(status).replace(/_/g,' ').toLowerCase()+' · recorded fixture';}
  const paths = {
    arrow:'M7 17 17 7M7 7h10v10', chevron:'m9 5 7 7-7 7', close:'m6 6 12 12M6 18 18 6', search:'M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
    star:'m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.6-4.5 6.4-.9Z', check:'m5 12 4 4L19 6', shield:'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7l-9-4Zm-4 9 3 3 5-6',
    clock:'M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', lightning:'m13 2-9 12h7l-1 8 10-13h-7l1-7Z', info:'M12 11v6M12 7h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    pause:'M8 5v14M16 5v14', play:'m8 4 13 8-13 8V4Z', download:'M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4', eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    copy:'M9 9h12v12H9V9ZM15 5V3H3v12h2', filter:'M3 4h18l-7 8v7l-4 2v-9L3 4Z', activity:'M2 12h4l3-8 6 16 3-8h4', globe:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c5 6 5 12 0 18-5-6-5-12 0-18Z',
    bot:'M8 5V3m8 2V3M6 7h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3Zm2 6h.01M16 13h.01M8 17h8', layers:'m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5',
    terminal:'m4 6 5 6-5 6M12 18h8', bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4', chart:'M4 3v18h17M7 15l4-5 4 3 6-8', settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6 2 3 4-.2.2 4 3 2-3 2-.2 4-4-.2-2 3-2-3-4 .2-.2-4-3-2 3-2 .2-4 4 .2 2-3Z',
    warning:'m12 3 10 18H2L12 3ZM12 9v5m0 3h.01', refresh:'M20 7v5h-5M4 17v-5h5M5 7a8 8 0 0 1 13-2l2 3M4 16l2 3a8 8 0 0 0 13-2', target:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', wallet:'M20 7H5a3 3 0 0 1 0-6h13v6M3 4v16h18V7M16 12h5v5h-5v-5Z',
  };
  const icon = (name, className = '') => `<svg class="icon ${className}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.info}"/></svg>`;

  const pages = {
    overview:['Overview','Your trading workspace, at a glance.'],
    markets:['Markets','Explore instruments across markets and exchanges.'],
    comparison:['Venue comparison','Compare recorded prices and costs before you decide.'],
    scanner:['Opportunity scanner','Understand the edge. Check the guardrails.'],
    terminal:['Trade preview','Inspect a synthetic ticket before any live integration.'],
    agents:['Agent activity','See what each agent is responsible for and why.'],
    strategies:['Strategies','Explore the rules behind each strategy.'],
    backtests:['Backtest lab','Inspect recorded research examples and their assumptions.'],
    pnl:['P&L and ledger','Trace performance back to its underlying records.'],
    risk:['Risk center','A clear view of the limits that protect capital.'],
    execution:['Execution','Follow every stage of an example order.'],
    health:['System health','Inspect provider readiness, data quality, and dependencies.'],
  };
  const storeRead = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const storeWrite = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* A blocked store does not prevent preview. */ } };
  const state = {
    page: 'overview', range:'1M', market:'All markets', marketQuery:'', marketSort:'name', watchOnly:false,
    scannerFilter:'all', strategyFilter:'all', executionFilter:'all', healthFilter:'all',
    watchlist:storeRead('aegis-watchlist', ['BTC/USD','ETH/USD']),
    paused:storeRead('aegis-paused', false), density:storeRead('aegis-density','comfortable'),
    comparison:0, comparisonSize:0, terminalSymbol:0, terminalSide:'Buy', terminalSize:0,
    pnlCurrency:'', tourStep:0,
  };
  let lastFocus = null;
  let activeDialog = null;
  let toastTimer;
  const content = $('#page-content');
  const instruments = () => list(D.instruments);
  const opportunities = () => list(D.opportunities);
  const recorded = '<span class="badge neutral">Recorded example</span>';
  const pill = (text, type='neutral') => `<span class="badge ${esc(type)}">${esc(text)}</span>`;
  const isNegative = value => /^[−-]/.test(String(value));
  const direction = (item) => get(item,'changeDirection','direction') === 'negative' || isNegative(get(item,'change')) ? 'negative' : 'positive';
  const statusType = status => /blocked|block|fail|rejected|stale|critical|missing|disconnected|cost_negative|data_invalid|not_eligible|unavailable|not connected|not implemented/i.test(status) ? 'red' : /watch|pending|warning|limited|degraded|review|caution|simulation|unconfigured|candidate/i.test(status) ? 'amber' : /approved|healthy|pass|active|ready|filled|complete|normal|within|available|positive/i.test(status) ? 'green' : /negative/i.test(status) ? 'red' : 'neutral';
  const humanStatus=status=>({'SIMULATION_ELIGIBLE':'Simulation eligible','COST_NEGATIVE':'Cost negative','DATA_INVALID':'Data invalid','CANDIDATE':'Watch candidate','NOT_ELIGIBLE':'Not eligible','PARTIALLY_FILLED':'Partial fill','FILLED':'Filled','CANCELED':'Cancelled'}[status]||String(status).replace(/_/g,' '));
  const statusPill = status => pill(humanStatus(status), statusType(status));
  const snapshotText = get(D.snapshot,'displayTime','timestamp','asOf','label');
  const showFixtureNote = (text='All values are synthetic fixtures. No account is connected and no live order can be sent.') => `<div class="fixture-note">${icon('info')}<span>${esc(text)}</span></div>`;
  const section = (title, action='') => `<div class="section-heading"><h2>${esc(title)}</h2>${action}</div>`;
  const empty = (title, text, action='') => `<div class="empty-state">${icon('search')}<h3>${esc(title)}</h3><p>${esc(text)}</p>${action}</div>`;
  const panelHead = (title, subtitle='', aside='') => `<div class="panel-header"><div><h2 class="panel-title">${esc(title)}</h2>${subtitle ? `<p class="muted">${esc(subtitle)}</p>` : ''}</div>${aside}</div>`;
  const rowKey = obj => esc(get(obj,'id','symbol','name'));
  const currencyNote = `<span class="muted">USD report · ${esc(RAW.meta?.fx || 'Explicit synthetic reporting assumption')}</span>`;
  const table = (headers, rows, className='') => `<div class="table-wrap ${className}" tabindex="0" role="region" aria-label="Scrollable data table"><table><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  const details = (pairs) => `<dl class="detail-list">${pairs.filter(pair => pair[1] !== undefined && pair[1] !== null && pair[1] !== '—').map(([a,b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`;
  const options = (items, selected) => items.map(([value,label]) => `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`).join('');
  const metric = (item, index=0) => `<div class="metric-card"><div class="metric-label">${esc(get(item,'label','title'))}${icon(['wallet','chart','shield','lightning'][index % 4])}</div><div class="metric-value">${esc(get(item,'value','display'))}</div><div class="metric-note"><span class="${esc(first(item.direction,item.tone,'muted'))}">${esc(get(item,'change','note','subtext','detail'))}</span>${item.change && item.note ? `<span class="muted">${esc(item.note)}</span>` : ''}</div></div>`;

  function lineChart(points, opts={}) {
    const raw = list(points).map(p => typeof p === 'number' ? p : first(p.visualValue,p.y,p.value,0)).filter(p => typeof p === 'number' && Number.isFinite(p));
    const values = raw.length > 1 ? raw : [42,45,43,52,49,57,60,58,68,72,69,78,82,79,90];
    const w=900, h=260, left=8, top=20, bottom=24;
    const min=Math.min(...values), max=Math.max(...values), span=max-min || 1;
    const coords=values.map((v,i) => [left+(w-left*2)*i/(values.length-1), top+(h-top-bottom)*(1-(v-min)/span)]);
    const path=coords.map((p,i) => `${i?'L':'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const end=coords[coords.length-1];
    const id = `gradient-${Math.random().toString(36).slice(2,9)}`;
    return `<svg class="line-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opts.label || 'Illustrative synthetic performance curve')}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${opts.color || '#c1ef72'}" stop-opacity=".22"/><stop offset="100%" stop-color="${opts.color || '#c1ef72'}" stop-opacity="0"/></linearGradient></defs>${[40,94,148,202].map(y => `<line x1="0" x2="${w}" y1="${y}" y2="${y}" stroke="currentColor" opacity=".09" stroke-dasharray="3 5"/>`).join('')}<path d="${path} L${end[0]},${h-bottom} L${left},${h-bottom} Z" fill="url(#${id})"/><path d="${path}" stroke="${opts.color || '#c1ef72'}" stroke-width="2.5" fill="none" stroke-linejoin="round"/><circle cx="${end[0]}" cy="${end[1]}" r="4" fill="${opts.color || '#c1ef72'}"/><circle cx="${end[0]}" cy="${end[1]}" r="9" fill="${opts.color || '#c1ef72'}" opacity=".12"/></svg>`;
  }
  function sparkline(points, tone='positive') {
    const values=list(points).filter(p => typeof p === 'number');
    if(values.length < 2) return '<span class="muted">—</span>';
    const min=Math.min(...values), max=Math.max(...values), span=max-min||1;
    const path=values.map((v,i) => `${i?'L':'M'}${i*88/(values.length-1)},${30-(v-min)*26/span}`).join(' ');
    return `<svg class="sparkline ${tone}" viewBox="0 0 90 34" width="90" height="34" aria-label="Illustrative price trend" role="img"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
  }
  function candles(points) {
    const data=list(points).filter(v=>typeof v==='number');
    const values=data.length>8 ? data : [22,25,23,31,34,30,38,36,43,40,49,53,47,54,58,55,62,59,68,71,67,74,72,78];
    const min=Math.min(...values)-8, max=Math.max(...values)+8, scale=v=>235-(v-min)/(max-min)*210;
    return `<svg class="candle-chart" viewBox="0 0 900 260" role="img" aria-label="Synthetic illustration of price action. Candles are visual examples, not market data.">${[40,100,160,220].map(y=>`<line x1="0" x2="900" y1="${y}" y2="${y}" stroke="currentColor" opacity=".1" stroke-dasharray="3 5"/>`).join('')}${values.map((v,i)=>{const previous=values[i?i-1:0],x=14+i*870/values.length,y=scale(v),old=scale(previous),up=v>=previous;return `<line x1="${x}" x2="${x}" y1="${Math.min(y,old)-8-i%4}" y2="${Math.max(y,old)+8+i%3}" stroke="${up?'#a9df6c':'#f17f88'}"/><rect x="${x-5}" y="${Math.min(y,old)}" width="10" height="${Math.max(3,Math.abs(old-y))}" rx="1" fill="${up?'#a9df6c':'#f17f88'}"/>`;}).join('')}</svg>`;
  }

  function overviewPage() {
    const ms = list(first(D.metrics,D.overview?.metrics));
    const range = D.equityRanges?.[state.range] || Object.values(D.equityRanges || {})[0] || {};
    const allocation=list(first(D.overview?.allocation,D.allocation,D.risk?.allocation));
    const allocationRows=allocation.length ? allocation : [
      {label:'Crypto · USDT', value:'54%',visualShare:54,color:'#c1ef72'},
      {label:'US equities · USD',value:'28%',visualShare:28,color:'#7cb9c6'},
      {label:'Indian equities · INR',value:'18%',visualShare:18,color:'#ba9edd'},
    ];
    return `<div class="welcome-strip"><div><span class="eyebrow">A clearer view. A better decision.</span><p>Keep an eye on performance, opportunities, and the controls behind them.</p></div><button class="btn subtle small" data-action="tour">${icon('play')} Take a quick tour</button></div>
      <div class="metric-grid">${ms.slice(0,4).map(metric).join('')}</div>
      <div class="dashboard-grid"><section class="panel chart-panel">${panelHead('Portfolio equity', 'Synthetic curve · USD reporting assumption', '<span class="badge green">USD fixture</span>')}<div class="chart-summary"><div class="chart-value">${esc(get(range,'value','equity','endingValue'))}</div><span class="${String(get(range,'change')).startsWith('−')?'negative':'positive'}">${icon('arrow')}${esc(get(range,'change','return'))}</span><span class="muted">${esc(get(range,'period','label'))}</span></div><div class="chart-toolbar"><div class="legend"><span class="legend-dot lime"></span> Recorded equity</div><div class="chart-tabs">${Object.keys(D.equityRanges || {'1D':{},'1W':{},'1M':{},'3M':{}}).map(k=>`<button class="${state.range===k?'active':''}" data-action="range" data-value="${esc(k)}" aria-pressed="${state.range===k}">${esc(k)}</button>`).join('')}</div></div><div class="chart-wrap">${lineChart(range.points)}<div class="chart-axis">${list(range.labels).length ? list(range.labels).map(l=>`<span>${esc(l)}</span>`).join('') : '<span>Period start</span><span>Midpoint</span><span>Period end</span>'}</div></div><div class="panel-footnote">${icon('info')} ${esc(RAW.meta?.fx)}. Fixed example; no current exchange rate.</div></section>
      <div class="side-stack"><section class="panel allocation-panel">${panelHead('Risk posture','Guardrails at a glance','<span class="health-dot green"></span>')}<div class="risk-score"><div class="risk-score-icon">${icon('shield')}</div><div><strong>${esc(get(D.risk,'overallStatus','posture','status'))}</strong><p class="muted">${esc(get(D.risk,'summary','subtitle'))}</p></div></div>${riskMini()}<button class="text-link" data-page="risk">Open risk center ${icon('chevron')}</button></section><section class="panel allocation-panel">${panelHead('Example allocation','USD reporting weights · synthetic FX assumption')}<div class="allocation-bar">${allocationRows.map((a,i)=>`<span style="flex:${Number(a.visualShare || 1)};background:${esc(a.color || ['#c1ef72','#7cb9c6','#ba9edd'][i%3])}"></span>`).join('')}</div>${allocationRows.map((a,i)=>`<div class="stat-row"><span><i class="legend-dot" style="background:${esc(a.color||['#c1ef72','#7cb9c6','#ba9edd'][i%3])}"></i>${esc(get(a,'label','name','market'))}</span><strong class="mono">${esc(get(a,'value','weight','percentage'))}</strong></div>`).join('')}<p class="panel-footnote">${esc(RAW.meta?.fx)} · fixed fixture.</p></section></div></div>
      <div class="dashboard-grid lower-grid"><section class="panel">${panelHead('Opportunities worth a look','Ranked examples after fees and execution loss','<button class="text-link" data-page="scanner">View scanner '+icon('chevron')+'</button>')}${opportunityTable(opportunities().slice(0,4), true)}</section><section class="panel">${panelHead('Recent agent activity','Decision trail from the recorded snapshot',recorded)}${activityFeed(list(D.agentActivity).slice(0,4))}<div class="panel-footer"><button class="text-link" data-page="agents">Explore agents ${icon('chevron')}</button></div></section></div>`;
  }
  function riskMini() {
    const checks = list(first(D.risk?.overviewChecks,D.risk?.checks,D.risk?.limits)).slice(0,3);
    return `<div class="risk-mini">${checks.map(c=>`<div class="stat-row"><span>${esc(get(c,'label','name'))}</span>${statusPill(get(c,'status','value'))}</div>`).join('')}</div>`;
  }
  function instrumentCell(i) {
    const symbol=get(i,'symbol');
    const letters=String(symbol).replace(/[^A-Za-z]/g,'').slice(0,2);
    return `<div class="symbol-cell"><span class="market-icon ${i.market==='Crypto'?'crypto':''}">${esc(letters)}</span><div><strong class="symbol">${esc(symbol)}</strong><span class="muted">${esc(get(i,'name'))}</span></div></div>`;
  }
  function marketsPage() {
    const markets=['All markets',...new Set(instruments().map(i=>i.market).filter(Boolean))];
    let rows=instruments().filter(i=>(state.market==='All markets'||i.market===state.market)&&(!state.watchOnly||state.watchlist.includes(i.symbol))&&`${i.symbol} ${i.name} ${i.venue}`.toLowerCase().includes(state.marketQuery.toLowerCase()));
    rows.sort((a,b)=>String(state.marketSort==='symbol'?a.symbol:a.name).localeCompare(String(state.marketSort==='symbol'?b.symbol:b.name)));
    return `<div class="toolbar"><div class="segmented">${markets.map(m=>`<button class="${state.market===m?'active':''}" data-action="market-filter" data-value="${esc(m)}">${esc(m)}</button>`).join('')}</div><button class="btn subtle small ${state.watchOnly?'selected':''}" data-action="watch-filter" aria-pressed="${state.watchOnly}">${icon('star')} My watchlist ${pill(String(state.watchlist.filter(s=>instruments().some(i=>i.symbol===s)).length))}</button></div><div class="market-summary feature-grid">${markets.slice(1).map(m=>{const sample=instruments().find(i=>i.market===m);return `<div class="panel compact-panel"><span class="eyebrow">${esc(m)}</span><h3>${esc(get(sample,'session'))}</h3><p class="muted">${esc(get(sample,'currency'))} · ${esc(get(sample,'venue'))}</p></div>`;}).join('')}</div><section class="panel">${panelHead('Market explorer',`${rows.length} instruments · original quote currency preserved`,'<span class="badge neutral">Synthetic quotes</span>')}<div class="toolbar table-toolbar"><label class="search-field">${icon('search')}<input id="market-search" type="search" placeholder="Find a symbol or company" value="${esc(state.marketQuery)}" aria-label="Search instruments"></label><label class="inline-field"><span class="muted">Sort</span><select class="input" id="market-sort">${options([['name','Name A–Z'],['symbol','Symbol A–Z']],state.marketSort)}</select></label></div>${rows.length ? table(['','Instrument','Market','Price','Change','Trend','Spread','Venue',''],rows.map(i=>`<tr><td><button class="watch-star ${state.watchlist.includes(i.symbol)?'active':''}" data-action="watch" data-symbol="${esc(i.symbol)}" aria-label="${state.watchlist.includes(i.symbol)?'Remove':'Add'} ${esc(i.symbol)} ${state.watchlist.includes(i.symbol)?'from':'to'} watchlist" aria-pressed="${state.watchlist.includes(i.symbol)}">${icon('star')}</button></td><td>${instrumentCell(i)}</td><td><span class="chip">${esc(i.market)}</span></td><td class="mono">${esc(get(i,'price'))}<small class="muted currency-label">${esc(i.currency)}</small></td><td class="mono ${direction(i)}">${esc(i.change)}</td><td>${sparkline(i.points,direction(i))}</td><td class="mono">${esc(get(i,'spread'))}</td><td>${esc(get(i,'venue'))}</td><td><button class="btn subtle small" data-action="instrument" data-symbol="${esc(i.symbol)}">Details ${icon('chevron')}</button></td></tr>`)):empty('No instruments match','Try another market, symbol, or watchlist filter.','<button class="btn subtle" data-action="reset-markets">Clear filters</button>')}<div class="panel-footnote">${icon('clock')} All quotes share a fixed example snapshot. Quote age does not imply a live feed.</div></section>`;
  }
  function opportunityTable(items,compact=false) {
    return items.length ? table(compact?['Instrument / route','Net edge','Decision','']:['Instrument / route','Size','Gross edge','Fees / execution loss','Net edge','Decision',''],items.map(o=>`<tr><td><div class="opportunity-symbol"><strong>${esc(get(o,'symbol','instrument'))}</strong><span class="muted">${esc(get(o,'route','venues'))}</span></div></td>${compact?'':`<td class="mono">${esc(get(o,'quantity','size'))}</td><td class="mono">${esc(get(o,'grossEdge'))}</td><td class="mono">${esc(get(o,'fees'))}<small class="muted">Loss: ${esc(get(o,'executionLoss'))}</small></td>`}<td class="mono ${isNegative(o.netEdge)?'negative':o.statusGroup==='approved'?'positive':'muted'}">${esc(get(o,'netEdge'))}</td><td>${statusPill(get(o,'status'))}</td><td><button class="btn subtle small icon-button" data-action="opportunity" data-id="${rowKey(o)}" aria-label="Inspect ${esc(get(o,'symbol','instrument'))} opportunity">${icon('chevron')}</button></td></tr>`)) : empty('No opportunities in this view','Select another decision filter to explore the fixture.');
  }
  function scannerPage() {
    const rows=opportunities().filter(o=>state.scannerFilter==='all'||o.statusGroup===state.scannerFilter);
    const counts = list(D.scanner?.metrics);
    return `${showFixtureNote('Recorded opportunities use executable VWAP, known fees, execution loss, and explicit blocking reasons. These are synthetic examples.')}<div class="metric-grid">${(counts.length?counts:[{label:'Opportunities reviewed',value:String(opportunities().length),note:'Fixed example set'},{label:'Approved examples',value:String(opportunities().filter(o=>o.statusGroup==='approved').length),note:'Guardrails passed',direction:'positive'},{label:'Blocked examples',value:String(opportunities().filter(o=>o.statusGroup==='blocked').length),note:'Reason always recorded'},{label:'Evaluation mode',value:'Preview',note:'No live routing'}]).map(metric).join('')}</div><section class="panel">${panelHead('Opportunity queue','Net edge includes expected costs','<button class="btn subtle small" data-action="export-view">'+icon('download')+' Export examples</button>')}<div class="toolbar table-toolbar"><div class="segmented">${[['all','All decisions'],['approved','Approved'],['watch','Watch'],['blocked','Blocked']].map(([k,l])=>`<button class="${state.scannerFilter===k?'active':''}" data-action="scanner-filter" data-value="${k}">${l}</button>`).join('')}</div><span class="muted">${rows.length} examples</span></div>${opportunityTable(rows)}</section><div class="feature-grid explanatory-grid">${[['layers','Executable price','Order-book depth and venue minimums shape the example VWAP.'],['wallet','Every cost visible','Inspect fees, execution loss, and residual exposure in each decision.'],['shield','A reason for every block','Freshness, depth, quantity rules, and risk limits are checked before approval.']].map(([ico,title,text])=>`<div class="panel compact-panel">${icon(ico)}<h3>${title}</h3><p class="muted">${text}</p></div>`).join('')}</div>`;
  }
  function activityFeed(items) {
    return `<div class="activity-feed">${items.map((a,i)=>`<button class="activity-item" data-action="activity" data-index="${i}"><span class="avatar">${icon(get(a,'icon')==='—'?'bot':a.icon)}</span><span class="activity-copy"><strong>${esc(get(a,'agent','name','title'))}</strong><span>${esc(get(a,'message','action','summary'))}</span><small class="muted">${esc(get(a,'time','timestamp'))}</small></span><span class="health-dot ${statusType(get(a,'status','type'))}"></span></button>`).join('')}</div>`;
  }
  function comparisonRows() {
    return list(first(D.comparisons,D.sizingPresets));
  }
  function comparisonPage() {
    const cases=comparisonRows(), current=cases[state.comparison] || {};
    const sizes=list(first(current.sizes,current.presets,D.sizingPresets));
    const selected=sizes[state.comparisonSize] || current;
    if(current.market&&current.market!=='Crypto')return brokerComparisonPage(current,selected,cases,sizes);
    const quotes=list(first(selected.venues,selected.quotes,current.venues,current.quotes));
    return `${showFixtureNote('Choose a recorded size to inspect its precomputed VWAP and net edge. The venue reference table is a separate 0.080 BTC snapshot.')}<div class="toolbar"><label class="inline-field"><span class="muted">Instrument</span><select class="input" id="comparison-case">${options(cases.map((c,i)=>[i,get(c,'symbol','instrument','label','name')]),state.comparison)}</select></label><div class="segmented">${sizes.map((s,i)=>`<button class="${state.comparisonSize===i?'active':''}" data-action="comparison-size" data-index="${i}">${esc(get(s,'label','quantity','size'))}</button>`).join('')}</div></div><div class="metric-grid">${[{label:'Comparison size',value:get(selected,'quantity','size','label'),note:get(current,'currency')},{label:'Buy executable VWAP',value:get(selected,'buyVwap','bestBuyVwap'),note:'Selected size scenario'},{label:'Sell executable VWAP',value:get(selected,'sellVwap','bestSellVwap'),note:'Selected size scenario'},{label:'Net estimated edge',value:get(selected,'netEdge'),note:get(selected,'status','reason'),direction:isNegative(selected.netEdge)?'negative':'positive'}].map(metric).join('')}</div><section class="panel">${panelHead('Selected size · cost record','Each preset has an independent recorded estimate',statusPill(get(selected,'status')))}${details([['Gross edge',get(selected,'gross')],['Fees',get(selected,'fees')],['Execution loss',get(selected,'executionLoss')],['Recorded uncertainty range',get(selected,'uncertainty')],['Capital requirement',get(selected,'capital')]])}<div class="panel-footer"><span class="muted">A positive estimate does not guarantee a positive outcome.</span><button class="btn primary small" data-action="comparison-detail">Inspect decision ${icon('chevron')}</button></div></section><section class="panel">${panelHead('Venue reference snapshot','BTC/USD · 0.080 BTC base fixture · independent of selected size',pill('Synthetic quotes'))}${quotes.length ? table(['Venue','Buy VWAP','Reference bid','Fee','Effective buy cost','Depth','Quote age'],quotes.map(q=>`<tr><td><strong>${esc(get(q,'venue','name'))}</strong></td><td class="mono">${esc(get(q,'buyVwap'))}</td><td class="mono">${esc(get(q,'bid'))}</td><td class="mono">${esc(get(q,'fees','fee'))}</td><td class="mono">${esc(get(q,'effectiveCost'))}</td><td>${esc(get(q,'depth','liquidity'))}</td><td>${esc(get(q,'quoteAge'))}</td></tr>`)) : empty('No venue snapshot','Only the size scenario is included in this fixture.')}</section><div class="feature-grid explanatory-grid"><div class="panel compact-panel">${icon('layers')}<h3>Depth before headline price</h3><p class="muted">The executable VWAP reflects the selected size, not just the top quote.</p></div><div class="panel compact-panel">${icon('clock')}<h3>Freshness is a requirement</h3><p class="muted">A stale snapshot blocks an opportunity even when the spread looks attractive.</p></div><div class="panel compact-panel">${icon('shield')}<h3>Keep currency boundaries clear</h3><p class="muted">This comparison contains BTC/USD fixtures only. No FX conversion is needed.</p></div></div>`;
  }
  function brokerComparisonPage(current,selected,cases,sizes) {
    const providers=list(selected.providers);
    return `${showFixtureNote('Broker research uses a shared reference quote and synthetic cost assumptions. The session is closed in this fixture; no executable order or sell-side edge is implied.')}<div class="toolbar"><label class="inline-field"><span class="muted">Instrument</span><select class="input" id="comparison-case">${options(cases.map((c,i)=>[i,`${get(c,'symbol','instrument')} · ${c.currency}`]),state.comparison)}</select></label><div class="segmented">${sizes.map((s,i)=>`<button class="${state.comparisonSize===i?'active':''}" data-action="comparison-size" data-index="${i}">${esc(get(s,'label','quantity'))}</button>`).join('')}</div></div><div class="metric-grid">${[{label:'Research size',value:get(selected,'quantity'),note:current.currency},{label:'Shared reference quote',value:get(selected,'referencePrice'),note:'Prior-session synthetic quote'},{label:'Example effective buy cost',value:get(selected,'effectiveBuyCost'),note:get(selected,'bestBroker')},{label:'Comparison mode',value:'Research only',note:'Closed-session fixture'}].map(metric).join('')}</div><section class="panel">${panelHead('Broker cost comparison',`${current.symbol} · ${current.currency} · independent recorded size preset`,statusPill(get(selected,'status')))}${table(['Broker','Reference quote','Commission','Assumed charges','Execution loss','Effective buy cost'],providers.map(p=>`<tr><td><strong>${esc(p.name)}</strong>${p.name===selected.bestBroker?'<small class="positive">Recorded preference</small>':''}</td><td class="mono">${esc(p.referencePrice)}</td><td class="mono">${esc(p.commission)}</td><td class="mono">${esc(p.charges)}</td><td class="mono">${esc(p.executionLoss)}</td><td class="mono">${esc(get(p,'effectiveBuyCost','totalCost'))}</td></tr>`))}<div class="panel-footnote">${icon('info')} Effective buy cost includes recorded notional, commission, assumed charges, and execution loss. All amounts are ${esc(current.currency)}; no FX conversion.</div><div class="panel-footer"><span class="muted">${esc(get(selected,'eligibility'))}</span><button class="btn primary small" data-action="comparison-detail">Inspect assumptions ${icon('chevron')}</button></div></section><div class="feature-grid explanatory-grid"><section class="panel compact-panel">${icon('chart')}<h3>One reference quote</h3><p class="muted">The brokers share a recorded reference price. Cost differences reflect synthetic assumptions only.</p></section><section class="panel compact-panel">${icon('wallet')}<h3>Keep charges explicit</h3><p class="muted">Commissions, assumed charges, and execution loss are listed separately for each size.</p></section><section class="panel compact-panel">${icon('shield')}<h3>Research stays in research</h3><p class="muted">Closed session, missing account eligibility, and unverified current fee rules prevent execution.</p></section></div>`;
  }
  function terminalFixtures() { return list(D.terminalFixtures); }
  function terminalPage() {
    const fixtures=terminalFixtures(), f=fixtures[state.terminalSymbol] || {}, inst=instruments().find(i=>i.symbol===f.symbol)||instruments()[state.terminalSymbol]||{};
    const presets=list(first(f.presets,f.sizes,D.sizingPresets));
    const selected=presets[state.terminalSize]||f;
    return `${showFixtureNote('This ticket is a synthetic buy preview. There is no brokerage connection, order submission, or live execution.')}<div class="split-layout terminal-layout"><section class="panel chart-panel">${panelHead(get(inst,'symbol'),get(inst,'name'),'<span class="badge neutral">Illustrative chart</span>')}<div class="chart-summary"><span class="chart-value">${esc(get(inst,'price'))}</span><span class="${direction(inst)}">${esc(get(inst,'change'))}</span><span class="muted">${esc(get(inst,'currency'))}</span></div><div class="chart-wrap">${candles(inst.points)}<div class="chart-axis"><span>Visual example</span><span>Fixed snapshot</span></div></div><div class="terminal-depth"><div>${section('Recorded book','<span class="badge neutral">Fixture</span>')}${orderBook(first(f.orderBook,f.book))}</div><div>${section('Instrument context')}${details([['Venue',get(inst,'venue')],['Session',get(inst,'session')],['Spread',get(inst,'spread')],['Quote age',get(inst,'quoteAge')],['Source',get(inst,'provenance')]])}</div></div></section><section class="panel ticket-panel">${panelHead('Preview ticket','Select from recorded example presets',pill('Preview only','amber'))}<div class="ticket-body"><label class="field">Instrument<select class="input" id="terminal-symbol">${options(fixtures.map((x,i)=>[i,get(x,'symbol','instrument')]),state.terminalSymbol)}</select></label><div class="segmented ticket-side"><button class="active" data-action="terminal-side" data-value="Buy">Buy fixture</button><button disabled title="No sell ticket is included in the fixture">Sell unavailable</button></div><label class="field">Recorded size preset<select class="input" id="terminal-size">${options(presets.length?presets.map((p,i)=>[i,get(p,'label','quantity','size')]):[[0,get(f,'quantity','size')]],state.terminalSize)}</select></label><div class="ticket-type"><span class="muted">Order type</span><span class="chip">${esc(get(f,'orderType','type'))}</span></div>${details([['Example quantity',get(selected,'quantity','size')],['Buy executable VWAP',get(selected,'buyVwap')],['Capital requirement',get(selected,'capital')],['Scenario fees · both legs',get(selected,'fees')],['Recorded size outcome',get(selected,'status')]])}<div class="ticket-guard">${icon('shield')}<p>Guardrails and exact cost records appear in the next step. This preview cannot send an order.</p></div><button class="btn primary full-width" data-action="preview-ticket">Inspect buy preview ${icon('arrow')}</button></div></section></div><section class="panel">${panelHead('Example positions','Original quotes · P&L in USD reporting assumption',currencyNote)}${positionsTable(list(D.positions))}</section>`;
  }
  function orderBook(book) {
    const bids=list(book?.bids), asks=list(book?.asks);
    if(!bids.length&&!asks.length) return '<p class="muted">Detailed depth is not included in this preset. Open venue comparison to inspect recorded VWAP.</p>';
    return table(['Side','Price','Quantity'],[...asks.slice(0,3).map(r=>`<tr><td class="negative">Ask</td><td class="mono">${esc(get(r,'price'))}</td><td class="mono">${esc(get(r,'quantity','size'))}</td></tr>`),...bids.slice(0,3).map(r=>`<tr><td class="positive">Bid</td><td class="mono">${esc(get(r,'price'))}</td><td class="mono">${esc(get(r,'quantity','size'))}</td></tr>`)]);
  }
  function positionsTable(items) {
    return items.length ? table(['Instrument','Quantity','Entry / cost basis','Mark price','P&L · USD report','Quote currency'],items.map(p=>`<tr><td><strong>${esc(get(p,'symbol','instrument'))}</strong></td><td class="mono">${esc(get(p,'quantity','size'))}</td><td class="mono">${esc(get(p,'entryPrice','entry'))}</td><td class="mono">${esc(get(p,'markPrice','mark'))}</td><td class="mono ${isNegative(get(p,'unrealizedPnl','pnl'))?'negative':'positive'}">${esc(get(p,'unrealizedPnl','pnl'))}${p.currency==='INR'?'<small class="muted">Synthetic FX translation</small>':''}</td><td>${esc(get(p,'currency'))}</td></tr>`)) : empty('No positions in this example','Open the execution screen to inspect recorded orders.');
  }
  function agentsPage() {
    return `${showFixtureNote('Agents and their decisions are recorded product examples. No LLM, autonomous worker, or strategy process is running.')}<div class="agent-grid">${list(D.agents).map((a,i)=>`<section class="panel agent-card"><div class="agent-card-top"><span class="agent-icon">${icon(first(a.icon,'bot'))}</span>${statusPill(get(a,'status'))}</div><h2>${esc(get(a,'name','label'))}</h2><p class="agent-role">${esc(get(a,'role','description'))}</p><div class="agent-task"><span class="eyebrow">LATEST RECORDED TASK</span><p>${esc(get(a,'latestTask','task','lastAction'))}</p></div>${details([['Scope',get(a,'scope')],['Recorded run',get(a,'updated','lastSeen','timestamp')]])}<button class="btn subtle small full-width" data-action="agent" data-index="${i}">Inspect agent ${icon('chevron')}</button></section>`).join('')}</div><section class="panel">${panelHead('Decision trail','Why the example system reached its conclusion',recorded)}${activityFeed(list(D.agentActivity))}</section>`;
  }
  function strategiesPage() {
    const items=list(D.strategies).filter(s=>state.strategyFilter==='all'||String(get(s,'market')).toLowerCase().includes(state.strategyFilter));
    return `${showFixtureNote('Strategy cards are recorded examples of the design. Opening a card shows rules and assumptions; it does not activate trading.')}<div class="toolbar"><div class="segmented">${[['all','All strategies'],['crypto','Crypto'],['equities','Equities']].map(([k,l])=>`<button class="${state.strategyFilter===k?'active':''}" data-action="strategy-filter" data-value="${k}">${l}</button>`).join('')}</div><span class="muted">${items.length} strategies</span></div><div class="feature-grid strategy-grid">${items.map(s=>`<section class="panel strategy-card"><div class="agent-card-top"><span class="agent-icon">${icon(first(s.icon,'layers'))}</span>${statusPill(get(s,'status'))}</div><span class="eyebrow">${esc(get(s,'market','category'))}</span><h2>${esc(get(s,'name'))}</h2><p class="muted">${esc(get(s,'description','summary'))}</p><div class="strategy-stats">${details([['Recorded return',get(s,'return','pnl','performance')],['Max drawdown',get(s,'maxDrawdown','drawdown')],['Simulation fidelity',get(s,'fidelity')],['Baseline',get(s,'baseline')]])}</div><button class="btn subtle small full-width" data-action="strategy" data-id="${rowKey(s)}">Explore rules ${icon('chevron')}</button></section>`).join('')||empty('No matching strategy','Try All strategies to view the example library.')}</div>`;
  }
  function backtestsPage() {
    const rows=list(first(D.backtests?.runs,D.backtests));
    return `${showFixtureNote('Results are fixed synthetic examples, not backtests run by this website. Each record includes dataset, costs, and known assumptions.')}<div class="research-callout panel"><span class="agent-icon">${icon('target')}</span><div><h2>Evidence before execution</h2><p class="muted">Open a run to inspect its reproducibility metadata, drawdown, and cost assumptions.</p></div><button class="btn subtle small" data-action="backtest-method">Research checklist ${icon('chevron')}</button></div><section class="panel">${panelHead('Research runs','Recorded examples with explicit cost assumptions','<span class="badge neutral">No live research jobs</span>')}${rows.length ? table(['Strategy / run','Period','Return','Max drawdown','Sharpe','Trades','Status',''],rows.map(r=>`<tr><td><div class="opportunity-symbol"><strong>${esc(get(r,'strategy','name'))}</strong><span class="muted mono">${esc(get(r,'id','runId'))}</span></div></td><td>${esc(get(r,'period','dateRange'))}</td><td class="mono ${isNegative(get(r,'return','totalReturn'))?'negative':'positive'}">${esc(get(r,'return','totalReturn'))}</td><td class="mono">${esc(get(r,'maxDrawdown','drawdown'))}</td><td class="mono">${esc(get(r,'sharpe','sharpeRatio'))}</td><td class="mono">${esc(get(r,'trades','tradeCount'))}</td><td>${statusPill(get(r,'status'))}</td><td><button class="btn subtle small" data-action="backtest" data-id="${rowKey(r)}">Inspect ${icon('chevron')}</button></td></tr>`)):empty('No research runs included','This fixture does not contain a research result.')}</section><div class="feature-grid explanatory-grid">${[['layers','Data provenance','Trace each result to a versioned dataset and recorded period.'],['wallet','Realistic cost assumptions','Fees, slippage, and execution loss remain visible.'],['shield','Out-of-sample context','Treat a result as evidence for further review, not a forecast.']].map(([ico,title,text])=>`<section class="panel compact-panel">${icon(ico)}<h3>${title}</h3><p class="muted">${text}</p></section>`).join('')}</div>`;
  }
  function pnlPage() {
    const currencies=[...new Set(D.trades.map(t=>t.currency))];
    if(!state.pnlCurrency)state.pnlCurrency=currencies[0]||'USD';
    const trades=D.trades.filter(t=>t.currency===state.pnlCurrency),postings=list(D.ledger).filter(l=>l.currency===state.pnlCurrency);
    return `${showFixtureNote(`Portfolio totals use a fixed USD reporting scenario: ${RAW.meta?.fx}. Native-currency trade records below remain separate.`)}<div class="metric-grid">${list(D.pnl.metrics).map(m=>metric({...m,note:'USD reporting · synthetic FX',direction:isNegative(m.value)?'negative':'positive'})).join('')}</div><div class="toolbar"><div class="segmented">${currencies.map(c=>`<button class="${state.pnlCurrency===c?'active':''}" data-action="pnl-currency" data-value="${esc(c)}">${esc(c)} native trades</button>`).join('')}</div><span class="muted">No native-currency trade aggregation</span></div><section class="panel">${panelHead('Trade outcome records','Gross result, fees, and net result in original currency','<button class="btn subtle small" data-action="export-ledger">'+icon('download')+' Export records</button>')}${trades.length ? table(['Time','Instrument','Quantity','Gross result','Fees','Net result','Currency',''],trades.map(t=>`<tr><td class="mono">${esc(get(t,'time','timestamp'))}</td><td><strong>${esc(get(t,'symbol','instrument'))}</strong></td><td class="mono">${esc(get(t,'quantity','size'))}</td><td class="mono ${isNegative(t.gross)?'negative':'positive'}">${esc(get(t,'gross'))}</td><td class="mono">${esc(get(t,'fees'))}</td><td class="mono ${isNegative(t.net)?'negative':'positive'}">${esc(get(t,'net'))}</td><td>${esc(t.currency)}</td><td><button class="btn subtle small" data-action="trade" data-id="${rowKey(t)}">${icon('eye')}<span class="sr-only">Inspect trade</span></button></td></tr>`)):empty('No trades for this currency','Choose another currency to inspect its recorded trades.')}<div class="panel-footnote">${icon('info')} ${esc(D.pnl.note)}</div></section><section class="panel">${panelHead('Accounting postings','Balanced synthetic posting pairs · no durable ledger',statusPill(D.pnl.reconciliation?.status||'Recorded fixture'))}${postings.length?table(['Event','Account','Debit','Credit','Currency','Counterpart'],postings.map(l=>`<tr><td class="mono">${esc(l.event)}</td><td>${esc(l.account)}</td><td class="mono">${esc(l.debit==='—'?'No debit':l.debit)}</td><td class="mono">${esc(l.credit==='—'?'No credit':l.credit)}</td><td>${esc(l.currency)}</td><td>${esc(l.counterpart)}</td></tr>`)):empty('No postings supplied in this currency','The native trade outcome is provided above. This fixture includes USD posting pairs only.')}</section><section class="panel">${panelHead('Open positions','Original quotes · P&L in USD reporting assumption',currencyNote)}${positionsTable(D.positions)}</section>`;
  }
  function riskPage() {
    const r=D.risk||{}, limits=list(r.limits),checks=list(r.checks);
    return `<section class="risk-banner panel"><span class="risk-score-icon">${icon('shield')}</span><div><span class="eyebrow">CAPITAL PROTECTION</span><h2>${state.paused?'Example workspace paused':esc(get(r,'overallStatus','posture','status'))}</h2><p class="muted">${state.paused?'A local preview preference. No live process or trading engine is affected.':esc(get(r,'summary','subtitle'))}</p></div><button class="btn ${state.paused?'primary':'subtle'}" data-action="pause">${icon(state.paused?'play':'pause')}${state.paused?'Resume preview':'Pause preview'}</button></section>${showFixtureNote('Risk readings and breakers are synthetic fixtures. Pause changes only this browser’s preview state.')}<div class="dashboard-grid"><section class="panel">${panelHead('Risk limits','Usage shown against recorded example limits',pill('Fixed snapshot'))}${limits.length?`<div class="limits-list">${limits.map(l=>`<div class="limit-item"><div class="stat-row"><strong>${esc(get(l,'label','name'))}</strong>${statusPill(get(l,'status'))}</div><div class="stat-row"><span class="mono">${esc(get(l,'value','current','used'))}</span><span class="muted">Limit: ${esc(get(l,'limit','maximum'))}</span></div><div class="progress-track"><div class="progress-fill ${statusType(get(l,'status'))}" style="width:${Math.max(0,Math.min(100,Number(first(l.visualPercent,l.progress,l.utilizationVisual,0))))}%"></div></div><p class="muted">${esc(get(l,'note','description'))}</p></div>`).join('')}</div>`:details([['Per-order notional',get(r,'maxOrderNotional')],['Maximum leverage',get(r,'maxLeverage')],['Daily loss stop',get(r,'dailyLossLimit')]])}</section><div class="side-stack"><section class="panel">${panelHead('Pre-trade checks','A reason is recorded for every result')}${checks.length?`<div class="check-list">${checks.map(c=>`<div class="check-item">${icon(statusType(get(c,'status'))==='green'?'check':'warning')}<div><strong>${esc(get(c,'label','name'))}</strong><p class="muted">${esc(get(c,'detail','note','reason'))}</p></div>${statusPill(get(c,'status'))}</div>`).join('')}</div>`:riskMini()}</section><section class="panel">${panelHead('Circuit breakers','Only simulated status is displayed')}${details(list(first(r.breakers,r.circuitBreakers)).map(b=>[get(b,'label','name'),get(b,'status')]))}<button class="text-link" data-action="risk-method">How the controls work ${icon('chevron')}</button></section></div></div><section class="panel">${panelHead('Audit trail','Inspect the context behind a recorded event',recorded)}${auditTable(list(first(r.audit,D.audits)))}</section>`;
  }
  function auditTable(items) {
    return items.length?table(['Time','Event','Component','Result',''],items.map(a=>`<tr><td class="mono">${esc(get(a,'time','timestamp'))}</td><td><strong>${esc(get(a,'event','message','action'))}</strong></td><td>${esc(get(a,'component','agent'))}</td><td>${statusPill(get(a,'status','result'))}</td><td><button class="btn subtle small" data-action="audit" data-id="${rowKey(a)}">Details</button></td></tr>`)):empty('No audit events in this view','Inspect an opportunity to see its recorded checks and decision trail.');
  }
  function executionPage() {
    const e=D.execution||{}, orders=list(first(e.orders,D.orders)), rows=orders.filter(o=>state.executionFilter==='all'||String(get(o,'status')).toLowerCase().includes(state.executionFilter));
    const metrics=list(e.metrics);
    return `${showFixtureNote('These are recorded order lifecycle examples. No exchange gateway is connected and no orders are sent by this site.')}<div class="metric-grid">${(metrics.length?metrics:[{label:'Example orders',value:String(orders.length),note:'Recorded fixture set'},{label:'Routing mode',value:'Preview',note:'Gateway not connected'},{label:'Fill tracking',value:'Recorded',note:'No live updates'},{label:'Audit trail',value:'Visible',note:'Inspect each lifecycle'}]).map(metric).join('')}</div><section class="panel">${panelHead('Order lifecycle','From intention to recorded outcome',recorded)}<div class="toolbar table-toolbar"><div class="segmented">${[['all','All orders'],['filled','Filled'],['rejected','Rejected'],['cancel','Cancelled']].map(([k,l])=>`<button class="${state.executionFilter===k?'active':''}" data-action="execution-filter" data-value="${k}">${l}</button>`).join('')}</div><span class="muted">${rows.length} examples</span></div>${rows.length?table(['Order / instrument','Side','Filled quantity','Quantity','Price','Venue','Status',''],rows.map(o=>`<tr><td><div class="opportunity-symbol"><strong>${esc(get(o,'symbol','instrument'))}</strong><span class="muted mono">${esc(get(o,'id','orderId'))}</span></div></td><td>${pill(get(o,'side'),/buy/i.test(get(o,'side'))?'green':'neutral')}</td><td>${esc(get(o,'filled'))}</td><td class="mono">${esc(get(o,'quantity','size'))}</td><td class="mono">${esc(get(o,'price','limitPrice','fillPrice'))}</td><td>${esc(get(o,'venue'))}</td><td>${statusPill(get(o,'status'))}</td><td><button class="btn subtle small" data-action="order" data-id="${rowKey(o)}">Timeline ${icon('chevron')}</button></td></tr>`)):empty('No orders match this status','Select All orders to view every example.')}<div class="panel-footnote">${icon('shield')} An approval in a fixture does not authorize a live order.</div></section>`;
  }
  function healthPage() {
    const h=D.health||{}, providers=list(first(h.providers,h.services,D.feeds)),integrations=list(D.integrations),rows=providers.filter(p=>state.healthFilter==='all'||statusType(get(p,'status'))===state.healthFilter);
    return `${showFixtureNote('Health cards describe a recorded architecture example. Integrations, data adapters, authentication, and live monitoring are not connected here.')}<div class="toolbar"><div class="segmented">${[['all','All components'],['green','Healthy examples'],['amber','Needs attention'],['red','Blocked examples']].map(([k,l])=>`<button class="${state.healthFilter===k?'active':''}" data-action="health-filter" data-value="${k}">${l}</button>`).join('')}</div><button class="btn subtle small" data-action="health-refresh">${icon('refresh')} Recheck snapshot</button></div><div class="health-grid feature-grid">${rows.map(p=>`<section class="panel health-card"><div class="agent-card-top"><span class="agent-icon">${icon(first(p.icon,'globe'))}</span>${statusPill(get(p,'status'))}</div><h2>${esc(get(p,'name','provider','component'))}</h2><p class="muted">${esc(get(p,'description','role','market'))}</p>${details([['Recorded latency',get(p,'latency','p95')],['Freshness',get(p,'quoteAge','freshness')],['Source',get(p,'source','feed')],['Last observation',get(p,'lastSeen','timestamp')]])}<button class="text-link" data-action="provider" data-id="${rowKey(p)}">Inspect component ${icon('chevron')}</button></section>`).join('')||empty('No components match','Choose All components to view the recorded system.')}</div><section class="panel">${panelHead('Integration readiness','What a production deployment would need','<span class="badge amber">Not connected</span>')}${integrations.length?table(['Integration','Purpose','Readiness','Next step'],integrations.map(i=>`<tr><td><strong>${esc(get(i,'name','provider'))}</strong></td><td>${esc(get(i,'purpose','description'))}</td><td>${statusPill(get(i,'status','readiness'))}</td><td>${esc(get(i,'nextStep','note'))}</td></tr>`)):details([['Market data adapters','Not connected'],['Broker / exchange gateways','Not connected'],['Authentication','Not configured'],['Durable audit storage','Not connected'],['Hostinger deployment','Prepared separately']])}</section>`;
  }

  const renderers={overview:overviewPage,markets:marketsPage,comparison:comparisonPage,scanner:scannerPage,terminal:terminalPage,agents:agentsPage,strategies:strategiesPage,backtests:backtestsPage,pnl:pnlPage,risk:riskPage,execution:executionPage,health:healthPage};
  function renderPage(page=state.page, scroll=true) {
    state.page=pages[page]?page:'overview';
    if(!content) return;
    $('#page-title').textContent=state.page==='overview'?'Your research, in focus.':pages[state.page][0];
    $('#page-subtitle').textContent=pages[state.page][1];
    content.setAttribute('aria-label',pages[state.page][0]);
    if($('#breadcrumb')) $('#breadcrumb').textContent=pages[state.page][0];
    $$('[data-page]').forEach(button=>{const active=button.dataset.page===state.page;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    document.title=`${pages[state.page][0]} · AEGIS QUANT`;
    content.innerHTML=renderers[state.page]();
    document.documentElement.dataset.density=state.density;
    document.body.classList.toggle('compact',state.density==='compact');
    if($('#demo-state')) $('#demo-state').textContent=state.paused?'Preview paused':'Synthetic demo';
    if(scroll) window.scrollTo({top:0,behavior:'instant'});
    $('#sidebar')?.classList.remove('mobile-open','open');
    document.body.classList.remove('menu-open');
    $('#mobile-menu')?.setAttribute('aria-expanded','false');
  }
  function navigate(page) {
    if(!pages[page])return;
    const next=`#${page}`;
    if(location.hash===next)renderPage(page);else location.hash=next;
  }
  function toast(message) {
    const root=$('#toast-root');
    if(!root)return;
    clearTimeout(toastTimer);
    root.innerHTML=`<div class="toast">${icon('check')}<span>${esc(message)}</span><button data-action="toast-close" aria-label="Dismiss">${icon('close')}</button></div>`;
    toastTimer=setTimeout(()=>{root.innerHTML='';},5000);
  }
  function openDialog(title,body,footer='',opts={}) {
    const root=$('#modal-root');
    if(!root)return;
    if(!activeDialog)lastFocus=document.activeElement;
    activeDialog=opts;
    root.innerHTML=`<div class="dialog-overlay" data-action="overlay-close"><section class="dialog ${esc(opts.className||'')}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header class="dialog-header"><div>${opts.eyebrow?`<span class="eyebrow">${esc(opts.eyebrow)}</span>`:''}<h2 id="dialog-title">${esc(title)}</h2></div><button class="btn subtle small icon-button" data-action="dialog-close" aria-label="Close dialog">${icon('close')}</button></header><div class="dialog-body">${body}</div>${footer?`<footer class="dialog-footer">${footer}</footer>`:''}</section></div>`;
    document.body.classList.add('modal-open');
    setTimeout(()=>{($(opts.focus||'.dialog input',root)||$('.dialog button',root))?.focus();},30);
  }
  function closeDialog() {
    $('#modal-root').innerHTML='';
    document.body.classList.remove('modal-open');
    activeDialog=null;
    lastFocus?.focus();
  }
  function timeline(items) {
    return `<div class="timeline">${list(items).map(t=>`<div class="timeline-item"><span class="timeline-dot ${statusType(get(t,'status'))}"></span><div><div class="stat-row"><strong>${esc(get(t,'title','event','action','status'))}</strong><span class="muted mono">${esc(get(t,'time','timestamp'))}</span></div><p class="muted">${esc(get(t,'detail','message','note','reason'))}</p></div></div>`).join('')}</div>`;
  }
  function provenanceBlock(item={}) {
    return `<div class="provenance-block"><span class="eyebrow">PROVENANCE</span>${details([['Record type','Synthetic fixture'],['Local snapshot',snapshotText],['UTC snapshot',RAW.snapshot?.utc],['Record ID',first(item.id,item.runId,item.orderId,item.review?.id,RAW.meta?.datasetVersion,'aq-fixtures-1.0')],['Source',first(item.provenance,item.source,'SYNTHETIC')]])}<p class="muted">Pipeline test only. Fixed values; no live data, financial calculation, or order routing.</p></div>`;
  }
  function checksBlock(checks) {
    return `<div class="check-list">${list(checks).map(c=>`<div class="check-item">${icon(statusType(get(c,'status','result'))==='green'?'check':'warning')}<div><strong>${esc(get(c,'label','name','check'))}</strong><p class="muted">${esc(get(c,'detail','reason','note'))}</p></div>${statusPill(get(c,'status','result'))}</div>`).join('')}</div>`;
  }
  function costsBlock(costs) {
    const rows=Array.isArray(costs)?costs:Object.entries(costs||{}).map(([label,value])=>({label,value}));
    return details(rows.map(c=>[get(c,'label','name','component'),get(c,'value','amount','cost')]));
  }
  function instrumentDialog(symbol) {
    const i=instruments().find(x=>x.symbol===symbol);
    if(!i)return;
    openDialog(`${i.symbol} · ${i.name}`,`<div class="dialog-metric"><strong>${esc(i.price)}</strong><span class="${direction(i)}">${esc(i.change)}</span><span class="muted">${esc(i.currency)}</span></div>${lineChart(i.points,{label:'Illustrative instrument price curve'})}${details([['Market',i.market],['Venue',i.venue],['Session',i.session],['Quoted spread',i.spread],['Volume',i.volume],['Volatility',i.volatility],['Recorded quote age',i.quoteAge]])}${provenanceBlock(i)}`,`<button class="btn subtle" data-action="watch" data-symbol="${esc(i.symbol)}">${icon('star')}${state.watchlist.includes(i.symbol)?'Remove from watchlist':'Add to watchlist'}</button><button class="btn primary" data-action="navigate-modal" data-value="terminal">Open trade preview ${icon('arrow')}</button>`,{eyebrow:'INSTRUMENT DETAILS'});
  }
  function opportunityDialog(id) {
    const o=opportunities().find(x=>String(first(x.id,x.symbol,x.name))===id);
    if(!o)return;
    openDialog(`${get(o,'symbol','instrument')} opportunity`,`${statusPill(get(o,'status'))}<p class="dialog-lead">${esc(get(o,'reason','summary'))}</p><div class="dialog-metrics feature-grid">${[{label:'Net edge',value:get(o,'netEdge'),note:get(o,'route')},{label:'Buy executable VWAP',value:get(o,'buyVwap'),note:get(o,'buyVenue')},{label:'Sell executable VWAP',value:get(o,'sellVwap'),note:get(o,'sellVenue')}].map(metric).join('')}</div>${section('Cost breakdown')}${costsBlock(o.costs||[{label:'Gross edge',value:get(o,'grossEdge')},{label:'Fees',value:get(o,'fees')},{label:'Execution loss',value:get(o,'executionLoss')},{label:'Quantity',value:get(o,'quantity')}])}${section('Guardrail checks')}${checksBlock(o.checks)}${section('Decision trail')}${timeline(o.timeline)}${provenanceBlock(o)}`,`<button class="btn subtle" data-action="export-record" data-kind="opportunity" data-id="${esc(id)}">${icon('download')} Export record</button><button class="btn primary" data-action="navigate-modal" data-value="comparison">Compare venues ${icon('arrow')}</button>`,{eyebrow:'INSPECT THE DECISION',className:'wide-dialog'});
  }
  function previewTicket() {
    if(state.paused){openDialog('Demo preview paused',`<p class="dialog-lead">Ticket review is paused in this browser. Resume from the risk center to inspect another synthetic ticket.</p>${showFixtureNote('This local pause cannot cancel orders, liquidate assets, or affect any live process.')}`,`<button class="btn subtle" data-action="dialog-close">Close</button><button class="btn primary" data-action="navigate-modal" data-value="risk">Open risk center</button>`,{eyebrow:'LOCAL PREVIEW CONTROL'});return;}
    const f=terminalFixtures()[state.terminalSymbol]||{},presets=list(first(f.presets,f.sizes,D.sizingPresets)),p=presets[state.terminalSize]||f;
    const sideFixture=first(p[state.terminalSide.toLowerCase()],f[state.terminalSide.toLowerCase()],p);
    openDialog(`${state.terminalSide} ${get(f,'symbol','instrument')} · preview`,`${pill('Synthetic ticket','amber')}<p class="dialog-lead">This preview shows the buy side of a recorded two-leg BTC scenario. Fees, execution loss, and net edge cover both legs. No order will be submitted.</p>${details([['Side','Buy preview only'],['Quantity',get(sideFixture,'quantity','size')],['Buy executable VWAP',get(sideFixture,'buyVwap')],['Capital requirement',get(sideFixture,'capital')],['Fees · both legs',get(sideFixture,'fees')],['Execution loss · both legs',get(sideFixture,'executionLoss')],['Net scenario edge',get(sideFixture,'netEdge')],['Recorded uncertainty',get(sideFixture,'uncertainty')],['Decision',get(sideFixture,'status')]])}${section('Preview controls')}<ul class="plain-list">${list(f.review?.checks).map(c=>`<li>${esc(c)}</li>`).join('')}</ul>${showFixtureNote()}${provenanceBlock(f)}`,`<button class="btn subtle" data-action="dialog-close">Return to ticket</button><button class="btn primary" data-action="ticket-save">${icon('download')} Download preview</button>`,{eyebrow:'PREVIEW ONLY'});
  }
  function searchDialog() {
    openDialog('Find anything',`<label class="search-field large-search">${icon('search')}<input id="global-search-input" type="search" placeholder="Search pages, symbols, and opportunities" autocomplete="off" aria-label="Search Aegis Quant"></label><div id="search-results"></div><p class="panel-footnote">${icon('info')} Search only the recorded example workspace. Press Esc to close.</p>`,'',{className:'search-dialog',focus:'#global-search-input'});
    renderSearch('');
  }
  function renderSearch(query) {
    const root=$('#search-results');if(!root)return;
    const q=query.toLowerCase().trim();
    const p=Object.entries(pages).filter(([key,[title,subtitle]])=>`${key} ${title} ${subtitle}`.toLowerCase().includes(q)).slice(0,q?6:4);
    const ins=instruments().filter(i=>`${i.symbol} ${i.name}`.toLowerCase().includes(q)).slice(0,q?5:3);
    const ops=q?opportunities().filter(o=>`${get(o,'symbol')} ${get(o,'route')} ${get(o,'status')}`.toLowerCase().includes(q)).slice(0,3):[];
    root.innerHTML=`${p.length?'<span class="eyebrow search-group">PAGES</span>':''}${p.map(([key,[title]])=>`<button class="search-result" data-action="navigate-modal" data-value="${key}">${icon('layers')}<strong>${esc(title)}</strong>${icon('chevron')}</button>`).join('')}${ins.length?'<span class="eyebrow search-group">INSTRUMENTS</span>':''}${ins.map(i=>`<button class="search-result" data-action="instrument" data-symbol="${esc(i.symbol)}">${icon('chart')}<span><strong>${esc(i.symbol)}</strong><small class="muted">${esc(i.name)}</small></span><span class="mono">${esc(i.price)}</span></button>`).join('')}${ops.length?'<span class="eyebrow search-group">OPPORTUNITIES</span>':''}${ops.map(o=>`<button class="search-result" data-action="opportunity" data-id="${rowKey(o)}">${icon('lightning')}<span><strong>${esc(get(o,'symbol'))}</strong><small class="muted">${esc(get(o,'route'))}</small></span>${statusPill(get(o,'status'))}</button>`).join('')}${!p.length&&!ins.length&&!ops.length?empty('No matches found','Try a page name, ticker, or venue.'):''}`;
  }
  function helpDialog() {
    openDialog('A little guidance',`<p class="dialog-lead">AEGIS QUANT brings market context, opportunity decisions, and risk controls into one workspace.</p><div class="help-grid">${[['Markets','Find an instrument, save it to your watchlist, and open its details.'],['Venue comparison','Choose a preset size and inspect the recorded cost of buying and selling.'],['Opportunity scanner','Open any decision to see net edge, fees, guardrails, and its trail.'],['Trade preview','Explore a synthetic ticket. There is no order submission.'],['Risk center','Inspect example limits and pause your local preview.'],['Exports','Download fixture records with the snapshot and provenance included.']].map(([title,text])=>`<div><h3>${title}</h3><p class="muted">${text}</p></div>`).join('')}</div>${showFixtureNote()}<p class="muted">Keyboard: Ctrl / ⌘ + K opens search. Esc closes dialogs. Tab moves between controls.</p>`,`<button class="btn subtle" data-action="dialog-close">Got it</button><button class="btn primary" data-action="tour">Take the tour ${icon('arrow')}</button>`,{eyebrow:'WORKSPACE GUIDE',className:'wide-dialog'});
  }
  function notificationsDialog() {
    const notifications=list(first(D.notifications,D.audits)).slice(0,5);
    openDialog('Example notifications',`<p class="muted">A fixed set of recorded events. No live alerting is connected.</p>${notifications.length?`<div class="notification-list">${notifications.map(n=>`<div class="notification-item"><span class="avatar">${icon('bell')}</span><div><strong>${esc(get(n,'title','event','action'))}</strong><p class="muted">${esc(get(n,'message','detail','reason'))}</p><small class="mono muted">${esc(get(n,'time','timestamp'))}</small></div>${statusPill(get(n,'status','severity'))}</div>`).join('')}</div>`:empty('You’re up to date','No other events are included in the example snapshot.')}`,`<button class="btn subtle" data-action="dialog-close">Close</button><button class="btn primary" data-action="navigate-modal" data-value="risk">Open risk center</button>`);
  }
  function settingsDialog() {
    openDialog('Workspace preferences',`<p class="muted">These preferences are saved only in this browser.</p><label class="field">Table density<select class="input" id="density-setting">${options([['comfortable','Comfortable'],['compact','Compact']],state.density)}</select></label><div class="settings-row"><div><h3>Example snapshot</h3><p class="muted">${esc(snapshotText)}</p></div>${recorded}</div><div class="settings-row"><div><h3>Reset this preview</h3><p class="muted">Clear saved watchlist, pause state, and density preference.</p></div><button class="btn subtle small" data-action="reset-demo">Reset</button></div>${showFixtureNote()}`,`<button class="btn primary" data-action="dialog-close">Done</button>`,{eyebrow:'PERSONALIZE YOUR VIEW'});
  }
  const tourSteps=[
    {page:'overview',title:'Your workspace at a glance',text:`Start with recorded performance and risk posture. Portfolio totals use a fixed USD scenario with explicit ${RAW.meta?.fx}. Instrument quotes and native trades keep their currencies.`,icon:'chart'},
    {page:'markets',title:'Keep your instruments close',text:'Filter by market, search a symbol, and star an instrument. Your watchlist stays in this browser.',icon:'star'},
    {page:'scanner',title:'Open the decision, not just the number',text:'Select an opportunity to see executable prices, fees, execution loss, guardrail checks, and a recorded decision trail.',icon:'lightning'},
    {page:'risk',title:'See the controls around every trade',text:'Inspect limits and audit records. Pause changes your local preview only. Trade tickets and exports are synthetic; this site sends no orders.',icon:'shield'},
  ];
  function tour(step=0) {
    state.tourStep=step;
    const t=tourSteps[step];
    navigate(t.page);
    openDialog(t.title,`<div class="tour-visual">${icon(t.icon)}<div class="tour-progress">${tourSteps.map((_,i)=>`<i class="${i===step?'active':''}"></i>`).join('')}</div></div><p class="dialog-lead">${t.text}</p>`,`<span class="muted">${step+1} of ${tourSteps.length}</span><button class="btn subtle" data-action="dialog-close">Skip tour</button><button class="btn primary" data-action="tour-next">${step===tourSteps.length-1?'Start exploring':'Next'} ${icon('arrow')}</button>`,{eyebrow:'WELCOME TO AEGIS QUANT'});
  }
  function download(name,body,type='application/json') {
    const blob=new Blob([body],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Example exported with snapshot and provenance.');
  }
  const exportEnvelope = (kind,records) => ({product:'AEGIS QUANT',recordType:'Synthetic fixture',kind,snapshot:D.snapshot||{},provenance:'SYNTHETIC',datasetVersion:RAW.meta?.datasetVersion||'aq-fixtures-1.0',notice:'Pipeline test only. Synthetic fixtures are not real-market evidence; no live financial service or order execution is connected.',currencyPolicy:`Original quote and native trade currencies retained. Portfolio reporting uses the explicit fixture assumption: ${RAW.meta?.fx || 'No FX assumption provided'}.`,records});
  function viewRecords() {
    switch(state.page) {
      case 'overview':return [...D.metrics.map(m=>({...m,recordKind:'Metric'})),...list(D.overview.allocation).map(a=>({...a,recordKind:'Allocation',currency:'USD',fxAssumption:RAW.meta?.fx}))];
      case 'markets':return instruments().filter(i=>(state.market==='All markets'||i.market===state.market)&&(!state.watchOnly||state.watchlist.includes(i.symbol))&&`${i.symbol} ${i.name} ${i.venue}`.toLowerCase().includes(state.marketQuery.toLowerCase()));
      case 'comparison':{const current=D.comparisons[state.comparison];return current?.market==='Crypto'?current.sizes.map(p=>({...p,recordKind:'Size scenario',instrument:current.symbol,currency:current.currency})):list(current?.sizes).flatMap(s=>list(s.providers).map(p=>({...p,recordKind:'Broker cost scenario',instrument:current.symbol,quantity:s.quantity,sizePreset:s.id,currency:current.currency,recordedPreference:s.bestBroker})));}
      case 'scanner':return opportunities().filter(o=>state.scannerFilter==='all'||o.statusGroup===state.scannerFilter);
      case 'terminal':return [{...D.sizingPresets[state.terminalSize],recordKind:'Buy preview',instrument:D.terminalFixtures[0]?.symbol,currency:'USD'}];
      case 'agents':return D.agents;
      case 'strategies':return list(D.strategies).filter(s=>state.strategyFilter==='all'||String(get(s,'market')).toLowerCase().includes(state.strategyFilter));
      case 'backtests':return D.backtests;
      case 'pnl':return [...D.trades.filter(t=>t.currency===state.pnlCurrency).map(t=>({...t,recordKind:'Native trade outcome'})),...list(D.ledger).filter(l=>l.currency===state.pnlCurrency).map(l=>({...l,recordKind:'Accounting posting'}))];
      case 'risk':return [...D.risk.limits.map(l=>({...l,recordKind:'Risk limit'})),...D.risk.checks.map(c=>({...c,recordKind:'Control'}))];
      case 'execution':return D.orders.filter(o=>state.executionFilter==='all'||String(o.status).toLowerCase().includes(state.executionFilter));
      case 'health':return D.health.providers.filter(p=>state.healthFilter==='all'||statusType(p.status)===state.healthFilter);
      default:return [];
    }
  }
  function exportView(format='json') {
    const records=viewRecords();
    if(format==='csv') {
      const metadata={record_type:'Synthetic fixture',provenance:'SYNTHETIC',snapshot_utc:RAW.snapshot?.utc||'',snapshot_local:RAW.snapshot?.local||'',dataset_version:RAW.meta?.datasetVersion||'',notice:'Pipeline test only; synthetic demonstration',fx_assumption:RAW.meta?.fx||''};
      const fields=[...new Set(records.flatMap(r=>Object.entries(r).filter(([key,value])=>key!=='provenance'&&value!==null&&typeof value!=='object'&&typeof value!=='function').map(([key])=>key)))];
      const columns=[...Object.keys(metadata),...fields];
      const quote=v=>`"${String(v??'').replace(/"/g,'""')}"`;
      const rows=records.map(r=>columns.map(key=>quote(key in metadata?metadata[key]:r[key])).join(','));
      download(`aegis-${state.page}-synthetic.csv`,[columns.map(quote).join(','),...rows].join('\r\n'),'text/csv;charset=utf-8');
    } else download(`aegis-${state.page}-synthetic.json`,JSON.stringify(exportEnvelope(state.page,records),null,2));
  }
  function exportDialog() {
    openDialog('Export this example view',`<p class="dialog-lead">Download the underlying fixture records with their snapshot and provenance.</p>${details([['View',pages[state.page][0]],['Data type','Synthetic example'],['Currency policy','Original currencies retained'],['Snapshot',snapshotText]])}<p class="muted">JSON keeps full record details. CSV provides a compact table of the main fields.</p>`,`<button class="btn subtle" data-action="download-export" data-format="csv">${icon('download')} Download CSV</button><button class="btn primary" data-action="download-export" data-format="json">${icon('download')} Download JSON</button>`);
  }
  function showRecord(kind,id) {
    const sources={strategy:list(D.strategies),backtest:list(first(D.backtests?.runs,D.backtests)),trade:list(first(D.pnl?.trades,D.trades)),order:list(first(D.execution?.orders,D.orders)),audit:list(first(D.risk?.audit,D.audits)),provider:list(first(D.health?.providers,D.health?.services,D.feeds))};
    const item=(sources[kind]||[]).find(r=>String(first(r.id,r.symbol,r.name))===id);
    if(!item)return;
    const title=get(item,'name','strategy','symbol','event','provider','component');
    let body='';
    if(kind==='strategy')body=`${statusPill(get(item,'status'))}<p class="dialog-lead">${esc(get(item,'description','summary'))}</p>${details([['Market',get(item,'market')],['Family',get(item,'family')],['Recorded return',get(item,'return','pnl','performance')],['Max drawdown',get(item,'maxDrawdown','drawdown')],['Simulation fidelity',get(item,'fidelity')]])}${section('Strategy rules')}<ul class="plain-list">${list(first(item.rules,item.assumptions)).map(r=>`<li>${esc(typeof r==='string'?r:get(r,'label','detail','description'))}</li>`).join('')}</ul>${section('Guardrails')}${checksBlock(item.checks)}`;
    if(kind==='backtest')body=`${statusPill(get(item,'status'))}<p class="dialog-lead">${esc(get(item,'description','summary'))}</p><div class="dialog-metrics feature-grid">${[{label:'Return',value:get(item,'return','totalReturn'),note:'Synthetic scenario'},{label:'Max drawdown',value:get(item,'maxDrawdown','drawdown'),note:'Recorded example'},{label:'Sharpe ratio',value:get(item,'sharpe','sharpeRatio'),note:get(item,'period','dateRange')}].map(metric).join('')}</div>${lineChart(first(item.points,item.equityPoints),{label:'Illustrative equity curve for the recorded research run'})}${details([['Run ID',get(item,'id','runId')],['Period',get(item,'period','dateRange')],['Dataset',get(item,'dataset','datasetVersion')],['Seed',get(item,'seed')],['Code version',get(item,'codeVersion','commit')],['Cost assumptions',get(item,'costAssumptions','costs')],['Trades',get(item,'trades','tradeCount')]])}<ul class="plain-list">${list(item.assumptions).map(a=>`<li>${esc(a)}</li>`).join('')}</ul>`;
    if(kind==='order')body=`${statusPill(get(item,'status'))}<p class="dialog-lead">${esc(get(item,'reason','description','detail'))}</p>${details([['Order ID',get(item,'id','orderId')],['Instrument',get(item,'symbol')],['Side',get(item,'side')],['Quantity',get(item,'quantity')],['Price',get(item,'price','limitPrice','fillPrice')],['Venue',get(item,'venue')],['Client order key',get(item,'clientOrderId','idempotencyKey')]])}${section('Recorded lifecycle')}${timeline(item.timeline)}${checksBlock(item.checks)}`;
    if(kind==='trade')body=`${details([['Record ID',get(item,'id')],['Time',get(item,'time','timestamp')],['Instrument',get(item,'symbol')],['Strategy',get(item,'strategy')],['Quantity',get(item,'quantity')],['Gross result',get(item,'gross')],['Fee',get(item,'fee','fees')],['Net result',get(item,'net')],['Native currency',get(item,'currency')],['Venue',get(item,'venue')]])}${costsBlock(item.costs)}`;
    if(kind==='audit')body=`${statusPill(get(item,'status','result'))}<p class="dialog-lead">${esc(get(item,'detail','reason','message'))}</p>${details([['Time',get(item,'time','timestamp')],['Component',get(item,'component','agent')],['Correlation ID',get(item,'correlationId')],['Event',get(item,'event','action')]])}${checksBlock(item.checks)}`;
    if(kind==='provider')body=`${statusPill(get(item,'status'))}<p class="dialog-lead">${esc(get(item,'description','role','note'))}</p>${details([['Market',get(item,'market')],['Source',get(item,'source','feed')],['Recorded latency',get(item,'latency','p95')],['Quote age',get(item,'quoteAge','freshness')],['Observation',get(item,'lastSeen','timestamp')],['Fallback',get(item,'fallback')]])}${checksBlock(item.checks)}<p class="muted">Live credentials, provider connectivity, and ongoing checks are not configured in this preview.</p>`;
    openDialog(`${title} · ${kind}`,`${body}${provenanceBlock(item)}`,`<button class="btn subtle" data-action="dialog-close">Close</button><button class="btn primary" data-action="export-record" data-kind="${kind}" data-id="${esc(id)}">${icon('download')} Export record</button>`,{eyebrow:'RECORDED EXAMPLE',className:kind==='backtest'?'wide-dialog':''});
  }
  function genericGuide(kind) {
    const texts={
      'backtest-method':['Research checklist','A reproducible research record includes its dataset and version, market calendar, adjustment policy, strategy version, deterministic seed, transaction costs, train/test split, and full assumptions. This preview displays synthetic records; it does not run a backtest.'],
      'risk-method':['How the controls work','A live implementation would check quote freshness, executable depth, lot and tick rules, currency boundaries, venue constraints, residual exposure, maximum order size, leverage, drawdown, and daily loss before routing. Every block needs a durable reason and audit context. The controls shown here are fixed examples.'],
    };
    const [title,text]=texts[kind]||['About this preview','This workspace is a synthetic demonstration.'];
    openDialog(title,`<p class="dialog-lead">${text}</p>${showFixtureNote()}`,`<button class="btn primary" data-action="dialog-close">Got it</button>`);
  }
  function agentDialog(index) {
    const a=list(D.agents)[index];if(!a)return;
    openDialog(get(a,'name'),`${statusPill(get(a,'status'))}<p class="dialog-lead">${esc(get(a,'role','description'))}</p>${details([['Scope',get(a,'scope')],['Recorded task',get(a,'latestTask','task','lastAction')],['Recorded run',get(a,'updated','lastSeen','timestamp')],['Authority',get(a,'authority')]])}${section('Responsibilities')}<ul class="plain-list">${list(first(a.responsibilities,a.rules)).map(r=>`<li>${esc(r)}</li>`).join('')}</ul>${checksBlock(a.checks)}${provenanceBlock(a)}`,`<button class="btn primary" data-action="dialog-close">Close</button>`,{eyebrow:'AGENT RECORD · NO ACTIVE WORKER'});
  }
  function comparisonDialog() {
    const c=comparisonRows()[state.comparison]||{},sizes=list(first(c.sizes,c.presets,D.sizingPresets)),s=sizes[state.comparisonSize]||c;
    if(c.market!=='Crypto'){openDialog(`${c.symbol} · broker assumptions`,`${statusPill(s.status)}<p class="dialog-lead">${esc(get(s,'detail','eligibility'))}</p>${details([['Quantity',s.quantity],['Shared reference quote',s.referencePrice],['Notional',s.notional],['Recorded preference',s.bestBroker],['Effective buy cost',s.effectiveBuyCost],['Currency',c.currency],['Eligibility',s.eligibility]])}${list(s.providers).map(p=>`<section class="panel compact-panel"><h3>${esc(p.name)}</h3>${details([['Assumed commission',p.commission],['Assumed charges',p.charges],['Execution loss',p.executionLoss],['Effective buy cost',get(p,'effectiveBuyCost','totalCost')],['Fee fixture version',p.feeVersion],['Assumptions',p.assumptions]])}</section>`).join('')}${provenanceBlock(s)}`,`<button class="btn primary" data-action="dialog-close">Close</button>`,{eyebrow:'RESEARCH ONLY · NO EXECUTION',className:'wide-dialog'});return;}
    openDialog('Inside the venue comparison',`${statusPill(get(s,'status'))}<p class="dialog-lead">A recorded two-leg size scenario. Fees and execution loss cover both legs; uncertainty is shown alongside the estimate.</p>${costsBlock(s.costs||[{label:'Quantity',value:get(s,'quantity','size')},{label:'Buy VWAP',value:get(s,'buyVwap')},{label:'Sell VWAP',value:get(s,'sellVwap')},{label:'Fees',value:get(s,'fees')},{label:'Execution loss',value:get(s,'executionLoss')},{label:'Net edge',value:get(s,'netEdge')},{label:'Uncertainty range',value:get(s,'uncertainty')}])}${checksBlock(s.checks)}${provenanceBlock(s)}`,`<button class="btn primary" data-action="dialog-close">Close</button>`,{eyebrow:'COSTS AND GUARDRAILS'});
  }
  document.addEventListener('click',event=>{
    const page=event.target.closest('[data-page]');if(page){event.preventDefault();navigate(page.dataset.page);return;}
    const button=event.target.closest('[data-action]');if(!button)return;
    const action=button.dataset.action;
    if(action==='overlay-close'&&event.target!==button)return;
    switch(action) {
      case 'range':state.range=button.dataset.value;renderPage(undefined,false);break;
      case 'market-filter':state.market=button.dataset.value;renderPage(undefined,false);break;
      case 'watch-filter':state.watchOnly=!state.watchOnly;renderPage(undefined,false);break;
      case 'reset-markets':state.market='All markets';state.watchOnly=false;state.marketQuery='';renderPage();break;
      case 'watch':{const symbol=button.dataset.symbol;state.watchlist=state.watchlist.includes(symbol)?state.watchlist.filter(x=>x!==symbol):[...state.watchlist,symbol];storeWrite('aegis-watchlist',state.watchlist);toast(`${symbol} ${state.watchlist.includes(symbol)?'added to':'removed from'} your watchlist.`);if(activeDialog?.className!=='search-dialog'&&$('#dialog-title')?.textContent.startsWith(symbol))instrumentDialog(symbol);else if(!activeDialog)renderPage(undefined,false);break;}
      case 'instrument':instrumentDialog(button.dataset.symbol);break;
      case 'opportunity':opportunityDialog(button.dataset.id);break;
      case 'scanner-filter':state.scannerFilter=button.dataset.value;renderPage(undefined,false);break;
      case 'strategy-filter':state.strategyFilter=button.dataset.value;renderPage(undefined,false);break;
      case 'execution-filter':state.executionFilter=button.dataset.value;renderPage(undefined,false);break;
      case 'health-filter':state.healthFilter=button.dataset.value;renderPage(undefined,false);break;
      case 'comparison-size':state.comparisonSize=Number(button.dataset.index);renderPage(undefined,false);break;
      case 'comparison-detail':comparisonDialog();break;
      case 'terminal-side':state.terminalSide=button.dataset.value;renderPage(undefined,false);break;
      case 'preview-ticket':previewTicket();break;
      case 'ticket-save':{const f=terminalFixtures()[state.terminalSymbol]||{};download('aegis-synthetic-ticket.json',JSON.stringify(exportEnvelope('ticket',{...f,previewSide:state.terminalSide,selectedPreset:state.terminalSize}),null,2));break;}
      case 'agent':agentDialog(Number(button.dataset.index));break;
      case 'activity':{const a=list(D.agentActivity)[Number(button.dataset.index)];if(a)openDialog(get(a,'agent','name','title'),`<p class="dialog-lead">${esc(get(a,'message','action','summary'))}</p>${details([['Time',get(a,'time','timestamp')],['Decision',get(a,'status')],['Context',get(a,'detail','reason')]])}${provenanceBlock(a)}`,`<button class="btn primary" data-action="dialog-close">Close</button>`,{eyebrow:'RECORDED ACTIVITY'});break;}
      case 'strategy':case 'backtest':case 'trade':case 'order':case 'audit':case 'provider':showRecord(action,button.dataset.id);break;
      case 'backtest-method':case 'risk-method':genericGuide(action);break;
      case 'pnl-currency':state.pnlCurrency=button.dataset.value;renderPage(undefined,false);break;
      case 'pause':state.paused=!state.paused;storeWrite('aegis-paused',state.paused);renderPage(undefined,false);toast(state.paused?'Local preview paused. No live process is affected.':'Local preview resumed.');break;
      case 'health-refresh':toast('Fixed snapshot verified. Live monitoring is not connected.');break;
      case 'dialog-close':case 'overlay-close':closeDialog();break;
      case 'navigate-modal':closeDialog();navigate(button.dataset.value);break;
      case 'tour':closeDialog();tour(0);break;
      case 'tour-next':closeDialog();if(state.tourStep<tourSteps.length-1)tour(state.tourStep+1);else{navigate('overview');toast('You’re ready to explore the example workspace.');}break;
      case 'export-view':case 'export-ledger':exportDialog();break;
      case 'download-export':exportView(button.dataset.format);closeDialog();break;
      case 'export-record':{const sources={opportunity:opportunities(),strategy:list(D.strategies),backtest:list(first(D.backtests?.runs,D.backtests)),trade:list(first(D.pnl?.trades,D.trades)),order:list(first(D.execution?.orders,D.orders)),audit:list(first(D.risk?.audit,D.audits)),provider:list(first(D.health?.providers,D.health?.services,D.feeds))};const r=(sources[button.dataset.kind]||[]).find(x=>String(first(x.id,x.symbol,x.name))===button.dataset.id);if(r)download(`aegis-${button.dataset.kind}-${String(button.dataset.id).replace(/[^\w-]/g,'-')}.json`,JSON.stringify(exportEnvelope(button.dataset.kind,r),null,2));break;}
      case 'reset-demo':state.watchlist=[];state.paused=false;state.density='comfortable';storeWrite('aegis-watchlist',[]);storeWrite('aegis-paused',false);storeWrite('aegis-density','comfortable');renderPage(undefined,false);settingsDialog();toast('Local preferences reset.');break;
      case 'toast-close':$('#toast-root').innerHTML='';break;
    }
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='global-search-input')renderSearch(event.target.value);
    if(event.target.id==='market-search'){state.marketQuery=event.target.value;const start=event.target.selectionStart;renderPage(undefined,false);const input=$('#market-search');input?.focus();input?.setSelectionRange(start,start);}
  });
  document.addEventListener('change',event=>{
    switch(event.target.id){
      case 'market-sort':state.marketSort=event.target.value;renderPage(undefined,false);break;
      case 'comparison-case':state.comparison=Number(event.target.value);state.comparisonSize=0;renderPage(undefined,false);break;
      case 'terminal-symbol':state.terminalSymbol=Number(event.target.value);state.terminalSize=0;renderPage(undefined,false);break;
      case 'terminal-size':state.terminalSize=Number(event.target.value);renderPage(undefined,false);break;
      case 'density-setting':state.density=event.target.value;storeWrite('aegis-density',state.density);renderPage(undefined,false);toast('Density preference saved.');break;
    }
  });
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();searchDialog();return;}
    if(event.key==='Escape'){if(activeDialog)closeDialog();else{$('#sidebar')?.classList.remove('mobile-open','open');document.body.classList.remove('menu-open');$('#mobile-menu')?.setAttribute('aria-expanded','false');}return;}
    if(event.key==='Tab'&&activeDialog){const focusable=$$('button,[href],input,select,textarea,[tabindex="0"]',$('.dialog')).filter(el=>!el.disabled&&el.offsetParent!==null),firstEl=focusable[0],lastEl=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===firstEl){event.preventDefault();lastEl?.focus();}else if(!event.shiftKey&&document.activeElement===lastEl){event.preventDefault();firstEl?.focus();}}
  });
  $('#global-search')?.addEventListener('click',searchDialog);
  $('#search-shortcut')?.addEventListener('click',searchDialog);
  $('#notifications')?.addEventListener('click',notificationsDialog);
  $('#help-button')?.addEventListener('click',helpDialog);
  $('#settings-button')?.addEventListener('click',settingsDialog);
  $('#profile-button')?.addEventListener('click',settingsDialog);
  $('#demo-info')?.addEventListener('click',helpDialog);
  $('#start-tour')?.addEventListener('click',()=>tour(0));
  $('#export-button')?.addEventListener('click',exportDialog);
  $('#mobile-menu')?.addEventListener('click',()=>{const open=$('#sidebar')?.classList.toggle('mobile-open');$('#sidebar')?.classList.toggle('open',Boolean(open));document.body.classList.toggle('menu-open',Boolean(open));$('#mobile-menu').setAttribute('aria-expanded',String(Boolean(open)));});
  window.addEventListener('hashchange',()=>renderPage(location.hash.slice(1)));
  renderPage(location.hash.slice(1)||'overview');
})();
