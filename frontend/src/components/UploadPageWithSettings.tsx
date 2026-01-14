import React, { useState, useRef } from 'react';
import { Upload, File, X, FileText, CheckCircle, AlertCircle, Sparkles, ChevronDown, ChevronUp, Zap, Briefcase, BookOpen, Scale, Newspaper, Globe, Layers, Merge } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsType } from '../types';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  text?: string;
  error?: string;
}

interface UploadPageWithSettingsProps {
  settings: SettingsType;
  onSettingsUpdate: (settings: SettingsType) => void;
  onSummarize: (files: Array<{ id: string; text: string; fileName: string }>, summaryMode: 'separate' | 'merged') => void;
}

export function UploadPageWithSettings({ settings, onSettingsUpdate, onSummarize }: UploadPageWithSettingsProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const parseFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'txt') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text || text.trim().length === 0) {
            reject(new Error('File is empty'));
            return;
          }
          resolve(text);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      } else if (fileExtension === 'pdf') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            
            // Use pdfjs-dist package with proper worker configuration
            const pdfjsLib = await import('pdfjs-dist');
            
            // Configure worker from node_modules
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
              'pdfjs-dist/build/pdf.worker.min.mjs',
              import.meta.url
            ).toString();
            
            const loadingTask = pdfjsLib.getDocument({ 
              data: arrayBuffer
            });
            
            const pdf = await loadingTask.promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
              fullText += pageText + '\n\n';
            }
            
            if (!fullText || fullText.trim().length === 0) {
              reject(new Error('PDF appears to be empty or contains only images'));
              return;
            }
            
            resolve(fullText.trim());
          } catch (error) {
            console.error('PDF parsing error:', error);
            reject(new Error('Failed to parse PDF. The file may be corrupted or contain only images.'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsArrayBuffer(file);
      } else if (fileExtension === 'docx') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            
            // Dynamically import JSZip
            const JSZip = (await import('jszip')).default;
            const zip = await JSZip.loadAsync(arrayBuffer);
            const doc = await zip.file('word/document.xml')?.async('text');
            
            if (!doc) {
              throw new Error('Invalid DOCX file structure');
            }
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(doc, 'text/xml');
            const paragraphs = xmlDoc.getElementsByTagName('w:t');
            const text = Array.from(paragraphs)
              .map(p => p.textContent)
              .filter(t => t)
              .join(' ');
            
            if (!text || text.trim().length === 0) {
              reject(new Error('DOCX appears to be empty'));
              return;
            }
            
            resolve(text);
          } catch (error) {
            console.error('DOCX parsing error:', error);
            reject(new Error('Failed to parse DOCX. The file may be corrupted.'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read DOCX file'));
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.'));
      }
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: formatFileSize(file.size),
      status: 'pending' as const
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    for (const uploadedFile of newFiles) {
      try {
        setUploadedFiles(prev =>
          prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'processing' } : f)
        );

        const text = await parseFile(uploadedFile.file);

        setUploadedFiles(prev =>
          prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'ready', text } : f)
        );
      } catch (error) {
        setUploadedFiles(prev =>
          prev.map(f => f.id === uploadedFile.id 
            ? { ...f, status: 'error', error: (error as Error).message }
            : f
          )
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSummarize = () => {
    const readyFiles = uploadedFiles
      .filter(f => f.status === 'ready' && f.text)
      .map(f => ({ id: f.id, text: f.text!, fileName: f.name }));

    if (readyFiles.length > 0) {
      onSummarize(readyFiles, settings.summaryMode);
    }
  };

  const readyCount = uploadedFiles.filter(f => f.status === 'ready').length;
  const canSummarize = readyCount > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Settings Section - Collapsible */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
      >
        {showSettings ? (
          <button
            onClick={() => setShowSettings(false)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Collapse settings"
            aria-expanded="true"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-500" />
              <div className="text-left">
                <h2 className="text-xl text-gray-900 dark:text-white">
                  Summarization Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize how your documents are analyzed
                </p>
              </div>
            </div>
            <ChevronUp className="w-5 h-5 text-gray-500" />
          </button>
        ) : (
          <button
            onClick={() => setShowSettings(true)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Expand settings"
            aria-expanded="false"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-500" />
              <div className="text-left">
                <h2 className="text-xl text-gray-900 dark:text-white">
                  Summarization Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize how your documents are analyzed
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </button>
        )}

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 dark:border-gray-800"
            >
              <div className="p-6 space-y-6">
                {/* Speed Mode */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg text-gray-900 dark:text-white">Speed Mode</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'fast', label: 'Fast', icon: '⚡' },
                      { id: 'balanced', label: 'Balanced', icon: '⚖️' },
                      { id: 'thorough', label: 'Thorough', icon: '🎯' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => onSettingsUpdate({ ...settings, speedMode: mode.id as any })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          settings.speedMode === mode.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-gray-900'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{mode.icon}</div>
                        <div className="text-sm text-gray-900 dark:text-white">{mode.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Domain Mode */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg text-gray-900 dark:text-white">Domain Mode</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'general', label: 'General', icon: BookOpen },
                      { id: 'academic', label: 'Academic', icon: BookOpen },
                      { id: 'legal', label: 'Legal', icon: Scale },
                      { id: 'journalistic', label: 'News', icon: Newspaper }
                    ].map((domain) => {
                      const Icon = domain.icon;
                      return (
                        <button
                          key={domain.id}
                          onClick={() => onSettingsUpdate({ ...settings, domain: domain.id as any })}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            settings.domain === domain.id
                              ? 'border-purple-500 bg-purple-50 dark:bg-gray-900'
                              : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1 mx-auto" />
                          <div className="text-sm text-gray-900 dark:text-white">{domain.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language & Summary Mode Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Language */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-lg text-gray-900 dark:text-white">Language</h3>
                    </div>
                    <select
                      value={settings.language}
                      onChange={(e) => onSettingsUpdate({ ...settings, language: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      title="Select document language"
                      aria-label="Document language selection"
                    >
                      <option value="en">🇬🇧 English</option>
                      <option value="es">🇪🇸 Spanish</option>
                      <option value="fr">🇫🇷 French</option>
                      <option value="de">🇩🇪 German</option>
                      <option value="it">🇮🇹 Italian</option>
                      <option value="pt">🇵🇹 Portuguese</option>
                      <option value="zh">🇨🇳 Chinese</option>
                      <option value="ja">🇯🇵 Japanese</option>
                      <option value="ko">🇰🇷 Korean</option>
                      <option value="ar">🇸🇦 Arabic</option>
                      <option value="hi">🇮🇳 Hindi</option>
                      <option value="ru">🇷🇺 Russian</option>
                    </select>
                  </div>

                  {/* Multi-Document Mode */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-lg text-gray-900 dark:text-white">Summary Mode</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => onSettingsUpdate({ ...settings, summaryMode: 'merged' })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          settings.summaryMode === 'merged'
                            ? 'border-green-500 bg-green-50 dark:bg-gray-900'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                        }`}
                      >
                        <Merge className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1 mx-auto" />
                        <div className="text-sm text-gray-900 dark:text-white">Merged</div>
                      </button>
                      <button
                        onClick={() => onSettingsUpdate({ ...settings, summaryMode: 'separate' })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          settings.summaryMode === 'separate'
                            ? 'border-green-500 bg-green-50 dark:bg-gray-900'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                        }`}
                      >
                        <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1 mx-auto" />
                        <div className="text-sm text-gray-900 dark:text-white">Separate</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Abstractive Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-gray-900 rounded-xl border border-blue-200 dark:border-gray-800">
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-1">Abstractive Summarization</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generate more natural, human-like summaries
                    </p>
                  </div>
                  {settings.useAbstractive ? (
                    <button
                      onClick={() => onSettingsUpdate({ ...settings, useAbstractive: false })}
                      className="relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800"
                      role="switch"
                      aria-checked="true"
                      aria-label="Toggle abstractive summarization"
                    >
                      <span className="inline-block h-7 w-7 transform rounded-full bg-white shadow transition translate-x-6" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onSettingsUpdate({ ...settings, useAbstractive: true })}
                      className="relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors bg-gray-300 dark:bg-gray-800"
                      role="switch"
                      aria-checked="false"
                      aria-label="Toggle abstractive summarization"
                    >
                      <span className="inline-block h-7 w-7 transform rounded-full bg-white shadow transition translate-x-0" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-gray-900'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          title="Upload document files"
          aria-label="Upload multiple PDF, DOCX, or TXT files"
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>

          <div>
            <h3 className="text-xl text-gray-900 dark:text-white mb-2">
              Upload Your Documents
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag & drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Supports PDF, DOCX, and TXT • Multiple files supported
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Browse Files
          </button>
        </div>
      </motion.div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900 dark:text-white">
                Uploaded Files ({uploadedFiles.length})
              </h3>
              <button
                onClick={() => setUploadedFiles([])}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-gray-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {file.size}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === 'pending' && (
                      <span className="text-xs text-gray-500">Pending...</span>
                    )}
                    {file.status === 'processing' && (
                      <span className="text-xs text-blue-500">Processing...</span>
                    )}
                    {file.status === 'ready' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <div title={file.error}>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}

                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                      title="Remove file"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summarize Button */}
      <AnimatePresence>
        {canSummarize && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky bottom-4 z-10"
          >
            <button
              onClick={handleSummarize}
              className="w-full py-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:bg-gray-800 text-white rounded-2xl hover:shadow-2xl transition-all text-xl flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform relative z-10" />
              <span className="relative z-10 font-semibold">
                ✨ Summarize {readyCount} Document{readyCount > 1 ? 's' : ''} Now!
                {uploadedFiles.length > 1 && ` (${settings.summaryMode === 'merged' ? 'Merged' : 'Separate'})`}
              </span>
              <Sparkles className="w-7 h-7 group-hover:-rotate-12 transition-transform relative z-10" />
            </button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              Click the button above to generate your AI summary
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}