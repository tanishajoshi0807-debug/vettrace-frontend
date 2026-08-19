document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "https://vettrace-backend-1.onrender.com";

    // =========================
    // ELEMENTS
    // =========================

    const verifyButton =
        document.getElementById("verifyCertificateBtn");

    const certInput =
        document.getElementById("certId");

    const resultBox =
        document.getElementById("demoResult");

    const scanQrBtn =
        document.getElementById("scanQrBtn");

    // =========================
    // HIDE RESULT INITIALLY
    // =========================

    if (resultBox) {
        resultBox.style.display = "none";
    }

    // =========================
    // CERTIFICATE VERIFICATION
    // =========================

    if (verifyButton) {

        verifyButton.addEventListener("click", async () => {

            const certificateId = certInput.value.trim();

            if (!certificateId) {
                alert("Please enter a certificate ID.");
                return;
            }

            // Show result box only after verification starts
            resultBox.style.display = "block";

            resultBox.className = "verify-result";

            resultBox.innerHTML =
                "<p>Verifying certificate...</p>";

            try {

                const response = await fetch(
                    `${API_BASE}/certificates/${certificateId}/verify`
                );

                const data = await response.json();

                console.log(
                    "Certificate verification:",
                    data
                );

                if (!response.ok || !data.valid) {

                    resultBox.className =
                        "verify-result invalid";

                    resultBox.innerHTML = `
                        <div class="icon">✕</div>

                        <div class="result-title">
                            CERTIFICATE INVALID
                        </div>

                        <p class="result-sub">
                            This certificate could not be verified.
                        </p>
                    `;

                    return;
                }

                resultBox.className =
                    "verify-result valid";

                resultBox.innerHTML = `
                    <div class="icon">✓</div>

                    <div class="result-title">
                        CERTIFICATE VALID
                    </div>

                    <p class="result-sub">
                        This certificate has been digitally verified.
                    </p>

                    <div class="result-details">

                        <div class="detail-row">
                            <span>Animal ID</span>
                            <span>${data.animalId}</span>
                        </div>

                        <div class="detail-row">
                            <span>Certificate ID</span>
                            <span>${data.certificateId}</span>
                        </div>

                        <div class="detail-row">
                            <span>Status</span>
                            <span>${data.status}</span>
                        </div>

                    </div>

                    <p class="success-banner" style="margin-top:20px;">
                        Collection Permitted
                    </p>
                `;

            } catch (error) {

                console.error(
                    "Certificate verification error:",
                    error
                );

                resultBox.className =
                    "verify-result invalid";

                resultBox.innerHTML = `
                    <div class="icon">✕</div>

                    <div class="result-title">
                        VERIFICATION ERROR
                    </div>

                    <p class="result-sub">
                        Unable to connect to the verification server.
                    </p>
                `;
            }
        });

    }

    // =========================
    // QR SCANNER
    // =========================

    if (scanQrBtn) {

        scanQrBtn.addEventListener("click", () => {

            const scannerContainer =
                document.getElementById("qr-reader");

            if (!scannerContainer) {

                alert("QR scanner area is missing.");
                return;

            }

            scannerContainer.style.display = "block";

            const html5QrCode =
                new Html5Qrcode("qr-reader");

            html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: 250
                },

                (decodedText) => {

                    console.log(
                        "QR scanned:",
                        decodedText
                    );

                    html5QrCode.stop().then(() => {

                        scannerContainer.style.display =
                            "none";

                        // Extract certificate ID
                        // from the verification URL

                        const match =
                            decodedText.match(
                                /\/certificates\/([^/]+)\/verify/
                            );

                        if (match) {

                            document.getElementById(
                                "certId"
                            ).value = match[1];

                            document.getElementById(
                                "verifyCertificateBtn"
                            ).click();

                        } else {

                            alert(
                                "QR code does not contain a valid VetTrace certificate."
                            );

                        }

                    });

                },

                (errorMessage) => {
                    // Normal scanning errors are ignored.
                }

            ).catch((error) => {

                console.error(
                    "QR scanner error:",
                    error
                );

                alert(
                    "Unable to access the camera. Please allow camera permission."
                );

            });

        });

    }

});
