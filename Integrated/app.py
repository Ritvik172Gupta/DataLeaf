from flask import Flask, request, render_template, jsonify
import pandas as pd
import torch
import numpy as np
from transformers import BertTokenizer, BertForSequenceClassification, pipeline, T5Tokenizer, T5ForConditionalGeneration
from torch.utils.data import DataLoader, Dataset
import io
from flask_cors import CORS
from bson.json_util import dumps
import os
from bcrypt import hashpw, gensalt, checkpw


app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY")  # Correct secure loading from .env


CORS(app,
     supports_credentials=True,
     resources={r"/*": {"origins": ["http://127.0.0.1:5000", "http://localhost:5000"]}})


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/Sentiment-Analysis")
def SentimentA():
    return render_template("SentimentA.html")

@app.route("/PDF-Summarizer")
def PDFS():
    return render_template("Pdfs.html") 

@app.route("/Grammar-Corrector")
def GrammarC():
    return render_template("GrammarC.html")  

@app.route("/login")
def LogIn():
    return render_template("LogIn.html")  

@app.route("/signup")
def SignUp():
    return render_template("SignUp.html")

# Load model and tokenizer
model_path = "./TRAINEDBERT/TRAINEDBERT"
try:
    tokenizer = BertTokenizer.from_pretrained(model_path)
    model = BertForSequenceClassification.from_pretrained(model_path)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    # Create a sentiment analysis pipeline using fine-tuned model
    sentiment_pipeline = pipeline(
        "sentiment-analysis", 
        model=model, 
        tokenizer=tokenizer, 
        device=0 if torch.cuda.is_available() else -1
    )
    
    print(f"Model loaded successfully. Using device: {device}")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    sentiment_pipeline = None

def get_sentiment(text):
    """Analyze sentiment using the fine-tuned BERT model with proper truncation."""
    
    # Ensure input is a string and handle NaN values
    if not isinstance(text, str):
        text = str(text)  # Convert any non-string input to string
    
    # Check if text is empty
    if not text or text.isspace():
        return "no text present", 1.0
    
    # Truncate to 512 characters (if text is too long)
    truncated_text = text[:512]
    
    # Use fallback if model fails
    if sentiment_pipeline is None:
        return "Error loading model", 1.0

    try:
        # Run through model pipeline
        result = sentiment_pipeline(truncated_text)[0]
        
        label_map = {"LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive"}
        sentiment = label_map.get(result['label'], "unknown")
        confidence = result['score']
        
        return sentiment, confidence
    except Exception as e:
        print(f"Error in sentiment analysis: {str(e)}")
        return "Error in sentiment analysis", 1.0

@app.route("/csv", methods=["POST"])
def analyze_csv():
    try:
        if 'csvFile' not in request.files:
            return jsonify({"error": "No csv file passed"}), 400
            
        file = request.files['csvFile']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Read CSV file
        try:
            df = pd.read_csv(file)
        except Exception as e:
            return jsonify({"error": f"Error reading CSV: {str(e)}"}), 400
        
        # Identify potential text columns (excluding numeric ones)
        text_columns = [col for col in df.columns if df[col].dtype == 'O']  # 'O' means object (string)
        
        if len(text_columns) == 0:
            return jsonify({"error": "No text columns found in the CSV"}), 400
        
        # Combine text columns
        df["combined_text"] = df[text_columns].astype(str).agg(" ".join, axis=1)
        
        results = []
        total_rows = len(df)
        
        for index, row in df.iterrows():
            if index % 10 == 0:  # Log progress every 10 rows
                print(f"Processing row {index}/{total_rows}")
                
            text = row["combined_text"]
            sentiment, confidence = get_sentiment(text)
            
            # Create result row with original columns plus sentiment analysis
            result_row = row.to_dict()
            result_row["Predicted_Sentiment"] = sentiment
            result_row["Confidence"] = confidence
            
            results.append(result_row)
            print("result_row", result_row)
        
        print("CSV processing completed successfully")
        return jsonify({"results": results, "message": "CSV processed successfully!"})
        
    except Exception as e:
        print(f"Error in CSV analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/text", methods=["POST"])
def analyze_text():
    try:
        # Get text data from request body
        text = request.data.decode('utf-8')
        print(f"Received text: {text[:100]}...")  # Log first 100 chars
        
        sentiment, confidence = get_sentiment(text)
        print(f"Analysis result: {sentiment} confidence: {confidence}")
        
        return jsonify({"sentiment": sentiment, "confidence": confidence})
    except Exception as e:
        print(f"Error in text analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Load model and tokenizer
grammar_model_path = "./t5/t5_c4_grammar_corrector"
tokenizerGrammar = T5Tokenizer.from_pretrained(grammar_model_path)
modelGrammar = T5ForConditionalGeneration.from_pretrained(grammar_model_path)

def correct_grammar(text):
    input_text = "grammar: " + text
    input_ids = tokenizerGrammar.encode(input_text, return_tensors="pt", truncation=True, max_length=512).to(device)
    outputs = modelGrammar.generate(input_ids, max_length=128, num_beams=4, early_stopping=True)
    corrected = tokenizerGrammar.decode(outputs[0], skip_special_tokens=True)
    return corrected

@app.route("/grammar", methods=["POST"])
def analyze_grammar():
    try:
        # Get text data from request body
        text = request.data.decode('utf-8')
        print(f"Received text: {text[:100]}...")  # Log first 100 chars

        # Word limit check
        word_count = len(text.strip().split())
        if word_count > 256:
            return jsonify({"result": "❌ Input exceeds 256-word limit. Please try again with shorter text."})
        corrected_text = correct_grammar(text)
        return jsonify({"result": corrected_text})
    except Exception as e:
        print(f"Error in text analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500


from dotenv import load_dotenv
import os
import base64
from IPython.display import Image, display
from io import StringIO 
from lxml import etree
from IPython.core.display import HTML
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
import uuid
from langchain_chroma import Chroma
from langchain.storage import InMemoryStore
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain.retrievers.multi_vector import MultiVectorRetriever
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from base64 import b64decode
import base64
#from IPython.display import Image, display #for printing img
#from base64 import display_base64_image
import nltk
from unstructured.partition.pdf import partition_pdf
from transformers import BertTokenizer, BertForSequenceClassification, pipeline
#from torch.utils.data import DataLoader, Dataset
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from tqdm import tqdm

import subprocess


load_dotenv()  # Load variables from .env
# Access environment variables
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")

# nltk.download('punkt')
# nltk.download('averaged_perceptron_tagger')
# nltk.download('stopwords')
# nltk.download('wordnet')

def get_images_base64(chunks):
    images_b64 = []
    for chunk in chunks:
        if "CompositeElement" in str(type(chunk)):
            chunk_els = chunk.metadata.orig_elements
            for el in chunk_els:
                if "Image" in str(type(el)):
                    images_b64.append(el.metadata.image_base64)
    return images_b64

def table_extraction(chunks) :
    tables = [el for el in chunks if el.category == "Table"]
    for i in range(len(tables)):
        table_html = tables[i].metadata.text_as_html

    parser = etree.XMLParser(remove_blank_text=True)
    file_obj = StringIO(table_html)
    tree = etree.parse(file_obj, parser)


vectorstore = Chroma(collection_name="multi_modal_rag", embedding_function=OpenAIEmbeddings())
            # The storage layer for the parent documents
store = InMemoryStore()
id_key = "doc_id"
retriever=MultiVectorRetriever(
            vectorstore=vectorstore,
            docstore=store,
            id_key=id_key,
            )

@app.route("/pdf", methods=["POST"])
def analyze_pdf():
    try:
        file = request.files['pdfFile']
        #return jsonify({"summary": "summary"})
        #print("file")
        path=f"./uploads/{file.filename}"
        file.save(path)
        print(path)

        

        # try:
        #     result = subprocess.run(['pdftoppm', '-v'], capture_output=True, text=True)
        #     print("Poppler version:", result.stderr.strip())
        # except FileNotFoundError:
        #     print("Poppler not found in PATH")

# Print current PATH to check
        # print("Current PATH:", os.environ.get('PATH'))

        try:
            chunks = partition_pdf(
    filename=path,
    strategy="hi_res",                     # mandatory to infer tables
    infer_table_structure=True,            # extract tables
    hi_res_model_name="yolox",                   

    extract_image_block_types=["Image"],   # Add 'Table' to list to extract image of tables

    extract_image_block_to_payload=True,   # if true, will extract base64 for API usage

    chunking_strategy="by_title",          # or 'basic'
    max_characters=3000,                  # defaults to 500
    combine_text_under_n_chars=200,       # defaults to 0
    new_after_n_chars=3800
            )

            if not chunks:
                return jsonify({"summary": "Can't read the text or pdf is empty!"})
                
            #return jsonify({"summary": "chunks"})
            
            tables = []
            texts = []

            for chunk in chunks:
                if "Table" in str(type(chunk)):
                    tables.append(chunk)

                if "CompositeElement" in str(type((chunk))):
                    texts.append(chunk)
            
            images = get_images_base64(chunks)

            if tables :
                table_extraction(chunks)

            #return jsonify({"summary": "pre-processed!"})

            image_summaries=[]
            if images:
                prompt_template = """Describe the image in detail. Be specific and accurate."""
                messages = [
                (
                    "user",
                    [
                        {"type": "text", "text": prompt_template},
                        {
                            "type": "image_url",
                            "image_url": {"url": "data:image/jpeg;base64,{image}"},
                        },
                    ],
                )
                ]
                prompt = ChatPromptTemplate.from_messages(messages)
                chain = prompt | ChatOpenAI(model="gpt-4o") | StrOutputParser()
                image_summaries = chain.batch(images)
                
            text_summaries=[]
            if texts:
                prompt_template2 = """You are an assistant tasked with summarizing text.
        Give a concise summary of the text.

        Respond only with the summary, no additionnal comment.
        Do not start your message by saying "Here is a summary" or anything like that.
        Just give the summary as it is. Also note that the summary should not be very long.\n\n{text}"""


                prompt2 = ChatPromptTemplate.from_template(prompt_template2)

        
                chain = prompt2 | ChatOpenAI(model="gpt-4o") | StrOutputParser()
        
                text_summaries = chain.batch(texts)
                
            table_summaries = []
            if tables:
                prompt_template3 = """You are an assistant tasked with summarizing tables.
    Give a concise summary of the tables.

    Respond only with the summary, no additionnal comment.
    Do not start your message by saying "Here is a summary" or anything like that.
    Just give the summary as it is.\n\n{element}"""


                prompt3 = ChatPromptTemplate.from_template(prompt_template3)


                chain = prompt3 | ChatOpenAI(model="gpt-4o") | StrOutputParser()

                tables_html = [table.metadata.text_as_html for table in tables]
                table_summaries = chain.batch(tables_html)

            # Add texts
            if texts:
                doc_ids = [str(uuid.uuid4()) for _ in texts]
                summary_texts = [
                Document(page_content=summary, metadata={id_key: doc_ids[i]}) for i, summary in enumerate(text_summaries)
                ]
                retriever.vectorstore.add_documents(summary_texts)
                retriever.docstore.mset(list(zip(doc_ids, texts)))

            # Add tables
            if tables:
                table_ids = [str(uuid.uuid4()) for _ in tables]
                summary_tables = [
                Document(page_content=summary, metadata={id_key: table_ids[i]}) for i, summary in enumerate(table_summaries)
                ]   
                retriever.vectorstore.add_documents(summary_tables)
                retriever.docstore.mset(list(zip(table_ids, tables)))

            # Add image summaries
            if images:
                img_ids = [str(uuid.uuid4()) for _ in images]
                summary_img = [
                Document(page_content=summary, metadata={id_key: img_ids[i]}) for i, summary in enumerate(image_summaries)
                ]
                retriever.vectorstore.add_documents(summary_img)
                retriever.docstore.mset(list(zip(img_ids, images)))

            summary=""
            for i in text_summaries:
                summary+=i
            for i in table_summaries:
                summary+=i
            for i in image_summaries:
                summary+=i
            
            print("summary", summary)
            return jsonify({"summary": summary})

        except Exception as e:
            print(f"Error in pdf analysis: {str(e)}")
            return jsonify({"error processing file": str(e)}), 500
    except Exception as e:
        print(f"Error in pdf read: {str(e)}")
        return jsonify({"error reading file": str(e)}), 400


def parse_docs(docs):
    """Split base64-encoded images and texts"""
    b64 = []
    text = []
    for doc in docs:
        try:
            b64decode(doc)
            b64.append(doc)
        except Exception as e:
            text.append(doc)
    return {"images": b64, "texts": text}

def build_prompt(kwargs):

    docs_by_type = kwargs["context"]
    user_question = kwargs["question"]

    context_text = ""
    if len(docs_by_type["texts"]) > 0:
        for text_element in docs_by_type["texts"]:
            context_text += text_element.text

    # construct prompt with context (including images)
    prompt_template = f"""
    Answer the question based only on the following context, which can include text, tables, and the below image.
    Context: {context_text}
    Question: {user_question}
    """

    prompt_content = [{"type": "text", "text": prompt_template}]

    if len(docs_by_type["images"]) > 0:
        for image in docs_by_type["images"]:
            prompt_content.append(
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image}"},
                }
            )

    return ChatPromptTemplate.from_messages(
        [
            HumanMessage(content=prompt_content),
        ]
    )



@app.route("/ask", methods=["POST"])
def question():

    try:
        # Get text data from request body
        text = request.data.decode('utf-8')
        print(f"Received text: {text[:100]}...")  # Log first 100 chars
    except Exception as e:
        print(f"Error in text recieving: {str(e)}")
        return jsonify({"error": str(e)}), 400
    
    chain = (
    {
        "context": retriever | RunnableLambda(parse_docs),
        "question": RunnablePassthrough(),
    }
    | RunnableLambda(build_prompt)
    | ChatOpenAI(model="gpt-4o-mini")
    | StrOutputParser()
    )

    chain_with_sources = {
    "context": retriever | RunnableLambda(parse_docs),
    "question": RunnablePassthrough(),
    } | RunnablePassthrough().assign(
    response=(
        RunnableLambda(build_prompt)
        | ChatOpenAI(model="gpt-4o-mini")
        | StrOutputParser()
    )
    )

    response = chain_with_sources.invoke(text)

    print("response", response['response'])
    return jsonify({"response": response['response']})


import pymongo
from bcrypt import hashpw, gensalt, checkpw


os.environ["CONNECTION_STRING"] = os.getenv("CONNECTION_STRING")

# Establish connection
client = pymongo.MongoClient(os.getenv("CONNECTION_STRING"),tls=True, tlsAllowInvalidCertificates=True,tlsAllowInvalidHostnames=True)
db = client['UserData']  # Specify your database
collection = db['User']

@app.route("/send_user_data", methods=["POST"])
def store_dets():
    data = request.json

    # Extract fields from the incoming JSON data
    firstName = data.get('firstName')
    lastName = data.get('lastName')
    email = data.get('email')
    password = data.get('password') 

    if not (firstName and lastName and email and password):
        return jsonify({'message': 'Missing fields in the request.'}), 400
    
    if collection.find_one({"email": email}):
        return jsonify({'message': 'Account for this email already exists, please Login.'})
    
    hashed_password = hashpw(password.encode('utf-8'), gensalt())
    userData = {
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "password": hashed_password
    }
    collection.insert_one(userData)
    print("Data saved into mongodb Atlas")

    return jsonify({'message': f'Successfully Signed Up! {firstName}. Please Login', 'name': firstName})

@app.route("/check_user_data", methods=["POST"])
def retrieve_dets():
    data = request.json

    # Extract fields from the incoming JSON data
    email = data.get('email')
    password = data.get('password')



    if not (email and password):
        return jsonify({'message': 'Missing fields in the request.'}), 400
    
    stored_data=collection.find_one({"email": email})
    if stored_data:
        password_bytes=stored_data['password']
        is_password_correct = checkpw(password.encode('utf-8'), password_bytes)
        #print(f"Password match: {is_password_correct}")
        if is_password_correct:
            return jsonify({'message': 'Successfully Loged In %s.'%(stored_data['firstName']),'name':stored_data['firstName']})
        return jsonify({'message': 'Password entered is incorrect!'}), 401
    return jsonify({'message': f'No account for the email entered exists. Please SignUp.'}), 404

if __name__ == "__main__":
    app.run(debug=True)
