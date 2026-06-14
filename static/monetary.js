const form = document.querySelector("#monetary-form");
const recycledValue = document.querySelector("#recycled-value");
const tableBody = document.querySelector("#monetary-table");

let updateTimer;

function collectInputs() {
  const values = {};
  const formData = new FormData(form);

  formData.forEach((value, key) => {
    values[key] = Number(value);
  });

  constrainMaterialInputs(values, form);
  return values;
}

function constrainMaterialInputs(values, targetForm) {
  const production = Math.max(1, Number(values.production_amount) || 1);
  values.production_amount = production;
  values.useful_output = Math.min(Math.max(0, Number(values.useful_output) || 0), production);
  values.waste_generated = Math.min(Math.max(0, Number(values.waste_generated) || 0), production);
  values.recovered_material = Math.min(
    Math.max(0, Number(values.recovered_material) || 0),
    values.waste_generated,
  );

  ["production_amount", "useful_output", "waste_generated", "recovered_material"].forEach((key) => {
    if (targetForm.elements[key] && Number(targetForm.elements[key].value) !== values[key]) {
      targetForm.elements[key].value = values[key];
    }
  });
}

function formatValue(metric, value) {
  const number = Number(value);
  if (metric.includes("₹")) {
    return `₹${number.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  return number.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function updateCards(cards) {
  Object.entries(cards).forEach(([key, value]) => {
    const target = document.querySelector(`[data-card="${key}"]`);
    if (target) {
      target.textContent = value;
    }
  });
}

function updateTable(rows) {
  tableBody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.Metric}</td>
          <td>${formatValue(row.Metric, row.Value)}</td>
        </tr>
      `,
    )
    .join("");
}

function updateChart(chart) {
  Plotly.react("monetary-chart", chart.data, chart.layout, {
    responsive: true,
    displayModeBar: false,
  });
}

async function refreshMonetaryImpact() {
  const inputs = collectInputs();
  localStorage.setItem("sustainability_monetary_inputs", JSON.stringify(inputs));
  recycledValue.textContent = inputs.recycled_content;

  const response = await fetch("/api/monetary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
  });

  if (!response.ok) {
    throw new Error("Could not calculate monetary impact");
  }

  const payload = await response.json();
  updateCards(payload.cards);
  updateTable(payload.table);
  updateChart(payload.chart);
}

function scheduleRefresh() {
  window.clearTimeout(updateTimer);
  updateTimer = window.setTimeout(() => {
    refreshMonetaryImpact().catch((error) => {
      tableBody.innerHTML = `<tr><td colspan="2">${error.message}</td></tr>`;
    });
  }, 150);
}

form.addEventListener("input", scheduleRefresh);
form.addEventListener("change", scheduleRefresh);
window.addEventListener("resize", () => Plotly.Plots.resize("monetary-chart"));

refreshMonetaryImpact();
