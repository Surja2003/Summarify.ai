import React, { useState, useRef } from 'react';
import { Upload, FileText, File, AlertCircle } from 'lucide-react';

interface UploadAreaProps {
  onSummarize: (text: string, fileName?: string) => void;
}

export function UploadArea({ onSummarize }: UploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const fileName = file.name;
    const fileType = file.type;

    try {
      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        const text = await file.text();
        setText(text);
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        const text = await parsePDF(file);
        if (text) {
          setText(text);
        }
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        const text = await parseDOCX(file);
        if (text) {
          setText(text);
        }
      } else {
        setError('Unsupported file type. Please upload PDF, DOCX, or TXT files, or paste text directly.');
      }
    } catch (err: any) {
      setError(err.message || 'Error reading file. Please try pasting the text directly.');
      console.error(err);
    }
  };

  const parsePDF = async (file: File): Promise<string> => {
    try {
      // Dynamic import to avoid loading if not needed
      const pdfjsLib = await import('pdfjs-dist');
      
      // Configure worker from node_modules
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += pageText + '\n\n';
      }
      
      if (!fullText.trim()) {
        throw new Error('No text found in PDF. The PDF might be image-based or empty.');
      }
      
      return fullText;
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      throw new Error('Could not parse PDF. Please copy and paste the text content directly.');
    }
  };

  const parseDOCX = async (file: File): Promise<string> => {
    try {
      // Use docx library which is browser-compatible
      const docx = await import('docx-preview');
      
      // For simple text extraction, we'll read as zip and extract text
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      // Get the document.xml file which contains the text
      const documentXml = await contents.file('word/document.xml')?.async('text');
      
      if (!documentXml) {
        throw new Error('Invalid DOCX file structure');
      }
      
      // Simple text extraction from XML (remove tags)
      const text = documentXml
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!text) {
        throw new Error('No text found in DOCX file.');
      }
      
      return text;
    } catch (err: any) {
      console.error('DOCX parsing error:', err);
      throw new Error('Could not parse DOCX. Please copy and paste the text content directly.');
    }
  };

  const handleSubmit = () => {
    if (text.trim().length < 100) {
      setError('Please provide at least 100 characters of text.');
      return;
    }
    onSummarize(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Card */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl text-gray-900 dark:text-white mb-6">
          Upload Document
        </h2>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-gray-900'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
            className="hidden"
            title="Upload document files"
            aria-label="Upload PDF, DOCX, or TXT files"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>

            <div>
              <p className="text-gray-900 dark:text-white mb-2">
                Drag and drop your document here
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                or click to browse
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Choose File
            </button>

            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </div>
              <div className="flex items-center gap-1">
                <File className="w-4 h-4" />
                <span>DOCX</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>TXT</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-gray-900 border border-red-200 dark:border-gray-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-gray-300">{error}</p>
          </div>
        )}
      </div>

      {/* Text Input Card */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl text-gray-900 dark:text-white mb-6">
          Or Paste Text Directly
        </h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your document text here (minimum 100 characters)..."
          className="w-full h-64 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {text.length} characters
          </p>

          <button
            onClick={handleSubmit}
            disabled={text.trim().length < 100}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze Document
          </button>
        </div>
      </div>

      {/* Quick Demo Button */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 dark:text-white mb-1">
              Try a Demo Document
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Load sample text to see the AI in action
            </p>
          </div>
          <button
            onClick={() => {
              const demoText = `Artificial Intelligence (AI) has revolutionized the way we process and understand information in the digital age. Machine learning algorithms, particularly deep learning models, have demonstrated remarkable capabilities in natural language processing, computer vision, and predictive analytics. These technologies are now being applied across various domains, from healthcare diagnostics to financial forecasting.

The field of natural language processing has seen tremendous advances with the introduction of transformer-based models. These architectures have enabled machines to understand context, generate human-like text, and perform complex reasoning tasks. Applications such as document summarization, sentiment analysis, and question answering have become increasingly sophisticated and accurate.

In the realm of document analysis, AI systems can now automatically extract key information, identify important passages, and generate concise summaries. This capability is particularly valuable for researchers, students, and professionals who need to process large volumes of text efficiently. By leveraging techniques like TF-IDF for extractive summarization and neural networks for abstractive summarization, these systems can capture the essence of lengthy documents while preserving critical details.

The integration of AI into everyday tools continues to accelerate, making advanced capabilities accessible to users without technical expertise. As these technologies mature, we can expect even more innovative applications that enhance human productivity and decision-making. The future of AI-powered document analysis promises to transform how we interact with information, making knowledge more accessible and actionable than ever before.`;
              setText(demoText);
            }}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
          >
            Load Demo
          </button>
        </div>
      </div>
    </div>
  );
}