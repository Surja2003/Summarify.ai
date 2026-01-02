import { Settings, SummarizationResult, Keyword, Highlight, SentenceScore } from '../types';

// TF-IDF Implementation
class TFIDFVectorizer {
  private vocabulary: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();
  private documents: string[][] = [];

  fit(documents: string[]) {
    this.documents = documents.map(doc => this.tokenize(doc));
    this.buildVocabulary();
    this.calculateIDF();
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.isStopWord(word));
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
      'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this',
      'it', 'from', 'be', 'are', 'was', 'were', 'been', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'can', 'their', 'them', 'they', 'we', 'you', 'your',
      'all', 'also', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
      'some', 'such', 'than', 'too', 'very', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'under', 'again',
      'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
      'how', 'what', 'who', 'whom', 'whose', 'about', 'against', 'along',
      'among', 'around', 'because', 'being', 'behind', 'beside', 'besides',
      'down', 'except', 'off', 'out', 'over', 'since', 'toward', 'towards',
      'unless', 'until', 'upon', 'within', 'without', 'via', 'yes', 'no'
    ]);
    return stopWords.has(word);
  }

  private buildVocabulary() {
    const allWords = new Set<string>();
    this.documents.forEach(doc => {
      doc.forEach(word => allWords.add(word));
    });
    Array.from(allWords).forEach((word, idx) => {
      this.vocabulary.set(word, idx);
    });
  }

  private calculateIDF() {
    const N = this.documents.length;
    this.vocabulary.forEach((_, word) => {
      const df = this.documents.filter(doc => doc.includes(word)).length;
      this.idf.set(word, Math.log(N / (1 + df)));
    });
  }

  transform(documents: string[]): number[][] {
    return documents.map(doc => {
      const tokens = this.tokenize(doc);
      const tf = new Map<string, number>();
      
      // Calculate term frequency
      tokens.forEach(token => {
        tf.set(token, (tf.get(token) || 0) + 1);
      });

      // Normalize TF
      const maxFreq = Math.max(...Array.from(tf.values()));
      tf.forEach((freq, term) => {
        tf.set(term, freq / maxFreq);
      });

      // Calculate TF-IDF vector
      const vector = new Array(this.vocabulary.size).fill(0);
      tf.forEach((tfValue, term) => {
        const idx = this.vocabulary.get(term);
        const idfValue = this.idf.get(term) || 0;
        if (idx !== undefined) {
          vector[idx] = tfValue * idfValue;
        }
      });

      return vector;
    });
  }

  getFeatureNames(): string[] {
    return Array.from(this.vocabulary.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([word]) => word);
  }
}

// Cosine Similarity
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Sentence Tokenization
function tokenizeSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .match(/[^.!?]+[.!?]+/g)
    ?.map(s => s.trim())
    .filter(s => s.length > 20) || [];
}

// Keyword Extraction with improved algorithm
function extractKeywords(text: string, topN: number = 20): Keyword[] {
  // Tokenize and clean text
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  // Calculate word frequency
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    if (!isStopWord(word)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });

  // Use TF-IDF for better scoring
  const vectorizer = new TFIDFVectorizer();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) {
    return [];
  }

  vectorizer.fit(sentences);
  const matrix = vectorizer.transform(sentences);
  const featureNames = vectorizer.getFeatureNames();

  // Aggregate scores across all sentences
  const wordScores = new Map<string, number>();
  for (let sentIdx = 0; sentIdx < matrix.length; sentIdx++) {
    matrix[sentIdx].forEach((score, wordIdx) => {
      const word = featureNames[wordIdx];
      if (word && score > 0) {
        wordScores.set(word, (wordScores.get(word) || 0) + score);
      }
    });
  }

  // Combine with frequency for final score
  const keywords: Keyword[] = [];
  wordScores.forEach((tfidfScore, word) => {
    const freq = wordFreq.get(word) || 0;
    const finalScore = (tfidfScore * 0.7) + (freq / words.length * 0.3);
    keywords.push({ word, score: finalScore });
  });

  return keywords
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .filter(k => k.score > 0 && k.word.length > 3);
}

// Helper function to check stop words
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
    'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this',
    'it', 'from', 'be', 'are', 'was', 'were', 'been', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'can', 'their', 'them', 'they', 'we', 'you', 'your',
    'all', 'also', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'than', 'too', 'very', 'into', 'through', 'during'
  ]);
  return stopWords.has(word);
}

// Extractive Summarization
function extractiveSummarize(
  sentences: string[],
  settings: Settings
): { scores: SentenceScore[]; topIndices: number[] } {
  if (sentences.length === 0) {
    return { scores: [], topIndices: [] };
  }

  // Apply speed mode sampling
  let processedSentences = [...sentences];
  if (settings.speedMode === 'fast' && sentences.length > 50) {
    // Sample every other sentence for fast mode
    processedSentences = sentences.filter((_, idx) => idx % 2 === 0);
  } else if (settings.speedMode === 'balanced' && sentences.length > 100) {
    // Sample 70% for balanced mode
    const step = Math.ceil(sentences.length / (sentences.length * 0.7));
    processedSentences = sentences.filter((_, idx) => idx % step === 0);
  }

  // Build TF-IDF matrix
  const vectorizer = new TFIDFVectorizer();
  vectorizer.fit(processedSentences);
  const tfidfMatrix = vectorizer.transform(processedSentences);

  // Calculate sentence scores based on similarity to all other sentences
  const sentenceScores: SentenceScore[] = processedSentences.map((sentence, i) => {
    let score = 0;
    
    // Score based on similarity to other sentences (centrality)
    for (let j = 0; j < tfidfMatrix.length; j++) {
      if (i !== j) {
        score += cosineSimilarity(tfidfMatrix[i], tfidfMatrix[j]);
      }
    }
    
    // Normalize score
    score = score / (tfidfMatrix.length - 1 || 1);

    // Apply domain-specific weights
    if (settings.domain === 'academic') {
      // Boost sentences with academic keywords
      const academicKeywords = ['research', 'study', 'analysis', 'results', 'conclusion', 'findings'];
      const hasAcademicTerms = academicKeywords.some(kw => 
        sentence.toLowerCase().includes(kw)
      );
      if (hasAcademicTerms) score *= 1.2;
    } else if (settings.domain === 'legal') {
      // Boost sentences with legal keywords
      const legalKeywords = ['shall', 'hereby', 'pursuant', 'agreement', 'party', 'rights'];
      const hasLegalTerms = legalKeywords.some(kw => 
        sentence.toLowerCase().includes(kw)
      );
      if (hasLegalTerms) score *= 1.2;
    } else if (settings.domain === 'journalistic') {
      // Boost first sentences (lead paragraph importance)
      if (i < 3) score *= 1.3;
    }

    // Position bonus (first and last sentences often important)
    if (i === 0) score *= 1.15;
    if (i === processedSentences.length - 1) score *= 1.1;

    // Length penalty for very short or very long sentences
    const words = sentence.split(/\s+/).length;
    if (words < 8 || words > 40) score *= 0.9;

    return {
      sentence,
      score,
      index: sentences.indexOf(sentence)
    };
  });

  // Determine number of sentences to extract - more comprehensive
  let numSentences = Math.ceil(sentences.length * 0.35); // 35% by default
  if (settings.speedMode === 'fast') {
    numSentences = Math.ceil(sentences.length * 0.25); // 25% for fast
  } else if (settings.speedMode === 'thorough') {
    numSentences = Math.ceil(sentences.length * 0.5); // 50% for thorough
  }
  
  // Ensure minimum and maximum bounds
  numSentences = Math.max(3, Math.min(numSentences, sentences.length));

  // Select top sentences
  const sortedScores = [...sentenceScores].sort((a, b) => b.score - a.score);
  const topIndices = sortedScores
    .slice(0, numSentences)
    .map(s => s.index)
    .sort((a, b) => a - b); // Maintain original order

  return { scores: sentenceScores, topIndices };
}

// Abstractive Refinement (Simulated)
function abstractiveRefine(sentences: string[]): string {
  // In a real implementation, this would use a transformer model like BART or T5
  // For this demo, we'll do some simple text refinement
  
  let refined = sentences.join(' ');
  
  // Remove redundant phrases
  refined = refined.replace(/\b(\w+)\s+\1\b/gi, '$1');
  
  // Combine short consecutive sentences
  refined = refined.replace(/\.\s+([A-Z]\w{0,3}\s+)/g, ', $1');
  
  // Add transitional phrases
  const parts = refined.split('. ');
  if (parts.length > 2) {
    parts.splice(Math.floor(parts.length / 2), 0, 'Furthermore');
  }
  refined = parts.join('. ');
  
  return refined;
}

// Main Processing Function
export async function processDocument(
  text: string,
  settings: Settings
): Promise<Omit<SummarizationResult, 'fileName' | 'timestamp' | 'settings'>> {
  const startTime = performance.now();

  // Tokenize sentences
  const sentences = tokenizeSentences(text);
  
  if (sentences.length === 0) {
    throw new Error('No valid sentences found in document');
  }

  // Extract keywords - dynamic based on document complexity
  // More diverse documents need more keywords to capture breadth
  const uniqueWords = new Set(text.toLowerCase().match(/\b\w{4,}\b/g) || []).size;
  const documentComplexity = Math.min(1.0, uniqueWords / 1000); // 0-1 scale
  const baseKeywords = Math.max(8, Math.min(50, Math.ceil(sentences.length / 3))); // 1 keyword per 3 sentences
  const dynamicKeywordCount = Math.ceil(baseKeywords * (0.7 + documentComplexity * 0.6)); // Scale by complexity
  
  const keywords = extractKeywords(text, dynamicKeywordCount);

  // Perform extractive summarization
  const { scores, topIndices } = extractiveSummarize(sentences, settings);

  // Build summary
  let summarySentences = topIndices.map(idx => sentences[idx]);
  
  // Apply abstractive refinement if enabled
  let summary = '';
  if (settings.useAbstractive && summarySentences.length > 3) {
    summary = abstractiveRefine(summarySentences);
  } else {
    summary = summarySentences.join(' ');
  }

  // Generate highlights based on QUALITY threshold, not fixed count
  // Use percentile-based selection: only include sentences above quality threshold
  const sortedByScore = [...scores].sort((a, b) => b.score - a.score);
  
  // Calculate quality threshold based on score distribution
  const allScores = sortedByScore.map(s => s.score);
  const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
  const stdDev = Math.sqrt(
    allScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / allScores.length
  );
  
  // Dynamic threshold: mean + 0.5 * stdDev (captures top ~30-40% of sentences)
  // Adjusts based on score distribution - more highlights for documents with many important sentences
  const qualityThreshold = avgScore + (0.5 * stdDev);
  
  // Select all sentences above quality threshold
  let qualityHighlights = sortedByScore.filter(s => s.score >= qualityThreshold);
  
  // Ensure reasonable bounds: min 3, max 50% of document
  const minHighlights = Math.min(3, sentences.length);
  const maxHighlights = Math.ceil(sentences.length * 0.5);
  
  if (qualityHighlights.length < minHighlights) {
    qualityHighlights = sortedByScore.slice(0, minHighlights);
  } else if (qualityHighlights.length > maxHighlights) {
    qualityHighlights = sortedByScore.slice(0, maxHighlights);
  }
  
  const highlights: Highlight[] = qualityHighlights.map(s => ({
    sentence: s.sentence,
    score: s.score,
    index: s.index
  }));

  // Calculate metrics
  const endTime = performance.now();
  const compressionRatio = Math.round(
    (1 - summarySentences.length / sentences.length) * 100
  );

  return {
    summary,
    highlights,
    keywords,
    sentenceScores: scores,
    metrics: {
      compressionRatio,
      originalSentences: sentences.length,
      summarySentences: summarySentences.length,
      processingTime: Math.round(endTime - startTime)
    },
    originalText: text
  };
}
