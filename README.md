# ![image](https://github.com/user-attachments/assets/0b383cd2-16dd-4eee-b8ec-b6811cab27b0)
 DataLeaf

**DataLeaf** is a multi-functional, natural language processing powered web application designed to elevate how users interact with documents and text. From summarizing PDFs to analyzing sentiments and correcting grammar, DataLeaf offers a seamless, browser-based interface that makes language understanding more intuitive and efficient.

---

## 🔍 Features

### 📄 PDF Summarizer

* **Upload PDFs**: Supports multi-page and complex documents.
* **LLM-Based Summarization**: Generates concise summaries using OpenAI APIs.
* **Follow-Up Interaction**: Ask follow-up questions directly based on the uploaded content.

### ✍️ Grammar Auto Corrector

* **Paste and Correct**: Real-time grammar correction using transformer-based models.
* **Ideal For**: Students, bloggers, professionals.

### 😊 Sentiment Analyzer

* **Supports Paragraphs & CSVs**: Analyze free-form text or review datasets (e.g., Amazon reviews).
* **ML-Based Inference**: Classifies content as **positive**, **neutral**, or **negative** using `TextBlob`, `sklearn`, and `nltk`.

---

## 📁 Project Structure

```
DataLeaf/
├── DOCUMENTS/                # User-uploaded PDFs
├── OUTPUT/                   # Generated summaries and results
├── PDF Summarizer/           # Notebook for testing LLM-based summarization
├── Webpage/                  # Frontend (HTML, CSS, JS)
│   ├── index.html            # Home page
│   ├── grammar.html          # Grammar correction UI
│   ├── sentiment.html        # Sentiment analysis UI
├── static/                   # Assets (CSS/JS)
├── templates/                # HTML templates (if Flask templating is used)
├── Integrated/app.py         # Flask backend - launch point
├── .gitignore
└── README.md
```

---

## 🚀 How to Run

1. 🔧 Make sure dependencies are installed:

   ```bash
   pip install -r requirements.txt
   ```

2. ▶️ Start the app:

   ```bash
   python app.py
   ```

3. 🌐 Open your browser and go to:

   ```
   http://127.0.0.1:5000
   ```

From there, navigate between:

* **PDF Summarizer**
* **Grammar Corrector**
* **Sentiment Analyzer**

---

## 🌐 Web Interface

Each module has a dedicated interface inside the `Webpage/` folder:

* `index.html`: Landing page
* `grammar.html`: Text area for grammar input
* `sentiment.html`: Sentiment input box / CSV upload
* `pdf.html`: Page for uploading the PDF for summarization and Q&A

*All features are integrated with Flask through `app.py`.*

---

## 🧠 Tech Stack

| Layer        | Technology                               |
| ------------ | ---------------------------------------- |
| Frontend     | HTML, CSS, JavaScript                    |
| Backend      | Python, Flask                            |
| NLP Models   | OpenAI API, Scikit-learn, TextBlob, NLTK |
| PDF Handling | PyMuPDF (`fitz`), `unstructured`         |

---

## 📌 To-Do / Enhancements

* [ ] Real-time grammar correction on frontend
* [ ] Add file download option for generated summaries
* [ ] Implement login and user history (optional future scope)

---
## 📸 Output Results Showcase

###Landing Page
![image](https://github.com/user-attachments/assets/0b859c9d-8b35-4e81-b7cb-67c3ac6dcb66)


### 📄 PDF Summary

* Input: `Document.pdf`
* Output Summary (saved in `OUTPUT/summary.txt`):

  ```
  This document discusses the advancements in transformer-based summarization...
  ```


![image](https://github.com/user-attachments/assets/05f569be-1735-4534-a45b-1330dd8d09c3)


### ✍️ Grammar Auto Corrector

* Input: `"This are a sample sentence"`
* Output: `"This is a sample sentence."`


![image](https://github.com/user-attachments/assets/83e5c5ea-0582-494a-beb4-452923e084c5)


### 😊 Sentiment Analyzer

* CSV Input: `amazon_reviews.csv`
* Sample Output:

  ```
  Positive: 67%
  Neutral: 21%
  Negative: 12%
  ```


![image](https://github.com/user-attachments/assets/424ad698-3d4e-49aa-9e43-f980233e2fcb)

### 🔐 SignUp and Login Page

```
  This section of our Page utilizes MongoDB atlas with hashed passwords and Google AuthO v2.0 for secure Login and SignUp featues

The sign-up interface facilitates new user registration with fields for name, email, and password. Validation checks ensure strong password practices, while integration with Google Sign-In enhances convenience and security for users preferring third-party authentication.

The login page provides returning users access to the platform. It supports authentication through email-password credentials or via Google accounts. The layout is designed for simplicity, ensuring smooth access while maintaining secure session handling.
```

![image](https://github.com/user-attachments/assets/ca64d1ba-41df-4af7-b939-3315bca5bbbe)
![image](https://github.com/user-attachments/assets/9f97a900-c252-46b4-a1d7-4822e4cce0ee)


---

## 🧑‍💻 Authors

* **Ritvik Gupta**

  * 📬 [GitHub](https://github.com/Ritvik172Gupta)
  * 💡 Data Analysis, Web Development, Clean UX

* **Milind Vishwakarma**

  * 📬 [GitHub](https://github.com/milind-vi)
  * 💡 AI/ML, MERN Development

* **Debanjana Pal**

  * 📬 [GitHub](https://github.com/milind-vi)
  * 💡 Backend, Automation

---

##🙏 Special Thanks
We extend our heartfelt gratitude to Dr. Sahinur Rahman Laskar, Assistant Professor, University of Petroleum and Energy Studies (UPES), for his unwavering guidance, insightful feedback, and continuous encouragement throughout the development of DataLeaf. His deep expertise in natural language technologies and dedication to academic excellence were instrumental in refining our vision and technical approach.

🔗 Connect on LinkedIn -- https://www.linkedin.com/in/dr-sahinur-rahman-laskar-0683ab1b0/

---
