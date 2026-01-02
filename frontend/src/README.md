# Summarify.ai

<div align="center">

![AI Summarizer](https://img.shields.io/badge/AI-Summarizer-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Transform Documents into Insights with AI-Powered Summarization**

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [Usage](#usage) • [Technology](#technology)

</div>

---

## 🎯 Overview

Summarify.ai is a production-ready web application that uses advanced Natural Language Processing (NLP) techniques to automatically summarize documents, extract keywords, highlight key sentences, and provide interactive analytics. Built for students, researchers, and professionals who need to process large volumes of text efficiently—all while keeping your data private with client-side processing.

## ✨ Features

### Core Functionality
- 📄 **Multi-Format Support**: Upload PDF, DOCX, or TXT files, or paste text directly
- 🎯 **Hybrid Summarization**: Combines extractive (TF-IDF) and abstractive techniques
- 🎨 **Smart Highlighting**: Automatically identifies and highlights key sentences
- 🔑 **Keyword Extraction**: Extracts and ranks important terms and phrases
- 💬 **Interactive Chat**: Ask questions about your documents using AI
- 📊 **Analytics Dashboard**: Visualize document metrics and sentence scores
- 💾 **History Tracking**: Save and restore previous summarizations
- 📤 **Export Options**: Download summaries as TXT files

### Processing Modes

#### Speed Modes
- ⚡ **Fast**: Quick processing with 20% compression (samples document)
- ⚖️ **Balanced**: Optimal balance with 30% compression
- 🎯 **Thorough**: Detailed analysis with 40% compression

#### Domain Modes
- 📚 **General**: For general-purpose documents
- 🎓 **Academic**: Optimized for research papers and scholarly articles
- ⚖️ **Legal**: Enhanced for contracts and legal documents
- 📰 **Journalistic**: Tuned for news articles and reports

### UI/UX Features
- 🌓 **Dark/Light Mode**: Seamless theme switching
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Modern UI**: Glassmorphism effects with smooth gradients
- ⚡ **Real-time Processing**: Live progress indicators
- 🎯 **Tab Navigation**: Organized views for different analysis types

## 🚀 Technology Stack

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe code
- **Tailwind CSS 4**: Utility-first styling
- **Lucide React**: Beautiful icons

### NLP & Processing
- **TF-IDF Vectorization**: Custom implementation for extractive summarization
- **Cosine Similarity**: Sentence importance scoring
- **Tokenization**: Sentence and word-level parsing
- **Keyword Extraction**: Frequency-based ranking

### Features
- **Client-Side Processing**: All processing happens in the browser
- **No Backend Required**: Fully self-contained application
- **Privacy-First**: Documents never leave your device

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cortexcoders-summarizer.git
cd cortexcoders-summarizer
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open in browser**
```
Navigate to http://localhost:5173
```

## 🎮 Usage

### Basic Workflow

1. **Upload or Paste Document**
   - Drag & drop a PDF, DOCX, or TXT file
   - Or paste text directly (minimum 100 characters)
   - Or click "Load Demo" for sample text

2. **Configure Settings** (Optional)
   - Choose speed mode: Fast, Balanced, or Thorough
   - Select domain: General, Academic, Legal, or Journalistic
   - Toggle abstractive summarization

3. **Process Document**
   - Click "Analyze Document"
   - Watch real-time processing steps
   - Wait for analysis to complete

4. **Explore Results**
   - **Summary Tab**: View generated summary with metrics
   - **Highlights Tab**: See key sentences with importance scores
   - **Keywords Tab**: Explore extracted terms and tag cloud
   - **Analytics Tab**: Analyze sentence scores and distributions
   - **Chat Tab**: Ask questions about the document

5. **Export or Save**
   - Export summary as TXT
   - View in History panel for later access

### Example Usage

```typescript
// The application handles all processing automatically
// Just upload a document and click "Analyze Document"

// Sample API-like flow (internal):
const result = await processDocument(text, {
  speedMode: 'balanced',
  domain: 'academic',
  useAbstractive: true,
  darkMode: false
});

// Returns:
{
  summary: "AI has revolutionized information processing...",
  highlights: [...],
  keywords: [...],
  sentenceScores: [...],
  metrics: {
    compressionRatio: 70,
    originalSentences: 20,
    summarySentences: 6,
    processingTime: 245
  }
}
```

## 🧠 How It Works

### 1. Document Parsing
- Extracts text from PDF, DOCX, or plain text
- Normalizes whitespace and formatting
- Tokenizes into sentences

### 2. Feature Extraction
- Builds vocabulary from document
- Calculates Term Frequency (TF) for each word
- Computes Inverse Document Frequency (IDF)
- Generates TF-IDF matrix

### 3. Sentence Scoring
- Computes cosine similarity between sentences
- Applies domain-specific weights
- Adds position bonuses (first/last sentences)
- Penalizes very short or long sentences

### 4. Extractive Summarization
- Ranks sentences by importance
- Selects top N sentences based on speed mode
- Maintains original document order

### 5. Abstractive Refinement (Optional)
- Removes redundant phrases
- Combines short consecutive sentences
- Adds transitional phrases

### 6. Keyword Extraction
- Ranks words by TF-IDF scores
- Filters stop words
- Returns top 15 keywords

### 7. Highlight Generation
- Identifies top 5 most important sentences
- Calculates similarity to summary
- Provides visual indicators

## 📊 Metrics & Analytics

The application provides detailed analytics:

- **Compression Ratio**: Percentage reduction from original
- **Sentence Counts**: Original vs. summary
- **Processing Time**: Milliseconds to complete
- **Sentence Scores**: Individual importance ratings
- **Score Distribution**: Histogram of sentence quality
- **Keyword Rankings**: Top terms with scores

## 🎨 UI Components

### Layout
- **Sidebar**: Navigation between Upload, History, Settings
- **Header**: Title, breadcrumbs, theme toggle
- **Main Area**: Context-sensitive content

### Panels
- **UploadArea**: File upload and text input
- **ProcessingLoader**: Animated progress indicator
- **SummaryPanel**: Results with export options
- **HighlightsPanel**: List and context views
- **KeywordsPanel**: Rankings and tag cloud
- **AnalyticsPanel**: Charts and metrics
- **ChatPanel**: Interactive Q&A
- **HistoryPanel**: Previous summaries
- **SettingsPanel**: Configuration options

## 🔧 Configuration

### Speed Mode Settings
```typescript
{
  fast: {
    compression: 0.2,      // 20% of original
    sampling: 'every_2nd'  // Process every 2nd sentence
  },
  balanced: {
    compression: 0.3,      // 30% of original
    sampling: '70_percent' // Process 70% of sentences
  },
  thorough: {
    compression: 0.4,      // 40% of original
    sampling: 'all'        // Process all sentences
  }
}
```

### Domain Weights
```typescript
{
  academic: {
    keywords: ['research', 'study', 'analysis', 'results', 'conclusion'],
    boost: 1.2
  },
  legal: {
    keywords: ['shall', 'hereby', 'pursuant', 'agreement', 'party'],
    boost: 1.2
  },
  journalistic: {
    leadBoost: 1.3  // Boost first 3 sentences
  }
}
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team CortexCoders

Built with ❤️ by Team CortexCoders for hackathons and portfolios.

## 🙏 Acknowledgments

- TF-IDF algorithm for extractive summarization
- Cosine similarity for sentence ranking
- React and Tailwind CSS communities
- Lucide for beautiful icons

## 📧 Contact

For questions or feedback:
- Create an issue on GitHub
- Email: team@cortexcoders.dev (example)

---

<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

Made with 💙 by CortexCoders

</div>