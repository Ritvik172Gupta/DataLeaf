document.getElementById("upload-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const textInput = document.getElementById("text-input").value.trim();
    const fileInput = document.getElementById("file-upload").files;

    if (textInput === "" && fileInput.length === 0) {
        alert("Please enter text or upload a CSV file to analyze.");
        return;
    }

    const featuresSection = document.querySelector(".features-section");

    // If CSV file uploaded
    if (fileInput.length > 0 && fileInput[0].name.endsWith(".csv")) {
        featuresSection.innerHTML = `
            <div class="csv-result">
                <h2>✅ CSV Analyzed Successfully!</h2>
                <p>Your file has been processed for sentiment analysis.</p>
                <a href="#" class="download-btn">Download Results</a>
            </div>
        `;
    } else {
        // Simulate sentiment result for text input
        const sentiment = getMockSentiment(textInput); // Simulate

        featuresSection.innerHTML = `
            <div class="text-result">
                <h2>Sentiment Result</h2>
                <p><strong>Detected Sentiment:</strong> ${sentiment}</p>
            </div>
        `;
    }
});

// Simulated sentiment analyzer
function getMockSentiment(text) {
    const lower = text.toLowerCase();
    if (lower.includes("good") || lower.includes("great") || lower.includes("love")) return "😊 Positive";
    if (lower.includes("bad") || lower.includes("hate") || lower.includes("worst")) return "😞 Negative";
    return "😐 Neutral";
}
