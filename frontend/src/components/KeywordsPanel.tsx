import React from 'react';
import { Tag, TrendingUp } from 'lucide-react';
import { Keyword } from '../types';

interface KeywordsPanelProps {
  keywords: Keyword[];
}

export function KeywordsPanel({ keywords }: KeywordsPanelProps) {
  // Sort keywords by score
  const sortedKeywords = [...keywords].sort((a, b) => b.score - a.score);
  const maxScore = sortedKeywords[0]?.score || 1;

  const getRatio = (score: number) => {
    if (!maxScore) return 0;
    const ratio = score / maxScore;
    return Math.max(0, Math.min(1, ratio));
  };

  const getBarClass = (score: number) => {
    const pctBucket = Math.round(getRatio(score) * 10) * 10; // 0..100 step 10
    return `kw-bar-${pctBucket}`;
  };

  const getTagSizeClass = (score: number) => {
    const bucket = Math.max(1, Math.min(6, Math.ceil(getRatio(score) * 6)));
    return `kw-tag-size-${bucket}`;
  };

  const getTagOpacityClass = (score: number) => {
    const bucket = Math.max(1, Math.min(5, Math.ceil(getRatio(score) * 5)));
    return `kw-tag-opacity-${bucket}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-gray-900 dark:text-white mb-2">
          Extracted Keywords
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Key terms and phrases identified in the document
        </p>
      </div>

      {/* Top Keywords */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sortedKeywords.slice(0, 6).map((keyword, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 rounded-xl p-4 border border-blue-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 text-white flex items-center justify-center text-sm">
                {index + 1}
              </div>
              <span className="text-gray-900 dark:text-white truncate">
                {keyword.word}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-900 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 ${getBarClass(keyword.score)}`}
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {keyword.score.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* All Keywords List */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-gray-900 dark:text-white">All Keywords</h3>
        </div>

        <div className="space-y-3">
          {sortedKeywords.map((keyword, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
                  #{index + 1}
                </span>
                <span className="text-gray-900 dark:text-white">
                  {keyword.word}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 ${getBarClass(keyword.score)}`}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {keyword.score.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-gray-900 dark:text-white">Tag Cloud</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {sortedKeywords.map((keyword, index) => {
            const size = 0.75 + (keyword.score / maxScore) * 1.25;
            const opacity = 0.6 + (keyword.score / maxScore) * 0.4;
            
            return (
              <span
                key={index}
                className={`px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-full transition-transform hover:scale-110 ${getTagSizeClass(keyword.score)} ${getTagOpacityClass(keyword.score)}`}
              >
                {keyword.word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Keywords
          </div>
          <div className="text-2xl text-gray-900 dark:text-white">
            {keywords.length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Highest Score
          </div>
          <div className="text-2xl text-gray-900 dark:text-white">
            {maxScore.toFixed(2)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Avg. Score
          </div>
          <div className="text-2xl text-gray-900 dark:text-white">
            {keywords.length > 0
              ? (
                  keywords.reduce((sum, k) => sum + k.score, 0) /
                  keywords.length
                ).toFixed(2)
              : 0}
          </div>
        </div>
      </div>
    </div>
  );
}
