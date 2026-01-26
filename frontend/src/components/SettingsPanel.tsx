import React from 'react';
import { Settings as SettingsType } from '../types';
import { Zap, Briefcase, BookOpen, Scale, Newspaper, Settings as SettingsIcon, Globe, Layers, Merge } from 'lucide-react';

interface SettingsPanelProps {
  settings: SettingsType;
  onUpdate: (settings: SettingsType) => void;
}

export function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-2xl text-gray-900 dark:text-white">
            Summarization Settings
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configure how documents are analyzed and summarized
        </p>
      </div>

      {/* Speed Mode */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl text-gray-900 dark:text-white">Speed Mode</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose the balance between processing speed and summary quality
        </p>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              id: 'fast',
              label: 'Fast',
              description: 'Quick processing, basic summary',
              icon: '⚡'
            },
            {
              id: 'balanced',
              label: 'Balanced',
              description: 'Good balance of speed and quality',
              icon: '⚖️'
            },
            {
              id: 'thorough',
              label: 'Thorough',
              description: 'Detailed analysis, best quality',
              icon: '🎯'
            }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() =>
                onUpdate({
                  ...settings,
                  speedMode: mode.id as 'fast' | 'balanced' | 'thorough'
                })
              }
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                settings.speedMode === mode.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-gray-800'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className="text-gray-900 dark:text-white mb-1">
                {mode.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {mode.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Domain Mode */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl text-gray-900 dark:text-white">Domain Mode</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Optimize summarization for specific document types
        </p>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              id: 'general',
              label: 'General',
              description: 'For general purpose documents',
              icon: BookOpen
            },
            {
              id: 'academic',
              label: 'Academic',
              description: 'Research papers and scholarly articles',
              icon: BookOpen
            },
            {
              id: 'legal',
              label: 'Legal',
              description: 'Contracts and legal documents',
              icon: Scale
            },
            {
              id: 'journalistic',
              label: 'Journalistic',
              description: 'News articles and reports',
              icon: Newspaper
            }
          ].map((domain) => {
            const Icon = domain.icon;
            return (
              <button
                key={domain.id}
                onClick={() =>
                  onUpdate({
                    ...settings,
                    domain: domain.id as 'general' | 'academic' | 'legal' | 'journalistic'
                  })
                }
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  settings.domain === domain.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" />
                <div className="text-gray-900 dark:text-white mb-1">
                  {domain.label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {domain.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Abstractive Mode */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl text-gray-900 dark:text-white mb-2">
              Abstractive Summarization
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enable AI-powered abstractive refinement for more natural summaries.
              This generates new sentences that capture the meaning rather than just
              extracting existing ones.
            </p>
          </div>

          {settings.useAbstractive ? (
            <button
              onClick={() => onUpdate({ ...settings, useAbstractive: false })}
              className="ml-4 relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800"
              role="switch"
              aria-checked="true"
              aria-label="Toggle abstractive summarization"
              title="Toggle abstractive summarization"
            >
              <span className="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-6" />
            </button>
          ) : (
            <button
              onClick={() => onUpdate({ ...settings, useAbstractive: true })}
              className="ml-4 relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-300 dark:bg-gray-600"
              role="switch"
              aria-checked="false"
              aria-label="Toggle abstractive summarization"
              title="Toggle abstractive summarization"
            >
              <span className="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
            </button>
          )}
        </div>

        {settings.useAbstractive && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-800 rounded-xl">
            <p className="text-sm text-blue-700 dark:text-gray-300">
              ✨ Abstractive mode enabled. Summaries will be more concise and natural-sounding,
              but may take slightly longer to process.
            </p>
          </div>
        )}
      </div>

      {/* Language Selection */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl text-gray-900 dark:text-white">Language</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select the language for document processing and summarization
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { code: 'en', label: 'English', flag: '🇬🇧' },
            { code: 'es', label: 'Spanish', flag: '🇪🇸' },
            { code: 'fr', label: 'French', flag: '🇫🇷' },
            { code: 'de', label: 'German', flag: '🇩🇪' },
            { code: 'it', label: 'Italian', flag: '🇮🇹' },
            { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
            { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
            { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
            { code: 'ko', label: 'Korean', flag: '🇰🇷' },
            { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
            { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
            { code: 'ru', label: 'Russian', flag: '🇷🇺' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => onUpdate({ ...settings, language: lang.code })}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                settings.language === lang.code
                  ? 'border-blue-500 bg-blue-50 dark:bg-gray-900'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-sm text-gray-900 dark:text-white">{lang.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Document Summary Mode */}
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl text-gray-900 dark:text-white">Multi-Document Summary Mode</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose how to handle multiple documents when summarizing
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onUpdate({ ...settings, summaryMode: 'merged' })}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              settings.summaryMode === 'merged'
                ? 'border-green-500 bg-green-50 dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Merge className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" />
            <div className="text-gray-900 dark:text-white mb-1">Merged</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Combine all documents into one comprehensive summary
            </div>
          </button>

          <button
            onClick={() => onUpdate({ ...settings, summaryMode: 'separate' })}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              settings.summaryMode === 'separate'
                ? 'border-green-500 bg-green-50 dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Layers className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" />
            <div className="text-gray-900 dark:text-white mb-1">Separate</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Get individual summaries for each document
            </div>
          </button>
        </div>
      </div>

      {/* Information */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 rounded-2xl p-6 border border-blue-200 dark:border-gray-800">
        <h3 className="text-gray-900 dark:text-white mb-3">
          💡 About These Settings
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Speed Mode</strong> controls the thoroughness of analysis. Fast mode
              samples the document, while Thorough mode analyzes every sentence.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Domain Mode</strong> adjusts keyword weights and sentence scoring
              based on document type for better results.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Abstractive Mode</strong> uses advanced AI to rewrite summaries
              for improved readability and coherence.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}