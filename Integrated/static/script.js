let loggedIn = false;
let userName = "";

// Function to update the navbar based on login status
function updateNavbar() {
    if (localStorage.getItem('dataleafLoggedIn') === 'true') {
        document.querySelector(".auth-buttons").style.display = 'none';
        document.querySelector(".namess").style.display = 'block';
        document.querySelector(".namess").innerHTML = `
            <span style="margin-right: 10px;font-size:large">👋 Welcome, <b>${localStorage.getItem('dataleafUserName')}</b></span>
            <button class="logOut" onclick="logout()">Logout</button>
        `;
    } else {
        document.querySelector(".auth-buttons").style.display = 'block';
        document.querySelector(".namess").style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Update the navbar when the page loads
    updateNavbar();

    // Check if the user is logged in on other pages
    if (localStorage.getItem('dataleafLoggedIn') === 'true') {
        loggedIn = true;
        userName = localStorage.getItem('dataleafUserName');
    }
});

// Centralized function to check login state
function checkLoginStatus() {
    if (localStorage.getItem('dataleafLoggedIn') === 'true') {
        loggedIn = true;
    }
    if (!loggedIn) {
        alert("Please Log In first to use this feature.");
        window.location.href = '/login';
        return false;
    }
    return true;
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const user = { email, password };

    fetch('/check_user_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response from Flask:", data.message);
        alert(data.message);
        userName = data.name;
        if (data.name) {
            loggedIn = true;
            userName = data.name;
            localStorage.setItem('dataleafLoggedIn', 'true');
            localStorage.setItem('dataleafUserName', data.name);
            updateNavbar(); // Update navbar after login
            window.location.href = "/";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert('An Error occurred.');
    });
}

function updateFileChosen() {
    const fileInput = document.getElementById('file-upload');
    const fileChosen = document.getElementById('fileChosen');
    
    if (fileInput.files.length === 0) {
        fileChosen.textContent = 'No file chosen';
    } else {
        fileChosen.textContent = fileInput.files[0].name;
    }
}

// Add event listener to file input
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
        fileInput.addEventListener('change', updateFileChosen);
    }});

// Generic drag and drop setup function
function setupDragAndDrop(uploadBoxId, fileInputId, fileChosenId, allowedTypes) {
    const uploadBox = document.getElementById(uploadBoxId);
    const fileInput = document.getElementById(fileInputId);
    const fileChosen = document.getElementById(fileChosenId);
    
    if (!uploadBox || !fileInput) return;
    
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
        if (files.length === 0) return;
        
        const file = files[0];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        // Check if file type is allowed
        if (allowedTypes.includes(fileExtension)) {
            // Create a new DataTransfer object
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            if (fileChosen) {
                fileChosen.textContent = file.name;
            }
        } else {
            alert(`Only ${allowedTypes.join(', ')} files are allowed.`);
        }
    });
}

// Initialize drag-drop areas when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check for CSV upload box (Sentiment Analysis)
    const csvUploadBox = document.getElementById('csv-upload-box');
    const csvFileInput = document.getElementById('file-upload');
    if (csvUploadBox && csvFileInput) {
        setupDragAndDrop(csvUploadBox.id, 'file-upload', 'fileChosen', ['csv']);
    }
    
    // Prevent default drag behavior on the entire window
    window.addEventListener('dragover', e => e.preventDefault());
    window.addEventListener('drop', e => e.preventDefault());
});

document.addEventListener('DOMContentLoaded', function() {
    // Check for PDF upload box (PDF Summarizer)
    const pdfUploadBox = document.getElementById('upload-box');
    if (pdfUploadBox) {
        setupDragAndDrop('upload-box', 'file-upload', 'fileChosen', ['pdf']);
    }
    
    // Prevent default drag behavior on the entire window
    window.addEventListener('dragover', e => e.preventDefault());
    window.addEventListener('drop', e => e.preventDefault());
});

    function analysePdf() {

        if (!checkLoginStatus()) {return;}

        const fileInput = document.getElementById('file-upload');
        const whySection = document.querySelector('.why-section');
        
        if (fileInput.files.length === 0) {
            alert("Please upload a PDF file before summarizing.");
            return;
        }

        // Display loading message
        whySection.innerHTML = `
            <div class="loading">
                <h2>Analyzing your PDF...</h2>
                <p>This may take a moment.</p>
            </div>
        `;

        const formData = new FormData();
        formData.append("pdfFile", fileInput.files[0]);

        fetch('/pdf', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not OK");
            }
            return response.json();
        })
        .then(data => {
            console.log("Response from Flask (pdf):", data);
            
            whySection.innerHTML = `
                <div class="summary-result">
                    <h2>Summary</h2>
                    <p id="summary-text">
                        ${data.summary}
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
            if (askBtn) {
                askBtn.addEventListener('click', askQuestion);
            }
        })
        .catch(error => {
            whySection.innerHTML = `
                <div class="error-result">
                    <h2>❌ Error Processing File</h2>
                    <p>${error.message}</p>
                </div>
            `;
            console.error("Error processing file", error);
        });
    }

    function askQuestion() {
        const question = document.getElementById('user-question').value;
        const answerOutput = document.getElementById('answer-output');
        
        if (question.trim() === '') {
            answerOutput.textContent = "❗ Please enter a question.";
            return;
        }

        answerOutput.textContent = "Loading answer...";

        fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: question,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not OK");
            }
            return response.json();
        })
        .then(data => {
            console.log("Response from Flask (ask):", data);
            
            if (data.response) {
                answerOutput.textContent = data.response;
            } 
            // else if (data.answer) {
            //     answerOutput.textContent = data.answer;
            // } 
            else {
                answerOutput.textContent = "No answer was provided.";
            }
        })
        .catch(error => {
            answerOutput.textContent = "Error: " + error.message;
            console.error("Error processing question", error);
        });
    }

function convertToCSV(data) {
    const csvRows = [];

    // Extract headers
    const headers = Object.keys(data.results[0]);
    csvRows.push(headers.join(',')); // Add the headers to the CSV

    for (const row of data.results) {
        const values = headers.map(header => JSON.stringify(row[header], replacer = null));
        csvRows.push(values.join(','));
    }

    // Combine into a single CSV string
    const csvString = csvRows.join('\n');
    return csvString;
}

//Sentiment Analysis specific:
function sentiment_analyse() {
    const textInput = document.getElementById("text-input").value.trim();
    const fileInput = document.getElementById("file-upload").files;
    const featuresSection = document.querySelector(".features-section");

    // Check if input is provided
    if (textInput === "" && (!fileInput || fileInput.length === 0)) {
        alert("Please enter text or upload a CSV file to analyze.");
        return;
    }

    // If CSV file uploaded
    if (fileInput && fileInput.length > 0){
        if (!checkLoginStatus()) {return;}

     if (fileInput[0].name.endsWith(".csv")) {
        const formData = new FormData();
        formData.append("csvFile", fileInput[0]);
        
        // Display loading message
        featuresSection.innerHTML = `
            <div class="loading">
                <h2>Analyzing your CSV file...</h2>
                <p>This may take a moment.</p>
            </div>
        `;
        
        // Send the file to Flask
        fetch('/csv', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not OK");
            }
            return response.json();
        })
        .then(data => {
            console.log("Response from Flask (csv):", data);
            const csvString = convertToCSV(data);
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            
            featuresSection.innerHTML = `
                <div class="csv-result">
                    <h2>✅ CSV Analyzed Successfully!</h2>
                    <p>Your file has been processed for sentiment analysis.</p>
                    <a href="${url}" download="sentiment_analysis_results.csv" class="download-btn">Download Results</a>
                </div>
            `;
        })
        .catch(error => {
            featuresSection.innerHTML = `
                <div class="error-result">
                    <h2>❌ Error Processing File</h2>
                    <p>${error.message}</p>
                </div>
            `;
            console.error("Error processing file", error);
        });
     } else{
        alert("Please upload a file of CSV type only to analyze.");
        return;
     }
    }
    // Process text input
    else
    {
        // Display loading message
        featuresSection.innerHTML = `
            <div class="loading">
                <h2>Analyzing your text...</h2>
                <p>This may take a moment.</p>
            </div>
        `;
        
        fetch('/text', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: textInput,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not OK");
            }
            return response.json();
        })
        .then(data => {
            console.log("Response from Flask(text):", data);
            
            // Get emoji based on sentiment
            let emoji = "😐";
            if (data.sentiment === "positive") emoji = "😊";
            if (data.sentiment === "negative") emoji = "😞";
            
            featuresSection.innerHTML = `
                <div class="text-result">
                    <h2>Sentiment Result</h2>
                    <p><strong>Detected Sentiment:</strong> ${emoji} ${data.sentiment.charAt(0).toUpperCase() + data.sentiment.slice(1)}</p>
                    <p><strong>Confidence:</strong> ${(data.confidence * 100).toFixed(2)}%</p>
                </div>
            `;
        })
        .catch(error => {
            featuresSection.innerHTML = `
                <div class="error-result">
                    <h2>❌ Error Processing Text</h2>
                    <p>${error.message}</p>
                </div>
            `;
            console.error("Error processing text", error);
        });
    }
}

function correctGrammar() {
    const inputText = document.getElementById('text-input').value.trim();

    if (inputText === "") {
        alert("Please paste some text to correct.");
        return;
    }
    const featuresSection = document.querySelector('.features-section');

    // Display loading message
    featuresSection.innerHTML = `
    <div class="loading">
        <h2>Checking your text...</h2>
        <p>This may take a moment.</p>
    </div>
    `;

    fetch('/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: inputText,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not OK");
        }
        return response.json();
    })
    .then(data => {
        console.log("Response from Flask(text):", data);
        
        featuresSection.innerHTML = `
        <div class="corrected-output-section">
            <h2>Corrected Sentence</h2>
            <p id="corrected-text">${data.result}</p>
        </div>
    `;
    })
    .catch(error => {
        featuresSection.innerHTML = `
            <div class="error-result">
                <h2>❌ Error Processing Text</h2>
                <p>${error.message}</p>
            </div>
        `;
        console.error("Error processing text", error);
    });
}

// script.js for sign up
document.addEventListener('DOMContentLoaded', () => {
    const form2 = document.getElementById('signup-form');
    const firstName = document.getElementById('first-name');
    const lastName = document.getElementById('last-name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');

    const showError = (id, message) => {
        document.getElementById(id).textContent = message;
    };

    const clearErrors = () => {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.textContent = '');
    };

    // Toggle Password Visibility
    const togglePasswordBtn = document.querySelector('.toggle-password');
    togglePasswordBtn.addEventListener('click', () => {
        const type = password.type === 'password' ? 'text' : 'password';
        password.type = type;
        togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });

    form2.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        let valid = true;

        if (firstName.value.trim() === '') {
            showError('first-name-error', 'First name is required.');
            valid = false;
        }

        if (lastName.value.trim() === '') {
            showError('last-name-error', 'Last name is required.');
            valid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value)) {
            showError('email-error', 'Please enter a valid email.');
            valid = false;
        }

        if (password.value.length < 6) {
            showError('password-error', 'Password must be at least 6 characters.');
            valid = false;
        }

        if (password.value !== confirmPassword.value) {
            showError('confirm-password-error', 'Passwords do not match.');
            valid = false;
        }

        if (valid) {
                const userData = {
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: email.value,
                    password: password.value
                };
            
                fetch('/send_user_data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                })
                .then(response => response.json())
                .then(data => {
                    console.log("Response from Flask:", data.message);
                    alert(data.message);
                    if (data.name)
                    window.location.href = "/login"
                })
                .catch(error => {
                    console.error("Error:");
                    alert('An Error occured.');
                });
        }
    });
});

//script.js for login
function login(){
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const user = {
        email: email,
        password: password
    };

    fetch('/check_user_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response from Flask:", data.message);
        alert(data.message);
        userName=data.name;
        console.log('data.name',data.name);
        if (data.name){
            loggedIn=true;
            userName=data.name;
            console.log('loggedIn',loggedIn);
            localStorage.setItem('dataleafLoggedIn', 'true');
            localStorage.setItem('dataleafUserName', data.name);
            document.querySelector(".auth-buttons").innerHTML = `
            <span style="margin-right: 10px;">👋 Welcome, <b>${data.name}</b></span>
                    <button onclick="logout()">Logout</button>
                `;
            window.location.href = "/";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert('An Error occured.');
    });
}

//script.js for logout
function logout() {
    loggedIn = false;
    userName = "";
    localStorage.removeItem('dataleafLoggedIn');
    localStorage.removeItem('dataleafUserName');
    alert("You have been logged out.");
    // Swal.fire({
    //     icon: 'success',
    //     title: 'Logged Out Successfully!',
    //     timer: 1500,
    //     showConfirmButton: false,
    //     background: '#f1f3e8',
    //     color: '#333',
    //     backdrop: `rgba(126,154,141,0.4)`
    //   })
    
    localStorage.removeItem('dataleafLoggedIn');
    localStorage.removeItem('dataleafUserName');

    window.location.href = "/";
}

function handleCredentialResponse(response) {
    const jwt = response.credential;
    const userData = parseJwt(jwt);
    console.log("User Data:", userData);

    // Update global login state
    loggedIn = true;
    userName = userData.name;
    
    alert(`Welcome, ${userData.name}!`);
    
    // Store login state in localStorage for persistence
    localStorage.setItem('dataleafLoggedIn', 'true');
    localStorage.setItem('dataleafUserName', userData.name);
    window.location.href = "/";
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = decodeURIComponent(atob(base64Url).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(base64);
}

// Add form submit handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Google Sign-in if the button exists
    const googleSignInBtn = document.getElementById("google-signin-btn");
    if (googleSignInBtn) {
        google.accounts.id.initialize({
            client_id: '990574923767-1jjb6m44co1u970qmn8j0t96n71jb9r7.apps.googleusercontent.com',
            callback: handleCredentialResponse
        });

        google.accounts.id.renderButton(
            googleSignInBtn,
            { theme: "outline", size: "large" }
        );
    }
    
    // Check if user is already logged in from localStorage
    if (localStorage.getItem('dataleafLoggedIn') === 'true') {
        loggedIn = true;
        userName = localStorage.getItem('dataleafUserName');
        console.log("User already logged in:", userName, "Sign Out first to log in with another account.");
    }

    const form = document.getElementById('upload-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            sentiment_analyse();
        });
    }
});