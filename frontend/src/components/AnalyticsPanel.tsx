import React from 'react';
import { BarChart3, PieChart, Clock, Zap } from 'lucide-react';
import { SummarizationResult } from '../types';

interface AnalyticsPanelProps {
  result: SummarizationResult;
}

export function AnalyticsPanel({ result }: AnalyticsPanelProps) {
  // Prepare data for sentence scores chart
  const topSentences = [...result.sentenceScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const maxScore = topSentences[0]?.score || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed analysis metrics and visualizations
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-900 rounded-xl p-4 border border-blue-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-600 dark:text-gray-300" />
            <span className="text-sm text-blue-700 dark:text-gray-300">
              Compression
            </span>
          </div>
          <div className="text-3xl text-blue-900 dark:text-blue-300">
            {result.metrics.compressionRatio}%
          </div>
          <p className="text-xs text-blue-600 dark:text-gray-300 mt-1">
            Original to summary ratio
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-900 rounded-xl p-4 border border-purple-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-gray-400" />
            <span className="text-sm text-purple-700 dark:text-gray-400">
              Sentences
            </span>
          </div>
          <div className="text-3xl text-purple-900 dark:text-gray-300">
            {result.metrics.originalSentences}
          </div>
          <p className="text-xs text-purple-600 dark:text-gray-400 mt-1">
            In original document
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-900 dark:to-gray-900 rounded-xl p-4 border border-pink-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            <span className="text-sm text-pink-700 dark:text-pink-400">
              Summary
            </span>
          </div>
          <div className="text-3xl text-pink-900 dark:text-pink-300">
            {result.metrics.summarySentences}
          </div>
          <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
            Sentences extracted
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-900 rounded-xl p-4 border border-green-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-600 dark:text-gray-300" />
            <span className="text-sm text-green-700 dark:text-gray-300">
              Processing
            </span>
          </div>
          <div className="text-3xl text-green-900 dark:text-green-300">
            {result.metrics.processingTime}
          </div>
          <p className="text-xs text-green-600 dark:text-gray-300 mt-1">
            Milliseconds
          </p>
        </div>
      </div>

      {/* Top Sentence Scores Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-gray-900 dark:text-white">
            Top 10 Sentence Importance Scores
          </h3>
        </div>

        <div className="space-y-3">
          {topSentences.map((sentence, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Sentence {sentence.index + 1}
                </span>
                <span className="text-gray-900 dark:text-white">
                  {(sentence.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:bg-gray-800 transition-all"
                  style={{ width: `${(sentence.score / maxScore) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1">
                {sentence.sentence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-gray-900 dark:text-white">
            Score Distribution
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { range: '0-25%', color: 'from-red-400 to-red-500' },
            { range: '25-50%', color: 'from-yellow-400 to-yellow-500' },
            { range: '50-75%', color: 'from-blue-400 to-blue-500' },
            { range: '75-100%', color: 'from-green-400 to-green-500' }
          ].map((bucket, index) => {
            const count = result.sentenceScores.filter(s => {
              const percent = s.score * 100;
              return percent >= index * 25 && percent < (index + 1) * 25;
            }).length;

            return (
              <div
                key={index}
                className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br ${bucket.color} flex items-center justify-center text-white text-xl`}
                >
                  {count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {bucket.range}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Processing Details */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-gray-900 dark:text-white mb-4">
          Processing Configuration
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Speed Mode
            </div>
            <div className="px-3 py-2 bg-blue-50 dark:bg-gray-900 text-blue-700 dark:text-gray-300 rounded-lg inline-block">
              {result.settings.speedMode}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Domain
            </div>
            <div className="px-3 py-2 bg-purple-50 dark:bg-gray-900 text-purple-700 dark:text-gray-400 rounded-lg inline-block">
              {result.settings.domain}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Abstractive Mode
            </div>
            <div
              className={`px-3 py-2 rounded-lg inline-block ${
                result.settings.useAbstractive
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-gray-300'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400'
              }`}
            >
              {result.settings.useAbstractive ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Processed At
            </div>
            <div className="text-gray-900 dark:text-white text-sm">
              {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
