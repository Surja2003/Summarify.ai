import React from 'react';
import { Download, FileText, Copy, CheckCircle } from 'lucide-react';
import { SummarizationResult } from '../types';

interface SummaryPanelProps {
  result: SummarizationResult;
  onExport: (format: 'txt' | 'pdf') => void;
}

export function SummaryPanel({ result, onExport }: SummaryPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 dark:text-white mb-2">
            Document Summary
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{result.fileName}</span>
            <span>•</span>
            <span>{new Date(result.timestamp).toLocaleString()}</span>
            <span>•</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-gray-900 text-blue-700 dark:text-gray-300 rounded-lg">
              {result.settings.speedMode}
            </span>
            <span className="px-2 py-1 bg-purple-100 dark:bg-gray-900 text-purple-700 dark:text-gray-400 rounded-lg">
              {result.settings.domain}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="p-2 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <button
            onClick={() => onExport('txt')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Export TXT
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-900 rounded-xl p-4 border border-blue-200 dark:border-gray-800">
          <div className="text-sm text-blue-700 dark:text-gray-300 mb-1">
            Compression
          </div>
          <div className="text-2xl text-blue-900 dark:text-blue-300">
            {result.metrics.compressionRatio}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-900 rounded-xl p-4 border border-purple-200 dark:border-gray-800">
          <div className="text-sm text-purple-700 dark:text-gray-400 mb-1">
            Original
          </div>
          <div className="text-2xl text-purple-900 dark:text-gray-300">
            {result.metrics.originalSentences}
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-900 rounded-xl p-4 border border-pink-200 dark:border-gray-800">
          <div className="text-sm text-pink-700 dark:text-pink-400 mb-1">
            Summary
          </div>
          <div className="text-2xl text-pink-900 dark:text-pink-300">
            {result.metrics.summarySentences}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-900 rounded-xl p-4 border border-green-200 dark:border-gray-800">
          <div className="text-sm text-green-700 dark:text-gray-300 mb-1">
            Time
          </div>
          <div className="text-2xl text-green-900 dark:text-green-300">
            {result.metrics.processingTime}ms
          </div>
        </div>
      </div>

      {/* Summary Content */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-gray-900 dark:text-white">Generated Summary</h3>
        </div>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {result.summary}
          </div>
        </div>
      </div>

      {/* Abstractive Note */}
      {result.settings.useAbstractive && (
        <div className="bg-blue-50 dark:bg-gray-900 border border-blue-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-blue-700 dark:text-gray-300">
            <strong>Note:</strong> This summary uses both extractive and abstractive techniques
            to provide a comprehensive overview while maintaining the document's key points.
          </p>
        </div>
      )}
    </div>
  );
}
