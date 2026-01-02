# Sumrify - AI Document Summarization Platform

A modern, production-ready web application for AI-powered document summarization with hybrid NLP techniques (extractive + abstractive), keyword extraction, and interactive analytics.

## 🎯 Features

  - Extractive (TF-IDF based)
  - Abstractive (Transformer models - optional)

## 🛠️ Tech Stack

### Frontend

### Backend (Optional Enhancement)

## 📁 Project Structure

```
sumrify/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── utils/           # Utilities (summarizer.ts)
│   │   ├── types.ts         # TypeScript types
│   │   └── App.tsx          # Main app component
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                 # FastAPI backend (optional)
│   ├── main.py             # API routes
│   ├── summarizer.py       # Summarization logic
│   ├── parsers.py          # Document parsers
│   ├── utils.py            # Utilities
│   └── requirements.txt    # Python dependencies
│
└── README.md
```

## 🚀 Setup & Installation

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

The frontend runs standalone and processes documents entirely in the browser using client-side NLP.

### Backend Setup (Optional)

The backend provides optional enhanced features like:

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the API server:**
   ```bash
   uvicorn main:app --reload
   ```

5. **API will be available at:**
   - http://localhost:8000
   - API docs: http://localhost:8000/docs

## 📡 API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| POST | `/api/summarize` | Summarize single document |
| POST | `/api/summarize/batch` | Batch summarize multiple documents |
| POST | `/api/chat` | Chat with document |
| GET | `/api/history` | Get summarization history |
| POST | `/api/history` | Add to history |
| POST | `/api/export` | Export summary (TXT/PDF) |

## 🎨 Frontend Usage

1. **Upload Documents:**
   - Click "Upload" or drag & drop files
   - Supports PDF, DOCX, TXT
   - Can paste text directly

2. **Configure Settings:**
   - **Speed Mode**: Fast (quick), Balanced (recommended), Thorough (detailed)
   - **Domain**: General, Academic, Legal, Journalistic
   - **Abstractive Refinement**: Enable for AI-enhanced summaries

3. **View Results:**
   - **Summary Tab**: Structured summary with main points
   - **Highlights Tab**: Key sentences with importance scores
   - **Keywords Tab**: Extracted important terms
   - **Analytics Tab**: Metrics and visualizations
   - **Chat Tab**: Ask questions about the document

4. **History:**
   - Access previous summarizations
   - Click to reload results

## 🔧 Configuration

### Frontend Environment
No environment variables needed - runs standalone.

### Backend Environment (if using)
Create a `.env` file in the backend directory:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# CORS Settings
CORS_ORIGINS=*

# Cache Settings
MAX_CACHE_SIZE=100
```

## 📊 Sample API Request

### Summarize Document

```bash
curl -X POST "http://localhost:8000/api/summarize" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your document text here...",
    "settings": {
      "speedMode": "balanced",
      "domain": "general",
      "useAbstractive": false
    },
    "fileName": "document.txt"
  }'
```

### Response

```json
{
  "summary": "The main summary text...",
  "highlights": [
    {
      "sentence": "Important sentence 1...",
      "score": 0.85,
      "index": 0
    }
  ],
  "keywords": [
    {
      "word": "important",
      "score": 0.75
    }
  ],
  "sentenceScores": [...],
  "metrics": {
    "compressionRatio": 65,
    "originalSentences": 20,
    "summarySentences": 7,
    "processingTime": 1234
  },
  "fileName": "document.txt",
  "timestamp": "2025-12-19T...",
  "settings": {...}
}
```

## 🎯 Algorithms

### Extractive Summarization

### Abstractive Refinement (Optional)

### Keyword Extraction

## 🐛 Troubleshooting

### Frontend Issues

**Problem**: `npm install` fails

**Problem**: Port 3000 already in use

### Backend Issues

**Problem**: Import errors

**Problem**: Transformers model download slow

**Problem**: PDF parsing fails

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team CortexCoders

Built as a hackathon-ready and portfolio-worthy project demonstrating:

## 🤝 Contributing

Contributions welcome! Please see CONTRIBUTING.md for guidelines.

## 📧 Support

For issues or questions:


**Happy Summarizing! 📄✨**
