// Scoring engine — transforms raw LCA metrics into decision intelligence

const Analytics = (() => {

  function compute(facilities) {
    const maxCO2        = Math.max(...facilities.map(f => f.co2Emissions));
    const maxEnergy     = Math.max(...facilities.map(f => f.energyConsumption));
    const maxWater      = Math.max(...facilities.map(f => f.waterConsumption));
    const maxWaste      = Math.max(...facilities.map(f => f.wasteQuantity));
    const maxProduction = Math.max(...facilities.map(f => f.productionVolume));

    // co2PerTonneKm is in kg/t-km → divide by 1000 to get tonnes CO₂
    const transportEmissions = facilities.map(f =>
      f.productionVolume * f.transportRoute.distanceKm * f.transportRoute.co2PerTonneKm / 1000
    );
    const maxTransport = Math.max(...transportEmissions);

    const totalCO2    = facilities.reduce((s, f) => s + f.co2Emissions, 0);
    const totalWaste  = facilities.reduce((s, f) => s + f.wasteQuantity, 0);
    const totalEnergy = facilities.reduce((s, f) => s + f.energyConsumption, 0);
    const totalWater  = facilities.reduce((s, f) => s + f.waterConsumption, 0);

    const scored = facilities.map((f, i) => {
      // Environmental Impact Score — higher = more harmful
      const normCO2    = f.co2Emissions / maxCO2;
      const normEnergy = f.energyConsumption / maxEnergy;
      const normWater  = f.waterConsumption / maxWater;
      const normWaste  = f.wasteQuantity / maxWaste;
      const eis = r1((normCO2 * 0.40 + normEnergy * 0.30 + normWaste * 0.20 + normWater * 0.10) * 100);

      // Recovery Opportunity Score — higher = better economic opportunity
      const mf  = METAL_VALUE_FACTOR[f.metalType] || 0.50;
      const normProd = f.productionVolume / maxProduction;
      const ros = r1((f.recoveryPotential * 0.55 + mf * 0.30 + normProd * 0.15) * 100);

      // Circularity Score — higher = better circular economy performance
      const wasteRecyc   = WASTE_RECYCLABILITY[f.wasteType] || 0.50;
      const normTrans    = transportEmissions[i] / maxTransport;
      const transEff     = 1 - normTrans;
      const cs = r1((f.recoveryPotential * 0.40 + wasteRecyc * 0.35 + transEff * 0.25) * 100);

      // Priority Score — where to intervene first
      const priority = r1(eis * 0.45 + (100 - cs) * 0.30 + ros * 0.25);

      const co2Share       = r1(f.co2Emissions / totalCO2 * 100);
      const transportCO2   = Math.round(transportEmissions[i]);
      const recoverableMt  = Math.round(f.productionVolume * f.recoveryPotential);

      return {
        ...f,
        eis, ros, cs, priority,
        co2Share, transportCO2, recoverableMt,
        normTrans,
        // normalised refs for detail panel bars
        _normCO2: normCO2, _normEnergy: normEnergy,
        _normWater: normWater, _normWaste: normWaste,
        _totalCO2: totalCO2, _totalWater: totalWater, _totalEnergy: totalEnergy
      };
    });

    // Rankings
    const byEIS       = [...scored].sort((a, b) => b.eis - a.eis);
    const byROS       = [...scored].sort((a, b) => b.ros - a.ros);
    const byCS        = [...scored].sort((a, b) => b.cs - a.cs);
    const byPriority  = [...scored].sort((a, b) => b.priority - a.priority);
    const byTransport = [...scored].sort((a, b) => b.transportCO2 - a.transportCO2);
    const byWaste     = [...scored].sort((a, b) => b.wasteQuantity - a.wasteQuantity);

    // Add rank fields
    scored.forEach(f => {
      f.eisRank       = byEIS.findIndex(x => x.id === f.id) + 1;
      f.rosRank       = byROS.findIndex(x => x.id === f.id) + 1;
      f.csRank        = byCS.findIndex(x => x.id === f.id) + 1;
      f.priorityRank  = byPriority.findIndex(x => x.id === f.id) + 1;
      f.transportRank = byTransport.findIndex(x => x.id === f.id) + 1;
    });

    // Regional aggregation
    const regionMap = {};
    scored.forEach(f => {
      if (!regionMap[f.region]) {
        regionMap[f.region] = { name: f.region, facilities: [], totalCO2: 0, totalWaste: 0, totalEnergy: 0 };
      }
      const r = regionMap[f.region];
      r.facilities.push(f);
      r.totalCO2    += f.co2Emissions;
      r.totalWaste  += f.wasteQuantity;
      r.totalEnergy += f.energyConsumption;
    });
    const regional = Object.values(regionMap).map(r => ({
      ...r,
      avgEIS: r1(r.facilities.reduce((s, f) => s + f.eis, 0) / r.facilities.length),
      avgCS:  r1(r.facilities.reduce((s, f) => s + f.cs,  0) / r.facilities.length),
      avgROS: r1(r.facilities.reduce((s, f) => s + f.ros, 0) / r.facilities.length),
      co2Share: r1(r.totalCO2 / totalCO2 * 100)
    })).sort((a, b) => b.totalCO2 - a.totalCO2);

    const highlights = {
      highestImpact:   byEIS[0],
      highestRecovery: byROS[0],
      bestCircularity: byCS[0],
      topPriority:     byPriority[0],
      mostCriticalWaste: byWaste[0],
      highestTransport:  byTransport[0],
      highestEmissionRegion: regional[0]
    };

    const totals = { totalCO2, totalWaste, totalEnergy, totalWater };
    const rankings = { byEIS, byROS, byCS, byPriority, byTransport };
    const facilityMap = {};
    scored.forEach(f => { facilityMap[f.id] = f; });

    return { facilities: scored, rankings, highlights, regional, totals, facilityMap };
  }

  function generateInsights(f, data) {
    const { rankings, totals, highlights } = data;
    const insights = [];
    const recov = f.recoverableMt.toLocaleString();

    // CO2 share
    if (f.eisRank === 1) {
      insights.push(`This is the <strong>highest-impact facility</strong> in the portfolio, contributing <strong>${f.co2Share}%</strong> of total project CO₂. Intervention here produces the greatest system-wide emissions reduction.`);
    } else if (f.eisRank <= 3) {
      insights.push(`Ranked <strong>#${f.eisRank} globally by environmental impact</strong>, this facility contributes <strong>${f.co2Share}%</strong> of total CO₂ — placing it in the critical intervention tier.`);
    } else {
      insights.push(`Contributing <strong>${f.co2Share}%</strong> of total project CO₂, this facility ranks <strong>#${f.eisRank}</strong> by environmental impact score across the portfolio.`);
    }

    // Recovery
    if (f.rosRank === 1) {
      insights.push(`This site presents the <strong>highest metal recovery opportunity</strong> in the portfolio — <strong>${recov} tonnes</strong> of ${f.metalType} recoverable annually at ${pct(f.recoveryPotential)} potential.`);
    } else {
      insights.push(`With <strong>${pct(f.recoveryPotential)} recovery potential</strong>, approximately <strong>${recov} tonnes</strong> of ${f.metalType} is recoverable annually (ranked <strong>#${f.rosRank}</strong> for recovery opportunity).`);
    }

    // Circularity
    if (f.csRank === 1) {
      insights.push(`This facility demonstrates the <strong>strongest circularity performance</strong> in the network. ${f.wasteType} waste has high recyclability — this operational model should be replicated across the portfolio.`);
    } else if (f.cs < 40) {
      insights.push(`Circularity is critically low (<strong>${f.cs}/100</strong>). ${f.wasteType} has limited recyclability and transport emissions are high. This site has the <strong>largest circularity improvement opportunity</strong>.`);
    } else {
      insights.push(`Circularity score of <strong>${f.cs}/100</strong> (ranked #${f.csRank}). ${f.wasteType} recyclability ${f.cs > 65 ? 'is above average — maintain and extend' : 'can be improved with secondary processing investment'}.`);
    }

    // Transport
    const tco2str = f.transportCO2 >= 1000
      ? `~${Math.round(f.transportCO2 / 1000).toLocaleString()}k tonnes`
      : `${f.transportCO2.toLocaleString()} tonnes`;
    if (f.transportRank === 1) {
      insights.push(`The <strong>${f.transportRoute.distanceKm.toLocaleString()}km ${f.transportRoute.mode} route</strong> to ${f.transportRoute.destination} generates <strong>${tco2str}</strong> of logistics CO₂ — the <strong>highest transport emission</strong> in the network. Route optimisation is a critical lever.`);
    } else {
      insights.push(`${f.transportRoute.mode} transport to ${f.transportRoute.destination} (${f.transportRoute.distanceKm.toLocaleString()}km) generates <strong>${tco2str}</strong> of logistics CO₂ annually (ranked #${f.transportRank} in the network).`);
    }

    return insights;
  }

  function generateRecommendations(f, data) {
    const { totals, rankings } = data;
    const recs = [];

    if (f.eis > 70) {
      recs.push({ level: 'critical', icon: '🔴', text: 'Conduct an immediate emissions reduction audit — this facility is in the critical impact tier.' });
    } else if (f.eis > 50) {
      recs.push({ level: 'high', icon: '⚠', text: 'Prioritise a carbon reduction programme — this facility is a significant emission source.' });
    }

    if (f.recoveryPotential > 0.75) {
      recs.push({ level: 'high', icon: '♻', text: `Deploy advanced ${f.metalType} recovery systems to capture the ${pct(f.recoveryPotential)} high-value metal stream.` });
    } else if (f.recoveryPotential > 0.55 && f.cs < 60) {
      recs.push({ level: 'medium', icon: '📈', text: `${f.metalType} recovery rate can be improved — evaluate secondary processing investment.` });
    }

    const waterShare = f.waterConsumption / totals.totalWater;
    if (waterShare > 0.25) {
      recs.push({ level: 'critical', icon: '💧', text: 'Water consumption is disproportionately high — implement closed-loop recycling systems immediately.' });
    } else if (waterShare > 0.10) {
      recs.push({ level: 'high', icon: '💧', text: 'Investigate water recycling opportunities to reduce consumption below portfolio average.' });
    }

    if (f.transportRank <= 3) {
      recs.push({ level: 'high', icon: '🚛', text: `${f.transportRoute.mode} route to ${f.transportRoute.destination} is a major logistics emission source — evaluate modal shift or route optimisation.` });
    }

    if (f.wasteQuantity > 10000000) {
      recs.push({ level: 'high', icon: '⚡', text: `${(f.wasteQuantity / 1e6).toFixed(1)}M tonnes of ${f.wasteType} requires an urgent waste valorisation or reduction strategy.` });
    }

    const energyShare = f.energyConsumption / totals.totalEnergy;
    if (energyShare > 0.20) {
      recs.push({ level: 'high', icon: '⚡', text: 'Energy intensity is very high — evaluate renewable energy transition as a priority action.' });
    }

    if (f.cs > 80) {
      recs.push({ level: 'positive', icon: '✅', text: 'Best-in-class circularity — document practices and use this facility as a portfolio benchmark.' });
    }

    if (recs.length === 0) {
      recs.push({ level: 'positive', icon: '✅', text: 'Performance is within acceptable range — continue monitoring and incremental improvement.' });
    }

    return recs.slice(0, 5);
  }

  function eisLabel(eis) {
    if (eis >= 70) return 'Critical';
    if (eis >= 50) return 'High';
    if (eis >= 30) return 'Moderate';
    return 'Low';
  }

  function eisClass(eis) {
    if (eis >= 70) return 'critical';
    if (eis >= 50) return 'high';
    if (eis >= 30) return 'medium';
    return 'low';
  }

  function pct(v) { return Math.round(v * 100) + '%'; }
  function r1(v)  { return Math.round(v * 10) / 10; }

  return { compute, generateInsights, generateRecommendations, eisLabel, eisClass };
})();
