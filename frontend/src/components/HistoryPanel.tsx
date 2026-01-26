import React from 'react';
import { Clock, FileText, TrendingDown, Settings } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export function HistoryPanel({ history, onSelect }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-12 border border-gray-200 dark:border-gray-800 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-gray-400 dark:text-gray-400" />
          </div>
          <h2 className="text-2xl text-gray-900 dark:text-white mb-2">
            No History Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your summarization history will appear here after you process documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl text-gray-900 dark:text-white mb-2">
          Processing History
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          View and restore previous document analyses
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Total Processed: <strong className="text-gray-900 dark:text-white">{history.length}</strong>
          </span>
        </div>
      </div>

      {/* History Items */}
      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.fileName}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      {item.compressionRatio}% compression
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="px-3 py-1 text-xs bg-blue-100 dark:bg-gray-900 text-blue-700 dark:text-gray-300 rounded-lg">
                  {item.settings.speedMode}
                </span>
                <span className="px-3 py-1 text-xs bg-purple-100 dark:bg-gray-900 text-purple-700 dark:text-gray-400 rounded-lg">
                  {item.settings.domain}
                </span>
              </div>
            </div>

            {/* Summary Preview */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                {item.summary}
              </p>
            </div>

            {/* Settings */}
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Settings className="w-3 h-3" />
              <span>
                Abstractive: {item.settings.useAbstractive ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
