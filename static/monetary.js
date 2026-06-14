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

  return values;
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
