const form = document.querySelector("#gap-form");
const recycledValue = document.querySelector("#recycled-value");
const tableBody = document.querySelector("#metrics-table");
const progressLabel = document.querySelector("#progress-label");
const progressBar = document.querySelector("#progress-bar");
const statusCard = document.querySelector("#status-card");
const recommendations = document.querySelector("#recommendations");
const downloadLink = document.querySelector("#download-link");

const chartTargets = {
  gap: "gap-chart",
  components: "components-chart",
};

let updateTimer;
let sharedSnapshot = "";
let applyingSharedInputs = false;

function collectInputs() {
  const values = {};
  const formData = new FormData(form);

  formData.forEach((value, key) => {
    values[key] = Number(value);
  });

  return values;
}

function queryStringFromInputs(inputs) {
  return new URLSearchParams(inputs).toString();
}

function sharedSignature(inputs) {
  return JSON.stringify({
    production_amount: inputs.production_amount,
    useful_output: inputs.useful_output,
    waste_generated: inputs.waste_generated,
    recovered_material: inputs.recovered_material,
    recycled_content: inputs.recycled_content,
  });
}

function applySharedInputs(shared) {
  let changed = false;

  Object.entries(shared).forEach(([key, value]) => {
    const input = form.elements[key];
    if (!input || Number(input.value) === Number(value)) {
      return;
    }

    input.value = value;
    changed = true;
  });

  if (changed) {
    applyingSharedInputs = true;
    refreshDashboard()
      .catch((error) => {
        statusCard.className = "status-card danger";
        statusCard.textContent = error.message;
      })
      .finally(() => {
        applyingSharedInputs = false;
      });
  }
}

function updateCards(cards) {
  Object.entries(cards).forEach(([key, value]) => {
    const target = document.querySelector(`[data-card="${key}"]`);
    if (target) {
      target.textContent = value;
    }
  });
}

function updateProgress(progress) {
  progressLabel.textContent = `${progress.value.toFixed(2)}%`;
  progressBar.style.width = `${progress.width}%`;
}

function updateTable(rows) {
  tableBody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.Metric}</td>
          <td>${row["Value (%)"]}</td>
        </tr>
      `,
    )
    .join("");
}

function updateCharts(charts) {
  Object.entries(charts).forEach(([name, chart]) => {
    Plotly.react(chartTargets[name], chart.data, chart.layout, {
      responsive: true,
      displayModeBar: false,
    });
  });
}

function updateStatus(status) {
  statusCard.className = `status-card ${status.tone}`;
  statusCard.textContent = status.label;
}

function updateRecommendations(items) {
  recommendations.innerHTML = items
    .map((item) => `<div class="recommendation">${item}</div>`)
    .join("");
}

async function refreshDashboard() {
  const inputs = collectInputs();
  recycledValue.textContent = inputs.recycled_content;
  downloadLink.href = `/download?${queryStringFromInputs(inputs)}`;

  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
  });

  if (!response.ok) {
    throw new Error("Could not update circularity metrics");
  }

  const payload = await response.json();
  sharedSnapshot = sharedSignature(payload.inputs);
  updateCards(payload.cards);
  updateProgress(payload.progress);
  updateTable(payload.table);
  updateCharts(payload.charts);
  updateStatus(payload.status);
  updateRecommendations(payload.recommendations);
}

function scheduleRefresh() {
  window.clearTimeout(updateTimer);
  updateTimer = window.setTimeout(() => {
    refreshDashboard().catch((error) => {
      statusCard.className = "status-card danger";
      statusCard.textContent = error.message;
    });
  }, 150);
}

form.addEventListener("input", scheduleRefresh);
form.addEventListener("change", scheduleRefresh);

async function syncSharedInputs() {
  if (applyingSharedInputs) {
    return;
  }

  try {
    const response = await fetch("/api/shared");
    if (!response.ok) {
      return;
    }

    const shared = await response.json();
    const signature = sharedSignature({ ...collectInputs(), ...shared });
    if (signature !== sharedSnapshot) {
      sharedSnapshot = signature;
      applySharedInputs(shared);
    }
  } catch (error) {
    // The page should keep working even if the shared endpoint is briefly unavailable.
  }
}

window.addEventListener("resize", () => {
  Object.values(chartTargets).forEach((target) => Plotly.Plots.resize(target));
});

refreshDashboard();
window.setInterval(syncSharedInputs, 1000);
