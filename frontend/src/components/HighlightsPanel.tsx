import React, { useState } from 'react';
import { Highlighter, Eye } from 'lucide-react';
import { Highlight } from '../types';

interface HighlightsPanelProps {
  highlights: Highlight[];
  originalText: string;
}

export function HighlightsPanel({ highlights, originalText }: HighlightsPanelProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  // Split original text into sentences for highlighting
  const sentences = originalText.match(/[^.!?]+[.!?]+/g) || [];
  const highlightIndices = new Set(highlights.map(h => h.index));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 dark:text-white mb-2">
            Key Highlights
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Most important sentences from the document
          </p>
        </div>

        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          {showOriginal ? 'Show List' : 'Show in Context'}
        </button>
      </div>

      {!showOriginal ? (
        /* List View */
        <div className="space-y-4">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-gray-900 dark:to-gray-900 border-l-4 border-yellow-500 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {highlight.sentence}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Importance Score: {(highlight.score * 100).toFixed(1)}%
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                        style={{ width: `${highlight.score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Context View */
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Highlighter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-gray-900 dark:text-white">Original Text with Highlights</h3>
          </div>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed space-y-2">
              {sentences.map((sentence, index) => {
                const isHighlighted = highlightIndices.has(index);
                return (
                  <span
                    key={index}
                    className={
                      isHighlighted
                        ? 'bg-yellow-200 dark:bg-yellow-700/50 px-1 rounded'
                        : ''
                    }
                  >
                    {sentence}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Highlights
          </div>
          <div className="text-2xl text-gray-900 dark:text-white">
            {highlights.length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Avg. Score
          </div>
          <div className="text-2xl text-gray-900 dark:text-white">
            {highlights.length > 0
              ? (
                  (highlights.reduce((sum, h) => sum + h.score, 0) /
                    highlights.length) *
                  100
                ).toFixed(1)
              : 0}
            %
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Coverage
          </div>
          <div className="text-2xl text-gray-900 dark:text-white">
            {sentences.length > 0
              ? ((highlights.length / sentences.length) * 100).toFixed(1)
              : 0}
            %
          </div>
        </div>
      </div>
    </div>
  );
}
