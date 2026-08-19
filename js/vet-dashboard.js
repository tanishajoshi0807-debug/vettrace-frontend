document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "https://vettrace-backend-1.onrender.com";

    // =========================
    // ELEMENTS
    // =========================

    const form = document.getElementById("prescriptionForm");
    const animalSelect = document.getElementById("animal");
    const drugSelect = document.getElementById("drug");
    const withdrawalPeriod =
        document.getElementById("withdrawalPeriod");
    const prescriptionStatus =
        document.getElementById("prescriptionStatus");

    let drugMaster = [];


    // =========================
    // CREATE PRESCRIPTION
    // =========================

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const animalId = animalSelect.value;
        const drugId = drugSelect.value;
        const diagnosis =
            document.getElementById("diagnosis").value;
        const dosage =
            document.getElementById("dosage").value;
        const date =
            document.getElementById("date").value;

        if (!animalId || !drugId || !diagnosis || !dosage || !date) {

            prescriptionStatus.textContent =
                "Please fill in all fields.";

            prescriptionStatus.style.display = "block";

            return;
        }

        const prescriptionId = "RX" + Date.now();

        const prescriptionData = {

            prescriptionId: prescriptionId,

            vetId: "VET001",

            animalId: animalId,

            drugId: drugId,

            dosage: dosage,

            diagnosis: diagnosis,

            date: date
        };

        try {

            const response = await fetch(
                `${API_BASE}/prescriptions`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(
                        prescriptionData
                    )
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    `API error: ${response.status}`
                );
            }

            prescriptionStatus.textContent =
                "Prescription created successfully.";

            prescriptionStatus.style.display = "block";

            form.reset();

            withdrawalPeriod.value =
                "Select an animal";

            // Refresh prescription table
            loadPrescriptions();

        } catch (error) {

            console.error(
                "Prescription API error:",
                error
            );

            prescriptionStatus.textContent =
                "Error: " + error.message;

            prescriptionStatus.style.display = "block";
        }

    });


    // =========================
    // ANIMAL WITHDRAWAL STATUS
    // =========================

    animalSelect.addEventListener("change", async () => {

        const animalId = animalSelect.value;

        if (!animalId) {

            withdrawalPeriod.value =
                "Select an animal";

            return;
        }

        try {

            const response = await fetch(
                `${API_BASE}/animals/${animalId}/withdrawal-status`
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    `API error: ${response.status}`
                );
            }

            withdrawalPeriod.value =
                `${data.withdrawalDays} days — ${data.status}`;

        } catch (error) {

            console.error(
                "Withdrawal API error:",
                error
            );

            withdrawalPeriod.value =
                "Unable to load status";
        }

    });


    // =========================
    // LOAD DRUG MASTER
    // =========================

    async function loadDrugMaster() {

        try {

            const response =
                await fetch(`${API_BASE}/drug-master`);

            if (!response.ok) {

                throw new Error(
                    `API error: ${response.status}`
                );
            }

            const data = await response.json();

            console.log(
                "Drug Master data:",
                data
            );

            drugMaster = data.drugs || [];

            drugSelect.innerHTML = `
                <option value="">
                    Select drug
                </option>
            `;

            drugMaster.forEach(drug => {

                const option =
                    document.createElement("option");

                option.value = drug.drugId;

                option.textContent =
                    `${drug.drugName} (${drug.awareCategory})`;

                drugSelect.appendChild(option);

            });

        } catch (error) {

            console.error(
                "Drug Master API error:",
                error
            );
        }

    }


    // =========================
    // DRUG SELECTION
    // =========================

    drugSelect.addEventListener("change", () => {

        const selectedDrugId =
            drugSelect.value;

        if (!selectedDrugId) {

            withdrawalPeriod.value =
                "Select a drug";

            return;
        }

        const selectedDrug =
            drugMaster.find(
                drug =>
                    drug.drugId === selectedDrugId
            );

        if (!selectedDrug) {

            withdrawalPeriod.value =
                "Withdrawal period unavailable";

            return;
        }

        withdrawalPeriod.value =
            `${selectedDrug.withdrawalDays} days`;

    });


    // =========================
    // LOAD PRESCRIPTIONS
    // =========================

    async function loadPrescriptions() {

        const tableBody =
            document.getElementById(
                "prescriptionsTableBody"
            );

        if (!tableBody) {
            return;
        }

        try {

            const response =
                await fetch(
                    `${API_BASE}/prescriptions`
                );

            if (!response.ok) {

                throw new Error(
                    `API error: ${response.status}`
                );
            }

            const data =
                await response.json();

            console.log(
                "Prescriptions data:",
                data
            );

            tableBody.innerHTML = "";

            const prescriptions =
                data.prescriptions || [];

            if (prescriptions.length === 0) {

                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6">
                            No prescriptions found.
                        </td>
                    </tr>
                `;

                return;
            }

            prescriptions.forEach(
                prescription => {

                    const row =
                        document.createElement("tr");

                    row.innerHTML = `

                        <td>
                            ${prescription.animalId || "—"}
                        </td>

                        <td>
                            ${prescription.drugName ||
                            prescription.drugId ||
                            "—"}
                        </td>

                        <td>
                            ${prescription.diagnosis || "—"}
                        </td>

                        <td>
                            ${prescription.dosage || "—"}
                        </td>

                        <td>
                            ${prescription.date || "—"}
                        </td>

                        <td>
                            <span class="badge withdrawal">
                                Recorded
                            </span>
                        </td>

                    `;

                    tableBody.appendChild(row);

                }
            );

        } catch (error) {

            console.error(
                "Prescription loading error:",
                error
            );

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        Unable to load prescriptions
                    </td>
                </tr>
            `;

        }

    }


    // =========================
    // INITIAL LOAD
    // =========================

    loadDrugMaster();

    loadPrescriptions();

});
