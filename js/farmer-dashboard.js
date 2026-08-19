document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // BACKEND
    // ==========================================

    const API_BASE = "https://vettrace-backend.onrender.com";


    // ==========================================
    // FARMER DASHBOARD
    // ==========================================

    async function loadFarmerDashboard() {

        try {

            console.log("Loading farmer dashboard...");

            const response = await fetch(
                `${API_BASE}/farmer/dashboard`
            );

            if (!response.ok) {
                throw new Error(
                    `API error: ${response.status}`
                );
            }

            const data = await response.json();

            console.log(
                "Farmer dashboard data:",
                data
            );


            // ======================================
            // SUMMARY CARDS
            // ======================================

            const summaryValues =
                document.querySelectorAll(
                    ".summary-card .value"
                );

            if (summaryValues.length >= 4) {

                summaryValues[0].textContent =
                    data.totalAnimals ?? 0;

                summaryValues[1].textContent =
                    data.activeWithdrawals ?? 0;

                summaryValues[2].textContent =
                    data.ongoingTreatments ?? 0;

                summaryValues[3].textContent =
                    data.compliancePasses ?? 0;
            }


            // ======================================
            // ANIMAL CARDS
            // ======================================

            const animalContainer =
                document.querySelector(".animal-cards");

            if (!animalContainer) {
                console.error(
                    "Animal cards container not found."
                );
                return;
            }

            animalContainer.innerHTML = "";


            if (
                !data.animals ||
                data.animals.length === 0
            ) {

                animalContainer.innerHTML = `
                    <p>No animal records found.</p>
                `;

                return;
            }


            // ======================================
            // CREATE ANIMAL CARDS
            // ======================================

            data.animals.forEach(animal => {

                let statusText = "Unknown";
                let statusClass = "";
                let countdownText = "";
                let progressWidth = 0;


                // ----------------------------------
                // ACTIVE WITHDRAWAL
                // ----------------------------------

                if (
                    animal.status ===
                    "WITHDRAWAL_ACTIVE"
                ) {

                    statusText =
                        "Withdrawal Active";

                    statusClass =
                        "withdrawal";

                    const seconds =
                        animal.remainingSeconds ?? 0;

                    countdownText =
                        formatTime(seconds);

                    progressWidth = 50;
                }


                // ----------------------------------
                // COMPLIANT
                // ----------------------------------

                else if (
                    animal.status ===
                    "COMPLIANT"
                ) {

                    statusText =
                        "Compliant";

                    statusClass =
                        "compliant";

                    countdownText =
                        "COMPLETE";

                    progressWidth = 100;
                }


                // ----------------------------------
                // FLAGGED
                // ----------------------------------

                else if (
                    animal.status ===
                    "FLAGGED"
                ) {

                    statusText =
                        "Flagged";

                    statusClass =
                        "flagged";

                    countdownText =
                        "REVIEW NEEDED";

                    progressWidth = 40;
                }


                // ----------------------------------
                // OTHER STATUS
                // ----------------------------------

                else {

                    statusText =
                        animal.status || "Unknown";

                    countdownText =
                        "—";
                }


                // ----------------------------------
                // DRUG NAME
                // ----------------------------------

                const drugName =
                    animal.drugName ||
                    "No active drug";


                // ----------------------------------
                // CREATE CARD
                // ----------------------------------

                const card =
                    document.createElement("div");

                card.className =
                    "animal-card";


                card.innerHTML = `

                    <div class="animal-card-top">

                        <div>
                            <h3>
                                ${animal.animalId}
                            </h3>

                            <p class="species">
                                ${animal.animalType || "Animal"}
                            </p>
                        </div>

                        <span
                            class="badge ${statusClass}"
                            id="status-${animal.animalId}"
                        >
                            ${statusText}
                        </span>

                    </div>


                    <div class="detail-row">

                        <span>Drug</span>

                        <span>
                            ${drugName}
                        </span>

                    </div>


                    <div class="detail-row">

                        <span>Withdrawal</span>

                        <span>
                            ${animal.withdrawalDays ?? 0} days
                        </span>

                    </div>


                    <div
                        class="countdown"
                        id="countdown-${animal.animalId}"
                    >
                        ${countdownText}
                    </div>


                    <div class="progress-bar-track">

                        <div
                            class="progress-bar-fill ${statusClass === "compliant" ? "green" : ""}"
                            id="progress-${animal.animalId}"
                            style="width:${progressWidth}%"
                        ></div>

                    </div>


                    <p
                        class="progress-label"
                        id="progress-label-${animal.animalId}"
                    >
                        ${progressWidth}% complete
                    </p>

                `;


                animalContainer.appendChild(card);


                // ==================================
                // START LIVE COUNTDOWN
                // ==================================

                if (
                    animal.status ===
                    "WITHDRAWAL_ACTIVE"
                ) {

                    startCountdown(
                        animal.animalId,
                        Number(
                            animal.remainingSeconds || 0
                        )
                    );

                }

            });


        } catch (error) {

            console.error(
                "Farmer dashboard API error:",
                error
            );


            const animalContainer =
                document.querySelector(".animal-cards");

            if (animalContainer) {

                animalContainer.innerHTML = `
                    <p>
                        Unable to load animal data.
                    </p>
                `;
            }

        }

    }


    // ==========================================
    // LIVE COUNTDOWN
    // ==========================================

    function startCountdown(
        animalId,
        remainingSeconds
    ) {

        let secondsLeft =
            Math.max(
                0,
                Number(remainingSeconds) || 0
            );


        const countdownElement =
            document.getElementById(
                `countdown-${animalId}`
            );

        const statusElement =
            document.getElementById(
                `status-${animalId}`
            );

        const progressElement =
            document.getElementById(
                `progress-${animalId}`
            );

        const progressLabel =
            document.getElementById(
                `progress-label-${animalId}`
            );


        if (!countdownElement) {
            return;
        }


        function updateCountdown() {

            if (secondsLeft <= 0) {

                countdownElement.textContent =
                    "COMPLETE";

                if (statusElement) {

                    statusElement.textContent =
                        "Compliant";

                    statusElement.className =
                        "badge compliant";
                }

                if (progressElement) {

                    progressElement.style.width =
                        "100%";

                    progressElement.className =
                        "progress-bar-fill green";
                }

                if (progressLabel) {

                    progressLabel.textContent =
                        "100% complete";
                }

                return;
            }


            countdownElement.textContent =
                formatTime(secondsLeft);


            // Decrease by one second
            secondsLeft--;

        }


        // Show immediately
        updateCountdown();


        // Continue every second
        const timer =
            setInterval(() => {

                if (secondsLeft <= 0) {

                    clearInterval(timer);

                    updateCountdown();

                    return;
                }

                updateCountdown();

            }, 1000);

    }


    // ==========================================
    // FORMAT COUNTDOWN
    // ==========================================

    function formatTime(totalSeconds) {

        totalSeconds =
            Math.max(
                0,
                Number(totalSeconds) || 0
            );

        const hours =
            Math.floor(
                totalSeconds / 3600
            );

        const minutes =
            Math.floor(
                (totalSeconds % 3600) / 60
            );

        const seconds =
            totalSeconds % 60;


        return (
            String(hours).padStart(2, "0") +
            " : " +
            String(minutes).padStart(2, "0") +
            " : " +
            String(seconds).padStart(2, "0")
        );

    }


    // ==========================================
    // FEED AMU
    // ==========================================

    const feedForm =
        document.getElementById("feedAmmuForm");


    if (feedForm) {

        feedForm.addEventListener(
            "submit",
            async (e) => {

                e.preventDefault();


                const animalId =
                    document.getElementById(
                        "feedAnimal"
                    ).value;

                const productName =
                    document.getElementById(
                        "productName"
                    ).value;

                const quantity =
                    document.getElementById(
                        "quantity"
                    ).value;

                const date =
                    document.getElementById(
                        "feedDate"
                    ).value;


                const feedData = {

                    logId:
                        "FEED" +
                        Date.now(),

                    farmerId:
                        "FARMER001",

                    animalId:
                        animalId,

                    productName:
                        productName,

                    quantity:
                        quantity,

                    date:
                        date

                };


                const feedStatus =
                    document.getElementById(
                        "feedStatus"
                    );


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/feed-logs`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        feedData
                                    )
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            `API error: ${response.status}`
                        );

                    }


                    feedStatus.textContent =
                        "Feed AMU recorded successfully.";

                    feedStatus.style.display =
                        "block";


                    feedForm.reset();


                } catch (error) {

                    console.error(
                        "Feed AMU error:",
                        error
                    );


                    feedStatus.textContent =
                        "Error: " +
                        error.message;

                    feedStatus.style.display =
                        "block";

                }

            }
        );

    }


    // ==========================================
    // CERTIFICATE GENERATION
    // ==========================================

    const certificateButton =
        document.getElementById(
            "generateCertificateBtn"
        );


    if (certificateButton) {

        certificateButton.addEventListener(
            "click",
            async () => {

                const animalId =
                    document.getElementById(
                        "certificateAnimal"
                    ).value;


                const certificateStatus =
                    document.getElementById(
                        "certificateStatus"
                    );


                if (!animalId) {

                    certificateStatus.textContent =
                        "Please select an animal.";

                    certificateStatus.style.display =
                        "block";

                    return;
                }


                certificateStatus.textContent =
                    "Checking withdrawal status...";

                certificateStatus.style.display =
                    "block";


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/certificates/${animalId}`,
                            {
                                method: "POST"
                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "Certificate response:",
                        data
                    );


                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            `API error: ${response.status}`
                        );

                    }


                    certificateStatus.innerHTML = `

                        Certificate created successfully!
                        <br>

                        Certificate ID:
                        <strong>
                            ${data.certificateId}
                        </strong>

                        <br>

                        <a
                            href="${data.verificationUrl}"
                            target="_blank"
                        >
                            Verify Certificate
                        </a>

                    `;


                    certificateStatus.style.display =
                        "block";


                } catch (error) {

                    console.error(
                        "Certificate API error:",
                        error
                    );


                    certificateStatus.textContent =
                        "Error: " +
                        error.message;

                    certificateStatus.style.display =
                        "block";

                }

            }
        );

    }


    // ==========================================
    // START DASHBOARD
    // ==========================================

    loadFarmerDashboard();
        // ==========================================
    // SIDEBAR NAVIGATION
    // ==========================================

    document.querySelectorAll(".sidebar nav a").forEach(link => {

        link.addEventListener("click", function (e) {

            const targetId = this.getAttribute("href");

            if (
                targetId &&
                targetId.startsWith("#") &&
                targetId !== "#"
            ) {

                e.preventDefault();

                const target =
                    document.querySelector(targetId);

                if (target) {

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }

        });

    });

});
