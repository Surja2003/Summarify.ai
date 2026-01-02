import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileSidebar } from './components/MobileSidebar';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { UploadPageWithSettings } from './components/UploadPageWithSettings';
import { SummaryPanel } from './components/SummaryPanel';
import { HighlightsPanel } from './components/HighlightsPanel';
import { KeywordsPanel } from './components/KeywordsPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ChatPanel } from './components/ChatPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ProcessingLoader } from './components/ProcessingLoader';
import { FloatingChatbot } from './components/FloatingChatbot';
import { Moon, Sun, Sparkles, Home, LogOut, User as UserIcon, Menu, Upload } from 'lucide-react';
import { SummarizationResult, HistoryItem, Settings as SettingsType, User, DocumentResult } from './types';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'upload' | 'history'>('upload');
  const [activeTab, setActiveTab] = useState<'summary' | 'highlights' | 'keywords' | 'analytics' | 'chat'>('summary');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<SummarizationResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsType>({
    speedMode: 'balanced',
    domain: 'general',
    useAbstractive: true,
    darkMode: false,
    language: 'en',
    summaryMode: 'merged'
  });

  const handleLogin = (email: string, name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    setShowHome(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out? Your session history will be cleared.')) {
      setUser(null);
      setShowHome(true);
      setResult(null);
      setHistory([]);
    }
  };

  const handleMultiDocumentSummarize = async (
    files: Array<{ id: string; text: string; fileName: string }>,
    summaryMode: 'separate' | 'merged'
  ) => {
    setIsProcessing(true);
    setProcessingStep(0);
    
    const steps = [
      'Parsing documents...',
      'Normalizing text...',
      'Extracting features...',
      'Ranking sentences...',
      'Generating summaries...',
      'Highlighting key sections...',
      'Extracting keywords...',
      'Complete!'
    ];

    const { processDocument } = await import('./utils/summarizer');
    
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (summaryMode === 'merged') {
      // Merge all documents into one
      const combinedText = files.map(f => `=== ${f.fileName} ===\n\n${f.text}`).join('\n\n');
      const summaryResult = await processDocument(combinedText, settings);
      
      const finalResult: SummarizationResult = {
        ...summaryResult,
        fileName: `${files.length} Documents (Merged)`,
        timestamp: new Date().toISOString(),
        settings: { ...settings },
        isMerged: true
      };

      setResult(finalResult);
      
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        fileName: finalResult.fileName,
        timestamp: finalResult.timestamp,
        summary: finalResult.summary,
        compressionRatio: finalResult.metrics.compressionRatio,
        settings: finalResult.settings,
        userId: user?.id
      };
      setHistory(prev => [historyItem, ...prev]);
    } else {
      // Process each document separately
      const documentResults: DocumentResult[] = [];
      
      for (const file of files) {
        const summaryResult = await processDocument(file.text, settings);
        documentResults.push({
          id: file.id,
          fileName: file.fileName,
          summary: summaryResult.summary,
          highlights: summaryResult.highlights.map(h => ({ ...h, documentId: file.id })),
          keywords: summaryResult.keywords,
          originalText: file.text,
          metrics: summaryResult.metrics
        });
      }

      // Create combined result with separate summaries
      const combinedSummary = documentResults
        .map(d => `**${d.fileName}**\n\n${d.summary}`)
        .join('\n\n---\n\n');
      
      const combinedKeywords = documentResults
        .flatMap(d => d.keywords)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      const combinedHighlights = documentResults.flatMap(d => d.highlights);
      
      const avgCompressionRatio = documentResults.reduce((sum, d) => sum + d.metrics.compressionRatio, 0) / documentResults.length;

      const finalResult: SummarizationResult = {
        summary: combinedSummary,
        highlights: combinedHighlights,
        keywords: combinedKeywords,
        sentenceScores: [],
        metrics: {
          compressionRatio: Math.round(avgCompressionRatio),
          originalSentences: documentResults.reduce((sum, d) => sum + d.metrics.originalSentences, 0),
          summarySentences: documentResults.reduce((sum, d) => sum + d.metrics.summarySentences, 0),
          processingTime: documentResults.reduce((sum, d) => sum + d.metrics.processingTime, 0)
        },
        fileName: `${files.length} Documents (Separate)`,
        timestamp: new Date().toISOString(),
        settings: { ...settings },
        originalText: files.map(f => f.text).join('\n\n'),
        documents: documentResults,
        isMerged: false
      };

      setResult(finalResult);
      
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        fileName: finalResult.fileName,
        timestamp: finalResult.timestamp,
        summary: finalResult.summary,
        compressionRatio: finalResult.metrics.compressionRatio,
        settings: finalResult.settings,
        userId: user?.id
      };
      setHistory(prev => [historyItem, ...prev]);
    }
    
    setIsProcessing(false);
    setActiveTab('summary');
  };

  const handleHistorySelect = (item: HistoryItem) => {
    const reconstructedResult: SummarizationResult = {
      summary: item.summary,
      highlights: [],
      keywords: [],
      sentenceScores: [],
      metrics: {
        compressionRatio: item.compressionRatio,
        originalSentences: 0,
        summarySentences: 0,
        processingTime: 0
      },
      fileName: item.fileName,
      timestamp: item.timestamp,
      settings: item.settings,
      originalText: ''
    };
    setResult(reconstructedResult);
    setActiveView('upload');
    setActiveTab('summary');
  };

  const handleExport = (format: 'txt' | 'pdf') => {
    if (!result) return;

    if (format === 'txt') {
      const content = `Document Summary - ${result.fileName}\n${'='.repeat(50)}\n\n${result.summary}\n\n${'='.repeat(50)}\n\nKeywords:\n${result.keywords.map(k => `- ${k.word} (${k.score.toFixed(2)})`).join('\n')}\n\nMetrics:\n- Compression Ratio: ${result.metrics.compressionRatio}%\n- Processing Time: ${result.metrics.processingTime}ms\n- Mode: ${result.settings.speedMode} / ${result.settings.domain}\n- Language: ${result.settings.language}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `summary-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // If showing home page
  if (showHome) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-black transition-colors duration-300 relative">
          <HomePage 
            onGetStarted={() => setShowHome(false)} 
            darkMode={darkMode}
            onToggleTheme={() => {
              setDarkMode(!darkMode);
              setSettings(prev => ({ ...prev, darkMode: !darkMode }));
            }}
          />
        </div>
      </div>
    );
  }

  // If not logged in, show auth page
  if (!user) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-black transition-colors duration-300">
          <AuthPage 
            onLogin={handleLogin}
            darkMode={darkMode}
            onToggleTheme={() => {
              setDarkMode(!darkMode);
              setSettings(prev => ({ ...prev, darkMode: !darkMode }));
            }}
          />
        </div>
      </div>
    );
  }

  // Main app
  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-black transition-colors duration-300">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          darkMode={darkMode}
        />

        {/* Mobile Sidebar */}
        <MobileSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          darkMode={darkMode}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white/80 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile Hamburger Menu */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  aria-label="Open navigation menu"
                  title="Open menu"
                >
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>

                <button
                  onClick={() => setShowHome(true)}
                  className="hidden md:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  title="Back to Home"
                >
                  <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl md:text-2xl text-gray-900 dark:text-white">
                      Summarify<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 dark:text-gray-400 dark:bg-transparent">.ai</span>
                    </h1>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      AI-Powered Document Summarization
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3">
                {/* User Info */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
                </div>
                
                <button
                  onClick={() => {
                    setDarkMode(!darkMode);
                    setSettings(prev => ({ ...prev, darkMode: !darkMode }));
                  }}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-700" />
                  )}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-red-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-4 md:p-8">
            {activeView === 'upload' && (
              <>
                {!result && !isProcessing && (
                  <UploadPageWithSettings 
                    onSummarize={handleMultiDocumentSummarize} 
                    settings={settings} 
                    onSettingsUpdate={setSettings} 
                  />
                )}
                
                {isProcessing && (
                  <ProcessingLoader step={processingStep} />
                )}
                
                {result && !isProcessing && (
                  <div className="space-y-6">
                    {/* New Upload Button */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl text-gray-900 dark:text-white">
                        Results: {result.fileName}
                      </h2>
                      <button
                        onClick={() => setResult(null)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        New Upload
                      </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-2 border border-gray-200 dark:border-gray-800">
                      <div className="flex gap-2">
                        {[
                          { id: 'summary', label: 'Summary' },
                          { id: 'highlights', label: 'Highlights' },
                          { id: 'keywords', label: 'Keywords' },
                          { id: 'analytics', label: 'Analytics' },
                          { id: 'chat', label: 'Chat' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                              activeTab === tab.id
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white shadow-lg'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                      {activeTab === 'summary' && (
                        <SummaryPanel result={result} onExport={handleExport} />
                      )}
                      {activeTab === 'highlights' && (
                        <HighlightsPanel highlights={result.highlights} originalText={result.originalText} />
                      )}
                      {activeTab === 'keywords' && (
                        <KeywordsPanel keywords={result.keywords} />
                      )}
                      {activeTab === 'analytics' && (
                        <AnalyticsPanel result={result} />
                      )}
                      {activeTab === 'chat' && (
                        <ChatPanel document={result.originalText} summary={result.summary} />
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeView === 'history' && (
              <HistoryPanel history={history.filter(h => h.userId === user.id)} onSelect={handleHistorySelect} />
            )}
          </main>
        </div>
      </div>

      {/* Floating Chatbot - Only show when there's a result */}
      {result && (
        <FloatingChatbot 
          document={result.originalText} 
          summary={result.summary}
          documents={result.documents?.map(d => ({ 
            id: d.id, 
            fileName: d.fileName, 
            text: d.originalText 
          }))}
        />
      )}
    </div>
  );
}