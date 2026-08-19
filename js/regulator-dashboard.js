document.addEventListener("DOMContentLoaded", () => {
    console.log("Regulator dashboard JS loaded");

    const API_BASE = "https://vettrace-backend.onrender.com";

    fetch(`${API_BASE}/regulator/dashboard`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return response.json();
        })
        .then(data => {
            console.log("Regulator API data:", data);

            const values = document.querySelectorAll(".summary-card .value");

            values[0].textContent = data.totalAMURecords;
            values[1].textContent = data.activeWithdrawals;
            values[2].textContent = data.compliantRecords;
            values[3].textContent = data.flaggedRecords;

            document.getElementById("accessValue").textContent =
    data.awareUsage.Access || 0;
    document.getElementById("watchValue").textContent =
    data.awareUsage.Watch || 0;

document.getElementById("reserveValue").textContent =
    data.awareUsage.Reserve || 0;

    const tableBody = document.getElementById("amuRecordsBody");

tableBody.innerHTML = "";

data.records.forEach(record => {
    const row = document.createElement("tr");

    let statusText = "Unknown";
    let statusClass = "";

    if (record.status === "WITHDRAWAL_ACTIVE") {
        statusText = "Under Withdrawal";
        statusClass = "withdrawal";
    } else if (record.status === "COMPLIANT") {
        statusText = "Compliant";
        statusClass = "compliant";
    } else if (record.status === "FLAGGED") {
        statusText = "Flagged";
        statusClass = "flagged";
    }

    row.innerHTML = `
        <td>${record.animalId}</td>
        <td>${record.amuRecordId}</td>
        <td>${record.awareCategory || "—"}</td>
        <td>${record.withdrawalDays ?? "—"} days</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
    `;

    tableBody.appendChild(row);
});
        })
        .catch(error => {
            console.error("Regulator API error:", error);
        });
});
