AI Resume Analyzer 🔬

An AI-powered resume analysis tool that compares a candidate's resume against a job description and returns a match score, strengths, missing skills/keywords, and actionable improvement suggestions — powered by Google Gemini and a RAG (Retrieval-Augmented Generation) pipeline using ChromaDB.


✨ Features


📄 PDF Resume Upload – Upload a resume in PDF format for analysis
🧠 AI-Powered Matching – Uses Gemini to compare resume content against a job description
🔍 RAG Pipeline – Resume text is chunked, embedded, and stored in ChromaDB, then the most relevant chunks are retrieved for analysis
📊 Match Score – Get a percentage score representing resume-to-job fit
✅ Strengths – Highlights of what matches well
⚠️ Missing Skills & Keywords – Identifies gaps compared to the job description
🚀 Actionable Suggestions – Top improvements to boost ATS compatibility
🧹 Auto Cleanup – Temporary vector data is automatically removed after 1 hour



🏗️ Tech Stack

Backend


Node.js + Express – REST API server
Multer – Handles PDF file uploads (in-memory, 5MB limit)
pdf-parse – Extracts raw text from uploaded PDFs
ChromaDB – Vector database for storing resume embeddings
Google Generative AI (Gemini) – Generates embeddings and performs the resume/job-description analysis
CORS, dotenv – Middleware and environment configuration


Frontend


React (Vite)



🔄 How It Works


User uploads a resume (PDF) and pastes a job description via the frontend
The backend extracts text from the PDF using pdf-parse
The extracted text is split into overlapping chunks
Each chunk is converted into a vector embedding using Gemini's embedding model
Embeddings are stored in a temporary ChromaDB collection (unique per session)
The job description is embedded and used to query ChromaDB for the most relevant resume chunks
The relevant chunks + job description are sent to Gemini, which returns a structured analysis (match score, strengths, missing skills/keywords, improvements)
The session's vector data is automatically deleted after 1 hour



📁 Project Structure

.
├── backend/
│   ├── config/
│   │   └── upload.js          # Multer config for PDF uploads
│   ├── routes/
│   │   └── analyze.js          # POST /api/analyze route
│   ├── services/
│   │   ├── pdfParser.js        # PDF text extraction + chunking
│   │   ├── embedder.js         # Gemini embedding generation
│   │   ├── chromadb.js         # Vector storage, RAG querying, cleanup
│   │   └── llm.js               # Gemini-based resume analysis
│   ├── server.js                # Express app entry point
│   └── .env                     # Environment variables (not committed)
│
└── frontend/
    ├── src/
    ├── index.html
    └── vite.config.js


⚙️ Prerequisites

Before you begin, ensure you have the following installed:


Node.js (v18 or higher recommended)
npm
ChromaDB running locally (default: http://localhost:8000)
A Google Gemini API key

📝 Notes & Limitations

Only PDF files are accepted for resume uploads (max 5MB).
Resume text is truncated to the first 3000 characters and the job description to 1500 characters before being sent to Gemini for analysis.
Each analysis creates a temporary, session-scoped ChromaDB collection that is automatically deleted 1 hour after creation.
If the Gemini API is unavailable, the backend returns a fallback response with general ATS suggestions.
