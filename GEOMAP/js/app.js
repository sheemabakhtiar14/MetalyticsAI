// Entry point — wire analytics → map → UI

document.addEventListener('DOMContentLoaded', () => {
  const analyticsData = Analytics.compute(FACILITY_DATA);
  GeoMap.init(analyticsData);
  UI.init(analyticsData);
});
