# Setup & Development Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Development](#development)
4. [Project Structure](#project-structure)
5. [API Reference](#api-reference)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher (or yarn v1.22.0+)
- **Browser**: Modern browser with ES6+ support
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

### Recommended Tools
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/cortexcoders-summarizer.git
cd cortexcoders-summarizer
```

### Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### Step 3: Start Development Server

Using npm:
```bash
npm run dev
```

Using yarn:
```bash
yarn dev
```

The application will be available at `http://localhost:5173`

---

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
# API Configuration (if adding backend in future)
VITE_API_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_PDF=true
VITE_ENABLE_DOCX=true
```

### Development Workflow

1. **Start the dev server**: `npm run dev`
2. **Make changes**: Edit files in `/src`
3. **Hot reload**: Changes appear instantly
4. **Test features**: Use the UI to verify
5. **Commit changes**: Follow conventional commits

### Conventional Commits

```bash
feat: add new feature
fix: fix a bug
docs: update documentation
style: code style changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

---

## Project Structure

```
cortexcoders-summarizer/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Sidebar.tsx
│   │   ├── UploadArea.tsx
│   │   ├── SummaryPanel.tsx
│   │   ├── HighlightsPanel.tsx
│   │   ├── KeywordsPanel.tsx
│   │   ├── AnalyticsPanel.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── HistoryPanel.tsx
│   │   ├── SettingsPanel.tsx
│   │   └── ProcessingLoader.tsx
│   ├── utils/             # Utility functions
│   │   └── summarizer.ts  # NLP algorithms
│   ├── styles/            # Global styles
│   │   └── globals.css
│   ├── types.ts           # TypeScript types
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── README.md
└── SETUP.md
```

### Key Files

#### `/App.tsx`
Main application component managing state and routing.

#### `/utils/summarizer.ts`
Core NLP algorithms:
- TF-IDF vectorization
- Sentence scoring
- Extractive summarization
- Keyword extraction
- Abstractive refinement

#### `/types.ts`
TypeScript type definitions for:
- Settings
- Results
- Metrics
- History items
- Chat messages

---

## API Reference

### Core Functions

#### `processDocument(text: string, settings: Settings)`

Processes a document and returns summarization results.

**Parameters:**
- `text` (string): The document text to process
- `settings` (Settings): Configuration object

**Returns:** `Promise<SummarizationResult>`

**Example:**
```typescript
const result = await processDocument(
  "Your document text here...",
  {
    speedMode: 'balanced',
    domain: 'academic',
    useAbstractive: true,
    darkMode: false
  }
);
```

### Settings Interface

```typescript
interface Settings {
  speedMode: 'fast' | 'balanced' | 'thorough';
  domain: 'general' | 'academic' | 'legal' | 'journalistic';
  useAbstractive: boolean;
  darkMode: boolean;
}
```

### SummarizationResult Interface

```typescript
interface SummarizationResult {
  summary: string;                    // Generated summary
  highlights: Highlight[];            // Key sentences
  keywords: Keyword[];                // Extracted keywords
  sentenceScores: SentenceScore[];    // All sentence scores
  metrics: Metrics;                   // Processing metrics
  fileName: string;                   // Original file name
  timestamp: string;                  // Processing timestamp
  settings: Settings;                 // Used settings
  originalText: string;               // Original document
}
```

### Metrics Interface

```typescript
interface Metrics {
  compressionRatio: number;      // Percentage (0-100)
  originalSentences: number;     // Count of original sentences
  summarySentences: number;      // Count of summary sentences
  processingTime: number;        // Milliseconds
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Upload PDF file
- [ ] Upload DOCX file
- [ ] Upload TXT file
- [ ] Paste text directly
- [ ] Load demo text
- [ ] Process with Fast mode
- [ ] Process with Balanced mode
- [ ] Process with Thorough mode
- [ ] Test all domain modes
- [ ] Toggle abstractive mode
- [ ] View Summary tab
- [ ] View Highlights tab
- [ ] View Keywords tab
- [ ] View Analytics tab
- [ ] Use Chat feature
- [ ] Check History panel
- [ ] Modify Settings
- [ ] Export as TXT
- [ ] Toggle dark mode
- [ ] Test responsive design

### Test Documents

Create test files:

**test-academic.txt** (Research paper excerpt)
```
Recent advances in artificial intelligence have demonstrated...
```

**test-legal.txt** (Legal document)
```
This Agreement is entered into as of [Date] by and between...
```

**test-journalistic.txt** (News article)
```
Breaking news: Scientists have discovered...
```

---

## Troubleshooting

### Common Issues

#### 1. PDF Parsing Not Working

**Problem**: PDF files fail to parse
**Solution**: 
- Check if `pdfjs-dist` is installed
- Verify browser supports Web Workers
- Try with a different PDF file

```bash
npm install pdfjs-dist
```

#### 2. DOCX Parsing Errors

**Problem**: DOCX files show errors
**Solution**:
- Install mammoth library
- Check file is valid DOCX format

```bash
npm install mammoth
```

#### 3. Build Errors

**Problem**: TypeScript errors during build
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run type check
npm run type-check
```

#### 4. Slow Processing

**Problem**: Document processing takes too long
**Solution**:
- Use "Fast" speed mode for large documents
- Break very large documents into sections
- Ensure browser has enough memory

#### 5. Dark Mode Issues

**Problem**: Dark mode not switching properly
**Solution**:
- Check if `dark` class is applied to root element
- Clear browser cache
- Verify CSS variables are defined

### Browser Compatibility

If features don't work:

1. **Check browser version**
   - Update to latest version
   - Test in Chrome/Firefox first

2. **Clear browser cache**
   ```
   Chrome: Ctrl+Shift+Delete
   Firefox: Ctrl+Shift+Delete
   Safari: Cmd+Option+E
   ```

3. **Disable browser extensions**
   - Ad blockers may interfere
   - Privacy extensions may block features

### Performance Optimization

For large documents:

1. **Use Fast mode** for quick previews
2. **Split documents** over 50,000 words
3. **Close other tabs** to free memory
4. **Use desktop browser** for best performance

### Getting Help

If you encounter issues:

1. **Check console**: Open browser DevTools (F12)
2. **Review logs**: Look for error messages
3. **Create issue**: On GitHub with:
   - Error message
   - Steps to reproduce
   - Browser version
   - Sample document (if possible)

---

## Advanced Configuration

### Customizing TF-IDF

Edit `/utils/summarizer.ts`:

```typescript
// Adjust stop words list
private isStopWord(word: string): boolean {
  const stopWords = new Set([
    // Add your custom stop words
    'custom', 'words', 'here'
  ]);
  return stopWords.has(word);
}

// Adjust IDF calculation
private calculateIDF() {
  const N = this.documents.length;
  this.vocabulary.forEach((_, word) => {
    const df = this.documents.filter(doc => doc.includes(word)).length;
    // Modify the formula here
    this.idf.set(word, Math.log(N / (1 + df)));
  });
}
```

### Adding Custom Domain Modes

In `/utils/summarizer.ts`:

```typescript
// Add your domain
if (settings.domain === 'technical') {
  const techKeywords = ['algorithm', 'implementation', 'system'];
  const hasTechTerms = techKeywords.some(kw => 
    sentence.toLowerCase().includes(kw)
  );
  if (hasTechTerms) score *= 1.2;
}
```

### Customizing UI Theme

Edit `/styles/globals.css`:

```css
:root {
  /* Customize colors */
  --primary: #your-color;
  --secondary: #your-color;
  
  /* Customize gradients */
  background: linear-gradient(to br, #color1, #color2);
}
```

---

## Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` directory

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages

1. Build the project:
```bash
npm run build
```

2. Install gh-pages:
```bash
npm install -D gh-pages
```

3. Add to `package.json`:
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file.

---

**Questions?** Open an issue on GitHub or contact the team!
