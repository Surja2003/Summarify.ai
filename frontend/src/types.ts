export interface Settings {
  speedMode: 'fast' | 'balanced' | 'thorough';
  domain: 'general' | 'academic' | 'legal' | 'journalistic';
  useAbstractive: boolean;
  darkMode: boolean;
  language: string;
  summaryMode: 'separate' | 'merged';
}

export interface Keyword {
  word: string;
  score: number;
}

export interface Highlight {
  sentence: string;
  score: number;
  index: number;
  documentId?: string; // For multi-document support
}

export interface SentenceScore {
  sentence: string;
  score: number;
  index: number;
}

export interface Metrics {
  compressionRatio: number;
  originalSentences: number;
  summarySentences: number;
  processingTime: number;
}

export interface DocumentResult {
  id: string;
  fileName: string;
  summary: string;
  highlights: Highlight[];
  keywords: Keyword[];
  originalText: string;
  metrics: Metrics;
}

export interface SummarizationResult {
  summary: string;
  highlights: Highlight[];
  keywords: Keyword[];
  sentenceScores: SentenceScore[];
  metrics: Metrics;
  fileName: string;
  timestamp: string;
  settings: Settings;
  originalText: string;
  documents?: DocumentResult[]; // For multi-document support
  isMerged?: boolean;
}

export interface HistoryItem {
  id: string;
  fileName: string;
  timestamp: string;
  summary: string;
  compressionRatio: number;
  settings: Settings;
  userId?: string; // For user-specific history
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}