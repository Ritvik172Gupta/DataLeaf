    const fileInput = document.getElementById('file-upload');
    const fileChosen = document.getElementById('file-chosen');
    const uploadBox = document.getElementById('upload-box');
    const form = document.getElementById('upload-form');

    // Update filename on choosing file
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileChosen.textContent = fileInput.files[0].name;
        } else {
            fileChosen.textContent = 'No file chosen';
        }
    });

    // Drag and Drop Events
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            fileChosen.textContent = files[0].name;
        }
    });

    // Optional: Prevent default behavior on window dragover/drop
    window.addEventListener('dragover', e => e.preventDefault());
    window.addEventListener('drop', e => e.preventDefault());

    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent form from submitting by default
    
        if (fileInput.files.length === 0) {
            alert("Please upload a PDF file before summarizing.");
            return;
        }
    
        // Simulate processing and inject summary section
        const whySection = document.querySelector('.why-section');
        whySection.innerHTML = `
            <div class="summary-result">
                <h2>Summary</h2>
                <p id="summary-text">
                    ✅ Your summary will appear here after processing the PDF...
                </p>
            </div>
            <div class="question-answer">
                <h3>Have a question about the PDF?</h3>
                <input type="text" id="user-question" placeholder="Ask a question..." />
                <button id="ask-button">Ask</button>
                <p id="answer-output"></p>
            </div>
        `;
    
        // Add event listener for the Ask button
        const askBtn = document.getElementById('ask-button');
        const answerOutput = document.getElementById('answer-output');
    
        askBtn.addEventListener('click', () => {
            const question = document.getElementById('user-question').value;
            if (question.trim() === '') {
                answerOutput.textContent = "❗ Please enter a question.";
                return;
            }
    
            // Simulated answer for now
            answerOutput.textContent = "🤖 This is a sample answer based on your uploaded PDF.";
        });
    });
    
