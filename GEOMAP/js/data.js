// Facility and transportation data — 15 real Indian mining/processing locations

const METAL_VALUE_FACTOR = {
  'Rare Earth': 1.00, 'Gold': 0.95, 'Cobalt': 0.90, 'Lithium': 0.85,
  'Zinc': 0.82, 'Nickel': 0.75, 'Copper': 0.70, 'Titanium': 0.68,
  'Lead': 0.50, 'Steel': 0.48, 'Iron': 0.40
};

const WASTE_RECYCLABILITY = {
  'Sulfide Slag':         0.72,
  'Mining Tailings':      0.55,
  'Brine Waste':          0.30,
  'Overburden':           0.25,
  'Radioactive Tailings': 0.20,
  'Acid Mine Drainage':   0.35,
  'Sulfide Tailings':     0.68,
  'Inert Rock Waste':     0.85,
  'Steel Slag':           0.90,
  'Riverine Tailings':    0.15,
  'Copper Tailings':      0.60,
  'Red Mud':              0.28,
  'Processing Effluent':  0.55,
  'Lead Slag':            0.65,
  'Lignite Ash':          0.45
};

const FACILITY_DATA = [
  {
    id: 'F001',
    name: 'Rampura Agucha Zinc Mine',
    shortName: 'Rampura Agucha',
    country: 'India',
    region: 'Rajasthan',
    flag: '🇮🇳',
    lat: 25.07, lng: 74.57,
    metalType: 'Zinc',
    productionVolume: 920000,
    wasteType: 'Mining Tailings',
    wasteQuantity: 16500000,
    co2Emissions: 4800000,
    energyConsumption: 24000,
    waterConsumption: 210000000,
    recoveryPotential: 0.84,
    transportRoute: {
      id: 'R001', destination: 'Kandla Port',
      destLat: 23.03, destLng: 70.22,
      mode: 'Rail', distanceKm: 620, co2PerTonneKm: 0.045
    }
  },
  {
    id: 'F002',
    name: 'Dariba Zinc-Lead Complex',
    shortName: 'Dariba',
    country: 'India',
    region: 'Rajasthan',
    flag: '🇮🇳',
    lat: 25.48, lng: 73.89,
    metalType: 'Lead',
    productionVolume: 185000,
    wasteType: 'Sulfide Tailings',
    wasteQuantity: 3200000,
    co2Emissions: 1650000,
    energyConsumption: 9800,
    waterConsumption: 72000000,
    recoveryPotential: 0.79,
    transportRoute: {
      id: 'R002', destination: 'Mundra Port',
      destLat: 22.84, destLng: 69.72,
      mode: 'Rail', distanceKm: 540, co2PerTonneKm: 0.045
    }
  },
  {
    id: 'F003',
    name: 'Malanjkhand Copper Mine',
    shortName: 'Malanjkhand',
    country: 'India',
    region: 'Madhya Pradesh',
    flag: '🇮🇳',
    lat: 22.11, lng: 81.18,
    metalType: 'Copper',
    productionVolume: 74000,
    wasteType: 'Acid Mine Drainage',
    wasteQuantity: 5400000,
    co2Emissions: 2100000,
    energyConsumption: 13000,
    waterConsumption: 95000000,
    recoveryPotential: 0.71,
    transportRoute: {
      id: 'R003', destination: 'Nagpur Hub',
      destLat: 21.15, destLng: 79.09,
      mode: 'Road', distanceKm: 285, co2PerTonneKm: 0.096
    }
  },
  {
    id: 'F004',
    name: 'Panna Diamond Mine',
    shortName: 'Panna',
    country: 'India',
    region: 'Madhya Pradesh',
    flag: '🇮🇳',
    lat: 24.72, lng: 80.19,
    metalType: 'Rare Earth',
    productionVolume: 18000,
    wasteType: 'Radioactive Tailings',
    wasteQuantity: 620000,
    co2Emissions: 380000,
    energyConsumption: 2800,
    waterConsumption: 22000000,
    recoveryPotential: 0.88,
    transportRoute: {
      id: 'R004', destination: 'Prayagraj Hub',
      destLat: 25.43, destLng: 81.84,
      mode: 'Road', distanceKm: 210, co2PerTonneKm: 0.096
    }
  },
  {
    id: 'F005',
    name: 'NMDC Bailadila Iron Complex',
    shortName: 'Bailadila',
    country: 'India',
    region: 'Chhattisgarh',
    flag: '🇮🇳',
    lat: 18.81, lng: 81.35,
    metalType: 'Iron',
    productionVolume: 680000,
    wasteType: 'Overburden',
    wasteQuantity: 22000000,
    co2Emissions: 5100000,
    energyConsumption: 21500,
    waterConsumption: 130000000,
    recoveryPotential: 0.52,
    transportRoute: {
      id: 'R005', destination: 'Visakhapatnam Port',
      destLat: 17.69, destLng: 83.22,
      mode: 'Rail', distanceKm: 445, co2PerTonneKm: 0.045
    }
  },
  {
    id: 'F006',
    name: 'Rowghat Iron Ore Project',
    shortName: 'Rowghat',
    country: 'India',
    region: 'Chhattisgarh',
    flag: '🇮🇳',
    lat: 20.47, lng: 81.03,
    metalType: 'Iron',
    productionVolume: 310000,
    wasteType: 'Mining Tailings',
    wasteQuantity: 9800000,
    co2Emissions: 2400000,
    energyConsumption: 10500,
    waterConsumption: 58000000,
    recoveryPotential: 0.48,
    transportRoute: {
      id: 'R006', destination: 'Raipur Hub',
      destLat: 21.25, destLng: 81.63,
      mode: 'Road', distanceKm: 140, co2PerTonneKm: 0.096
    }
  },
  {
    id: 'F007',
    name: 'Noamundi Iron Mine',
    shortName: 'Noamundi',
    country: 'India',
    region: 'Jharkhand',
    flag: '🇮🇳',
    lat: 22.16, lng: 85.51,
    metalType: 'Iron',
    productionVolume: 420000,
    wasteType: 'Overburden',
    wasteQuantity: 14500000,
    co2Emissions: 3200000,
    energyConsumption: 15000,
    waterConsumption: 80000000,
    recoveryPotential: 0.55,
    transportRoute: {
      id: 'R007', destination: 'Haldia Port',
      destLat: 22.07, destLng: 88.07,
      mode: 'Rail', distanceKm: 380, co2PerTonneKm: 0.045
    }
  },
  {
    id: 'F008',
    name: 'Tata Steel Jamshedpur',
    shortName: 'Jamshedpur',
    country: 'India',
    region: 'Jharkhand',
    flag: '🇮🇳',
    lat: 22.80, lng: 86.18,
    metalType: 'Steel',
    productionVolume: 10000000,
    wasteType: 'Steel Slag',
    wasteQuantity: 4800000,
    co2Emissions: 9200000,
    energyConsumption: 46000,
    waterConsumption: 320000000,
    recoveryPotential: 0.78,
    transportRoute: {
      id: 'R008', destination: 'Haldia Port',
      destLat: 22.07, destLng: 88.07,
      mode: 'Rail', distanceKm: 295, co2PerTonneKm: 0.045
    }
  },
  {
    id: 'F009',
    name: 'BCCL Dhanbad Coal Complex',
    shortName: 'Dhanbad',
    country: 'India',
    region: 'Jharkhand',
    flag: '🇮🇳',
    lat: 23.80, lng: 86.45,
    metalType: 'Nickel',
    productionVolume: 350000,
    wasteType: 'Processing Effluent',
    wasteQuantity: 7200000,
    co2Emissions: 6800000,
    energyConsumption: 32000,
    waterConsumption: 180000000,
    recoveryPotential: 0.60,
    transportRoute: {
      id: 'R009', destination: 'Kolkata Hub',
      destLat: 22.57, destLng: 88.36,
      mode: 'Rail', distanceKm: 265, co2PerTonneKm: 0.045
    }
  },
  {
    id: 'F010',
    name: 'NALCO Damanjodi Alumina',
    shortName: 'Damanjodi',
    country: 'India',
    region: 'Odisha',
    flag: '🇮🇳',
    lat: 18.74, lng: 82.73,
    metalType: 'Nickel',
    productionVolume: 2100000,
    wasteType: 'Red Mud',
    wasteQuantity: 12000000,
    co2Emissions: 4500000,
    energyConsumption: 28000,
    waterConsumption: 160000000,
    recoveryPotential: 0.42,
    transportRoute: {
      id: 'R010', destination: 'Visakhapatnam Port',
      destLat: 17.69, destLng: 83.22,
      mode: 'Rail', distanceKm: 180, co2PerTonneKm: 0.045
    }
  },
  {
    id: 'F011',
    name: 'OMDC Keonjhar Iron Ore',
    shortName: 'Keonjhar',
    country: 'India',
    region: 'Odisha',
    flag: '🇮🇳',
    lat: 21.63, lng: 85.58,
    metalType: 'Iron',
    productionVolume: 490000,
    wasteType: 'Inert Rock Waste',
    wasteQuantity: 17000000,
    co2Emissions: 3700000,
    energyConsumption: 17500,
    waterConsumption: 95000000,
    recoveryPotential: 0.61,
    transportRoute: {
      id: 'R011', destination: 'Paradip Port',
      destLat: 20.31, destLng: 86.61,
      mode: 'Rail', distanceKm: 260, co2PerTonneKm: 0.045
    }
  },
  {
    id: 'F012',
    name: 'Hutti Gold Mines',
    shortName: 'Hutti',
    country: 'India',
    region: 'Karnataka',
    flag: '🇮🇳',
    lat: 16.19, lng: 76.63,
    metalType: 'Gold',
    productionVolume: 2800,
    wasteType: 'Sulfide Tailings',
    wasteQuantity: 480000,
    co2Emissions: 290000,
    energyConsumption: 1900,
    waterConsumption: 14000000,
    recoveryPotential: 0.92,
    transportRoute: {
      id: 'R012', destination: 'Chennai Port',
      destLat: 13.08, destLng: 80.29,
      mode: 'Road', distanceKm: 520, co2PerTonneKm: 0.096
    }
  },
  {
    id: 'F013',
    name: 'NMDC Donimalai Iron Ore',
    shortName: 'Donimalai',
    country: 'India',
    region: 'Karnataka',
    flag: '🇮🇳',
    lat: 15.13, lng: 76.92,
    metalType: 'Iron',
    productionVolume: 280000,
    wasteType: 'Inert Rock Waste',
    wasteQuantity: 8500000,
    co2Emissions: 1950000,
    energyConsumption: 9200,
    waterConsumption: 48000000,
    recoveryPotential: 0.58,
    transportRoute: {
      id: 'R013', destination: 'Mormugao Port',
      destLat: 15.41, destLng: 73.80,
      mode: 'Rail', distanceKm: 340, co2PerTonneKm: 0.045
    }
  },
  {
    id: 'F014',
    name: 'Sesa Goa Iron Ore Mines',
    shortName: 'Sesa Goa',
    country: 'India',
    region: 'Goa',
    flag: '🇮🇳',
    lat: 15.38, lng: 73.96,
    metalType: 'Iron',
    productionVolume: 120000,
    wasteType: 'Mining Tailings',
    wasteQuantity: 4200000,
    co2Emissions: 1100000,
    energyConsumption: 5500,
    waterConsumption: 35000000,
    recoveryPotential: 0.53,
    transportRoute: {
      id: 'R014', destination: 'Mormugao Port',
      destLat: 15.41, destLng: 73.80,
      mode: 'Road', distanceKm: 28, co2PerTonneKm: 0.096
    }
  },
  {
    id: 'F015',
    name: 'NLC Neyveli Lignite Corporation',
    shortName: 'Neyveli',
    country: 'India',
    region: 'Tamil Nadu',
    flag: '🇮🇳',
    lat: 11.60, lng: 79.48,
    metalType: 'Lead',
    productionVolume: 275000,
    wasteType: 'Lignite Ash',
    wasteQuantity: 5800000,
    co2Emissions: 7600000,
    energyConsumption: 38000,
    waterConsumption: 240000000,
    recoveryPotential: 0.35,
    transportRoute: {
      id: 'R015', destination: 'Chennai Port',
      destLat: 13.08, destLng: 80.29,
      mode: 'Rail', distanceKm: 215, co2PerTonneKm: 0.045
    }
  }
];
