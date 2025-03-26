function correctGrammar() {
    const inputText = document.getElementById('text-input').value.trim();

    if (inputText === "") {
        alert("Please paste some text to correct.");
        return;
    }

    // Simulated correction result (replace with actual API call later)
    const correctedText = inputText.replace(/your/gi, "you're"); // Example logic

    // Hide the Features Section
    const featuresSection = document.querySelector('.features-section');
    featuresSection.innerHTML = `
        <div class="corrected-output-section">
            <h2>Corrected Sentence</h2>
            <p id="corrected-text">${correctedText}</p>
        </div>
    `;
}
