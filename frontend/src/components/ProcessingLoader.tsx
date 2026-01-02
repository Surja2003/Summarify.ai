import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ProcessingLoaderProps {
  step: number;
}

export function ProcessingLoader({ step }: ProcessingLoaderProps) {
  const steps = [
    'Parsing document...',
    'Normalizing text...',
    'Extracting features...',
    'Ranking sentences...',
    'Generating summary...',
    'Highlighting key sections...',
    'Extracting keywords...',
    'Complete!'
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 mb-4">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl text-gray-900 dark:text-white mb-2">
            Processing Your Document
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we analyze the content...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 bg-gray-200 dark:bg-gray-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 transition-all duration-300 ease-out"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            {Math.round(((step + 1) / steps.length) * 100)}% Complete
          </p>
        </div>

        {/* Step Indicators */}
        <div className="space-y-3">
          {steps.map((stepText, index) => {
            const isComplete = index < step;
            const isCurrent = index === step;
            const isPending = index > step;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-gray-900'
                    : isComplete
                    ? 'bg-green-50 dark:bg-gray-900'
                    : 'bg-gray-50 dark:bg-gray-900/50'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    isComplete
                      ? 'bg-green-500'
                      : isCurrent
                      ? 'bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <span className="text-xs text-white">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`${
                    isComplete
                      ? 'text-green-700 dark:text-gray-300'
                      : isCurrent
                      ? 'text-blue-700 dark:text-gray-300'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}
                >
                  {stepText}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
