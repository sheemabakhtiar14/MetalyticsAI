// Dashboard UI — rankings, detail panel, badges, regional analysis

const UI = (() => {
  let _data = null;
  let _activeTab = 'priority';
  let _selectedId = null;

  function init(analyticsData) {
    _data = analyticsData;
    _renderBadges();
    _renderRankings('priority');
    _updateBottomStats();
    _renderWelcomePanel();
  }

  // ─── Auto-highlight Badges ────────────────────────────────────────────────────
  function _renderBadges() {
    const h = _data.highlights;
    const badges = [
      { cls: 'badge-critical', icon: '▲', label: 'Highest Impact', value: h.highestImpact.shortName,     id: h.highestImpact.id },
      { cls: 'badge-recovery', icon: '◈', label: 'Best Recovery',  value: h.highestRecovery.shortName,   id: h.highestRecovery.id },
      { cls: 'badge-circular', icon: '↺', label: 'Best Circularity', value: h.bestCircularity.shortName, id: h.bestCircularity.id },
      { cls: 'badge-priority', icon: '!', label: 'Top Priority',   value: h.topPriority.shortName,       id: h.topPriority.id },
      { cls: 'badge-waste',    icon: '⚠', label: 'Critical Waste', value: h.mostCriticalWaste.shortName, id: h.mostCriticalWaste.id }
    ];

    const container = document.getElementById('auto-highlights');
    container.innerHTML = badges.map(b => `
      <button class="badge ${b.cls}" onclick="UI.showFacilityDetail('${b.id}')" title="${b.label}">
        <span class="badge-icon">${b.icon}</span>
        <span class="badge-label">${b.label}:</span>
        <span class="badge-value">${b.value}</span>
      </button>`).join('');
  }

  // ─── Rankings Panel ───────────────────────────────────────────────────────────
  function showRankTab(tab) {
    _activeTab = tab;
    document.querySelectorAll('.rank-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    _renderRankings(tab);
  }

  function _renderRankings(tab) {
    const tabMap = {
      priority:    { list: _data.rankings.byPriority,  scoreKey: 'priority', label: 'Priority', colorFn: _priorityColor },
      impact:      { list: _data.rankings.byEIS,       scoreKey: 'eis',      label: 'EIS',      colorFn: f => Analytics.eisClass(f.eis) },
      recovery:    { list: _data.rankings.byROS,       scoreKey: 'ros',      label: 'ROS',      colorFn: () => 'recovery' },
      circularity: { list: _data.rankings.byCS,        scoreKey: 'cs',       label: 'CS',       colorFn: () => 'circularity' }
    };
    const { list, scoreKey, label, colorFn } = tabMap[tab];
    const container = document.getElementById('rank-list');
    container.innerHTML = list.map((f, i) => {
      const score = f[scoreKey];
      const cls   = colorFn(f);
      const bar   = Math.round(score);
      return `
        <div class="rank-item ${_selectedId === f.id ? 'rank-item-active' : ''}" data-id="${f.id}" onclick="UI.showFacilityDetail('${f.id}')">
          <div class="rank-num ${cls}-text">${i + 1}</div>
          <div class="rank-info">
            <div class="rank-name">${f.flag} ${f.shortName}</div>
            <div class="rank-meta">${f.country} · ${f.metalType}</div>
            <div class="rank-bar-wrap">
              <div class="rank-bar rank-bar-${cls}" style="width:${bar}%"></div>
            </div>
          </div>
          <div class="rank-score ${cls}-text">${score}</div>
        </div>`;
    }).join('');
  }

  function _priorityColor(f) {
    if (f.priority >= 60) return 'critical';
    if (f.priority >= 45) return 'high';
    if (f.priority >= 30) return 'medium';
    return 'low';
  }

  // ─── Facility Detail Panel ────────────────────────────────────────────────────
  function showFacilityDetail(id) {
    _selectedId = id;
    const f       = _data.facilityMap[id];
    const insights = Analytics.generateInsights(f, _data);
    const recs     = Analytics.generateRecommendations(f, _data);

    // Update ranking list highlight
    _renderRankings(_activeTab);

    const panel = document.getElementById('detail-panel');
    panel.classList.remove('hidden');

    const eisCls = Analytics.eisClass(f.eis);
    const recovMt = f.recoverableMt.toLocaleString();

    document.getElementById('detail-content').innerHTML = `
      <div class="dp-header">
        <div class="dp-title">
          <span class="dp-flag">${f.flag}</span>
          <div>
            <div class="dp-name">${f.name}</div>
            <div class="dp-meta">${f.country} · ${f.region} · ${f.metalType} · ${(f.productionVolume / 1000).toFixed(0)}k t/yr</div>
          </div>
        </div>
        <button class="dp-close" onclick="UI.closeDetail()">✕</button>
      </div>

      <div class="score-cards">
        ${_scoreCard('Environmental Impact', f.eis, eisCls, Analytics.eisLabel(f.eis), `#${f.eisRank} Globally`)}
        ${_scoreCard('Recovery Opportunity', f.ros, 'recovery', f.ros >= 70 ? 'High Opp.' : f.ros >= 50 ? 'Moderate' : 'Limited', `#${f.rosRank} Globally`)}
        ${_scoreCard('Circularity Score', f.cs, 'circularity', f.cs >= 70 ? 'Strong' : f.cs >= 45 ? 'Moderate' : 'Weak', `#${f.csRank} Globally`)}
      </div>

      <div class="dp-section">
        <div class="dp-section-title">Key Metrics</div>
        <div class="metrics-grid">
          ${_metricRow('CO₂ Emissions', _fmt(f.co2Emissions) + ' t/yr', f._normCO2, 'critical', `${f.co2Share}% of portfolio total`)}
          ${_metricRow('Energy Consumption', _fmt(f.energyConsumption) + ' GWh/yr', f._normEnergy, 'high', `${_fmt(f.energyConsumption * 3.6)} TJ/yr`)}
          ${_metricRow('Water Consumption', _fmtW(f.waterConsumption) + '/yr', f._normWater, 'medium', 'Annual freshwater draw')}
          ${_metricRow('Waste Generation', _fmt(f.wasteQuantity) + ' t/yr', f._normWaste, 'high', f.wasteType)}
          ${_metricRow('Recoverable Metal', recovMt + ' t/yr', f.recoveryPotential, 'recovery', `${Math.round(f.recoveryPotential * 100)}% of production volume`)}
        </div>
      </div>

      <div class="dp-section">
        <div class="dp-section-title">AI Insights</div>
        <div class="insights-list">
          ${insights.map(t => `<div class="insight-item">${t}</div>`).join('')}
        </div>
      </div>

      <div class="dp-section">
        <div class="dp-section-title">Recommended Actions</div>
        <div class="recs-list">
          ${recs.map(r => `
            <div class="rec-item rec-${r.level}">
              <span class="rec-icon">${r.icon}</span>
              <span>${r.text}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="dp-section">
        <div class="dp-section-title">Transport Route</div>
        <div class="transport-card">
          <div class="transport-route">
            <span class="t-from">${f.shortName}</span>
            <span class="t-arrow">──${_transportIcon(f.transportRoute.mode)}──▶</span>
            <span class="t-to">${f.transportRoute.destination}</span>
          </div>
          <div class="transport-stats">
            <div class="t-stat"><span>${f.transportRoute.mode}</span><span class="t-stat-label">Mode</span></div>
            <div class="t-stat"><span>${f.transportRoute.distanceKm.toLocaleString()} km</span><span class="t-stat-label">Distance</span></div>
            <div class="t-stat"><span class="${_transportRankClass(f.transportRank)}-text">${_fmt(f.transportCO2)} t</span><span class="t-stat-label">CO₂/yr</span></div>
            <div class="t-stat"><span>#${f.transportRank}</span><span class="t-stat-label">Network Rank</span></div>
          </div>
        </div>
      </div>

      <div class="dp-intervention">
        <div class="intervention-score">
          <span class="int-label">Intervention Priority Score</span>
          <span class="int-value ${_priorityScoreClass(f.priority)}-text">${f.priority} / 100</span>
        </div>
        <div class="int-bar-wrap">
          <div class="int-bar ${_priorityScoreClass(f.priority)}" style="width:${f.priority}%"></div>
        </div>
        <div class="int-rank">Ranked <strong>#${f.priorityRank}</strong> of ${_data.facilities.length} facilities for intervention priority</div>
      </div>`;

    // Focus map
    if (window.GeoMap) GeoMap.focusFacility(id);
  }

  function closeDetail() {
    _selectedId = null;
    document.getElementById('detail-panel').classList.add('hidden');
    _renderRankings(_activeTab);
  }

  // ─── Regional View ────────────────────────────────────────────────────────────
  function showRegionalView() {
    _selectedId = null;
    _renderRankings(_activeTab);
    const panel = document.getElementById('detail-panel');
    panel.classList.remove('hidden');

    const maxCO2 = Math.max(..._data.regional.map(r => r.totalCO2));

    document.getElementById('detail-content').innerHTML = `
      <div class="dp-header">
        <div class="dp-title">
          <span class="dp-flag">🌍</span>
          <div>
            <div class="dp-name">Regional Analysis</div>
            <div class="dp-meta">CO₂ burden and circularity performance by region</div>
          </div>
        </div>
        <button class="dp-close" onclick="UI.closeDetail()">✕</button>
      </div>
      <div class="regional-list">
        ${_data.regional.map((r, i) => `
          <div class="region-card">
            <div class="region-header">
              <span class="region-rank">#${i + 1}</span>
              <span class="region-name">${r.name}</span>
              <span class="region-facilities">${r.facilities.length} ${r.facilities.length === 1 ? 'facility' : 'facilities'}</span>
            </div>
            <div class="region-bar-wrap">
              <div class="region-bar" style="width:${Math.round(r.totalCO2 / maxCO2 * 100)}%"></div>
            </div>
            <div class="region-stats">
              <div class="r-stat"><span class="critical-text">${_fmt(r.totalCO2)}</span><span class="r-label">Total CO₂ t/yr</span></div>
              <div class="r-stat"><span class="${Analytics.eisClass(r.avgEIS)}-text">${r.avgEIS}</span><span class="r-label">Avg. EIS</span></div>
              <div class="r-stat"><span class="circularity-text">${r.avgCS}</span><span class="r-label">Avg. CS</span></div>
              <div class="r-stat"><span class="recovery-text">${r.avgROS}</span><span class="r-label">Avg. ROS</span></div>
            </div>
            <div class="region-co2share">${r.co2Share}% of total portfolio CO₂</div>
            <div class="region-facilities-list">
              ${r.facilities.sort((a, b) => b.eis - a.eis).map(f =>
                `<button class="region-fac-btn ${Analytics.eisClass(f.eis)}-text" onclick="UI.showFacilityDetail('${f.id}')">${f.shortName} (EIS: ${f.eis})</button>`
              ).join('')}
            </div>
          </div>`).join('')}
      </div>`;
  }

  // ─── Bottom Stats ─────────────────────────────────────────────────────────────
  function _updateBottomStats() {
    const { totals, facilities } = _data;
    _set('stat-co2',        _fmt(totals.totalCO2) + ' t/yr');
    _set('stat-waste',      _fmt(totals.totalWaste) + ' t/yr');
    _set('stat-energy',     _fmt(totals.totalEnergy) + ' GWh/yr');
    _set('stat-recovery',   _fmt(facilities.reduce((s, f) => s + f.recoverableMt, 0)) + ' t/yr');
    _set('stat-facilities', facilities.length + ' active');
    const avgCS = (facilities.reduce((s, f) => s + f.cs, 0) / facilities.length).toFixed(1);
    _set('stat-circularity', avgCS + ' / 100');
  }

  // ─── Welcome Panel ────────────────────────────────────────────────────────────
  function _renderWelcomePanel() {
    const h = _data.highlights;
    document.getElementById('detail-content').innerHTML = `
      <div class="welcome-panel">
        <div class="welcome-icon">⬡</div>
        <div class="welcome-title">Geo Impact Mapper</div>
        <div class="welcome-sub">Select any facility on the map or from the rankings panel to see full decision intelligence.</div>
        <div class="welcome-findings">
          <div class="finding-item">
            <span class="finding-dot critical"></span>
            <span><strong>${h.highestImpact.name}</strong> contributes ${h.highestImpact.co2Share}% of total portfolio CO₂</span>
          </div>
          <div class="finding-item">
            <span class="finding-dot recovery"></span>
            <span><strong>${h.highestRecovery.name}</strong> has the highest metal recovery opportunity</span>
          </div>
          <div class="finding-item">
            <span class="finding-dot circularity"></span>
            <span><strong>${h.bestCircularity.name}</strong> is the strongest circularity performer</span>
          </div>
          <div class="finding-item">
            <span class="finding-dot high"></span>
            <span><strong>${h.highestEmissionRegion.name}</strong> is the highest-emission region (${h.highestEmissionRegion.co2Share}% of total)</span>
          </div>
          <div class="finding-item">
            <span class="finding-dot medium"></span>
            <span><strong>${h.highestTransport.name}</strong> generates the highest logistics emissions</span>
          </div>
        </div>
        <button class="welcome-region-btn" onclick="UI.showRegionalView()">View Regional Analysis</button>
      </div>`;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  function _scoreCard(label, value, cls, tag, sub) {
    return `
      <div class="score-card">
        <div class="sc-label">${label}</div>
        <div class="sc-value ${cls}-text">${value}</div>
        <div class="sc-bar-wrap"><div class="sc-bar sc-bar-${cls}" style="width:${value}%"></div></div>
        <div class="sc-tag ${cls}-text">${tag}</div>
        <div class="sc-sub">${sub}</div>
      </div>`;
  }

  function _metricRow(label, value, norm, cls, sub) {
    const pct = Math.round(Math.min(norm, 1) * 100);
    return `
      <div class="metric-row">
        <div class="mr-left">
          <div class="mr-label">${label}</div>
          <div class="mr-sub">${sub}</div>
        </div>
        <div class="mr-right">
          <div class="mr-value">${value}</div>
          <div class="mr-bar-wrap"><div class="mr-bar mr-bar-${cls}" style="width:${pct}%"></div></div>
        </div>
      </div>`;
  }

  function _fmt(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return n.toFixed(0);
  }

  function _fmtW(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B m³';
    if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M m³';
    return (n / 1e3).toFixed(0) + 'k m³';
  }

  function _set(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function _transportIcon(mode) {
    const icons = { Rail: '🚂', Road: '🚛', Barge: '⛵', Ship: '🚢', Air: '✈' };
    return icons[mode] || '→';
  }

  function _transportRankClass(rank) {
    if (rank <= 3) return 'critical';
    if (rank <= 6) return 'high';
    return 'low';
  }

  function _priorityScoreClass(p) {
    if (p >= 60) return 'critical';
    if (p >= 45) return 'high';
    if (p >= 30) return 'medium';
    return 'low';
  }

  return { init, showRankTab, showFacilityDetail, closeDetail, showRegionalView };
})();
