import React, { useState, useRef } from 'react';
import { Upload, File, X, FileText, CheckCircle, AlertCircle, Layers, Merge } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  text?: string;
  error?: string;
}

interface MultiDocumentUploadProps {
  onSummarize: (files: Array<{ id: string; text: string; fileName: string }>, summaryMode: 'separate' | 'merged') => void;
}

export function MultiDocumentUpload({ onSummarize }: MultiDocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [summaryMode, setSummaryMode] = useState<'separate' | 'merged'>('merged');
  const [isDragging, setIsDragging] = useState(false);
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
          resolve(text);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      } else if (fileExtension === 'pdf') {
        // PDF parsing using PDF.js
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
              fullText += pageText + '\n\n';
            }
            
            resolve(fullText.trim());
          } catch (error) {
            reject(new Error('Failed to parse PDF'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsArrayBuffer(file);
      } else if (fileExtension === 'docx') {
        // DOCX parsing using JSZip
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const JSZip = (await import('jszip')).default;
            const zip = await JSZip.loadAsync(arrayBuffer);
            const doc = await zip.file('word/document.xml')?.async('text');
            
            if (!doc) {
              throw new Error('Invalid DOCX file');
            }
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(doc, 'text/xml');
            const paragraphs = xmlDoc.getElementsByTagName('w:t');
            const text = Array.from(paragraphs)
              .map(p => p.textContent)
              .filter(t => t)
              .join(' ');
            
            resolve(text);
          } catch (error) {
            reject(new Error('Failed to parse DOCX'));
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

    // Process each file
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
      onSummarize(readyFiles, summaryMode);
    }
  };

  const readyCount = uploadedFiles.filter(f => f.status === 'ready').length;
  const canSummarize = readyCount > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <div
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
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>

          <div>
            <h3 className="text-xl text-gray-900 dark:text-white mb-2">
              Upload Multiple Documents
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag & drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Supports PDF, DOCX, and TXT files (up to 10MB each)
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
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
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
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
                      <AlertCircle className="w-5 h-5 text-red-500" title={file.error} />
                    )}

                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
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

      {/* Summary Mode Selection */}
      {uploadedFiles.length > 1 && readyCount > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <h3 className="text-lg text-gray-900 dark:text-white mb-4">
            Summary Mode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSummaryMode('merged')}
              className={`p-4 rounded-xl border-2 transition-all ${
                summaryMode === 'merged'
                  ? 'border-blue-500 bg-blue-50 dark:bg-gray-900'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Merge className={`w-5 h-5 ${summaryMode === 'merged' ? 'text-blue-500' : 'text-gray-500'}`} />
                <span className="text-gray-900 dark:text-white">Merged Summary</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Combine all documents into one comprehensive summary
              </p>
            </button>

            <button
              onClick={() => setSummaryMode('separate')}
              className={`p-4 rounded-xl border-2 transition-all ${
                summaryMode === 'separate'
                  ? 'border-blue-500 bg-blue-50 dark:bg-gray-900'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Layers className={`w-5 h-5 ${summaryMode === 'separate' ? 'text-blue-500' : 'text-gray-500'}`} />
                <span className="text-gray-900 dark:text-white">Separate Summaries</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get individual summaries for each document
              </p>
            </button>
          </div>
        </motion.div>
      )}

      {/* Summarize Button */}
      {canSummarize && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={handleSummarize}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all text-lg"
          >
            Summarize {readyCount} Document{readyCount > 1 ? 's' : ''}
            {uploadedFiles.length > 1 && ` (${summaryMode === 'merged' ? 'Merged' : 'Separate'})`}
          </button>
        </motion.div>
      )}
    </div>
  );
}
