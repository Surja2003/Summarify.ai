# Sumrify - AI Document Summarization Platform

A modern, production-ready web application for AI-powered document summarization with hybrid NLP techniques (extractive + abstractive), keyword extraction, and interactive analytics.

## 🎯 Features

- **Document Upload**: PDF, DOCX, TXT support
- **Multi-file Batch Processing**: Upload and summarize multiple documents
- **Smart Summarization**: 
  - Extractive (TF-IDF based)
  - Abstractive (Transformer models - optional)
- **Speed Modes**: Fast | Balanced | Thorough
- **Domain Modes**: General | Academic | Legal | Journalistic
- **Interactive Highlights**: Key sentences with importance scores
- **Keyword Extraction**: Top terms from documents
- **Analytics Dashboard**: Compression ratio, processing time, visualizations
- **History Panel**: Track previous summarizations
- **Dark/Light Mode**: Modern glassmorphic UI
- **Responsive Design**: Mobile and desktop optimized

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Chart.js** for analytics visualization
- **Lucide React** for icons
- Client-side NLP processing with TF-IDF

### Backend (Optional Enhancement)
- **Python 3.8+**
- **FastAPI** for REST API
- **scikit-learn** for NLP
- **transformers** (HuggingFace) for abstractive summarization
- **PyPDF2** for PDF parsing
- **python-docx** for DOCX parsing

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
- Server-side processing for large documents
- Advanced abstractive summarization with transformers
- Document history persistence
- Chat functionality

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
- **TF-IDF Vectorization**: Term frequency-inverse document frequency
- **Cosine Similarity**: Sentence centrality scoring
- **Domain-Specific Weighting**: Boost relevant keywords
- **Position Bias**: First/last sentence importance
- **Length Normalization**: Penalty for extreme lengths

### Abstractive Refinement (Optional)
- **Transformer Models**: BART/T5 from HuggingFace
- **Text Condensation**: Paraphrasing and compression
- **Coherence Enhancement**: Smooth transitions

### Keyword Extraction
- **TF-IDF Scoring**: Most distinctive terms
- **Stop Word Filtering**: Remove common words
- **Frequency Analysis**: Top N keywords

## 🐛 Troubleshooting

### Frontend Issues

**Problem**: `npm install` fails
- **Solution**: Clear cache with `npm cache clean --force`, then retry

**Problem**: Port 3000 already in use
- **Solution**: Use `npm run dev -- --port 3001`

### Backend Issues

**Problem**: Import errors
- **Solution**: Ensure virtual environment is activated and all dependencies installed

**Problem**: Transformers model download slow
- **Solution**: First run downloads BART model (~1.6GB). Be patient or disable abstractive mode.

**Problem**: PDF parsing fails
- **Solution**: Some PDFs have protection or complex formatting. Try converting to TXT first.

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team CortexCoders

Built as a hackathon-ready and portfolio-worthy project demonstrating:
- Modern web development practices
- AI/NLP integration
- Full-stack architecture
- Clean code and documentation

## 🤝 Contributing

Contributions welcome! Please see CONTRIBUTING.md for guidelines.

## 📧 Support

For issues or questions:
- Open a GitHub issue
- Check documentation in `/docs`
- Review API docs at `/docs` endpoint

---

**Happy Summarizing! 📄✨**
