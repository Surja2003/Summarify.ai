import React from 'react';
import { Upload, History, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileSidebarProps {
  activeView: 'upload' | 'history';
  onViewChange: (view: 'upload' | 'history') => void;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export function MobileSidebar({ activeView, onViewChange, isOpen, onClose, darkMode }: MobileSidebarProps) {
  const menuItems = [
    { id: 'upload' as const, icon: Upload, label: 'Upload' },
    { id: 'history' as const, icon: History, label: 'History' }
  ];

  const handleNavClick = (view: 'upload' | 'history') => {
    onViewChange(view);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-white/95 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-50 lg:hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-lg text-gray-900 dark:text-white">
                    Summarify<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 dark:text-gray-400 dark:bg-transparent">.ai</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Document AI</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                v1.0.0 • AI Summarizer
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
