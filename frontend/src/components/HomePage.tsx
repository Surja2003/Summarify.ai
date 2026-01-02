import React from 'react';
import { Sparkles, Zap, Shield, Brain, FileText, BarChart3, MessageSquare, ArrowRight, Check, Moon, Sun, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';

interface HomePageProps {
  onGetStarted: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export function HomePage({ onGetStarted, darkMode, onToggleTheme }: HomePageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Home', id: 'hero' },
    { label: 'Features', id: 'features' },
    { label: 'Processing Modes', id: 'modes' },
    { label: 'How It Works', id: 'how-it-works' }
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced NLP algorithms combine extractive and abstractive summarization for optimal results'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process documents in seconds with our optimized TF-IDF and sentence ranking algorithms'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'All processing happens client-side in your browser. Your documents never leave your device'
    },
    {
      icon: FileText,
      title: 'Multi-Format Support',
      description: 'Upload PDF, DOCX, or TXT files, or paste text directly for instant analysis'
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Get comprehensive metrics, keyword extraction, and document insights'
    },
    {
      icon: MessageSquare,
      title: 'Interactive Chat',
      description: 'Ask questions about your documents and get intelligent AI-powered responses'
    }
  ];

  const modes = [
    { name: 'Fast', description: 'Quick summaries for rapid insights' },
    { name: 'Balanced', description: 'Optimal quality and speed' },
    { name: 'Thorough', description: 'Comprehensive analysis' }
  ];

  const domains = [
    'General',
    'Academic',
    'Legal',
    'Journalistic'
  ];

  return (
    <div className="min-h-screen overflow-auto">
      {/* Sticky Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-gray-900 dark:text-white">
                Summarify<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800">.ai</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={onGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Get Started
              </button>
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 pb-4 space-y-2"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  onGetStarted();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-lg hover:shadow-lg transition-all text-center"
              >
                Get Started
              </button>
            </motion.div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <div id="hero" className="relative min-h-screen flex items-center justify-center px-6 py-20 pt-32">{/* Added pt-32 for header spacing */}
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo/Brand */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                <Sparkles className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl text-gray-900 dark:text-white">
                Summarify<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800">.ai</span>
              </h1>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-6"
            >
              Transform Documents into Insights
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
            >
              Powered by advanced AI and NLP algorithms, Summarify.ai extracts key insights, 
              highlights important sections, and generates intelligent summaries from your documents 
              in seconds—all while keeping your data private.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white/80 dark:bg-gray-900 backdrop-blur-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl hover:shadow-lg transition-all text-lg"
              >
                Learn More
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              {[
                { label: 'Processing Speed', value: '< 3 sec' },
                { label: 'Compression Ratio', value: 'Up to 70%' },
                { label: 'Privacy Score', value: '100%' }
              ].map((stat, index) => (
                <div key={index} className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Features Section */}
      <div id="features" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to understand and analyze documents efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modes Section */}
      <div id="modes" className="px-6 py-20 bg-white/30 dark:bg-black/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">
              Flexible Processing Modes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose the mode that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {modes.map((mode, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-800 text-center"
              >
                <div className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 mb-2">
                  {mode.name}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {mode.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl text-gray-900 dark:text-white mb-4 text-center">
              Specialized Domain Support
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {domains.map((domain, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
                >
                  {domain}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get insights from your documents in three simple steps
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Upload or Paste',
                description: 'Upload your PDF, DOCX, or TXT file, or paste text directly into the editor'
              },
              {
                step: '2',
                title: 'AI Processing',
                description: 'Our advanced algorithms analyze your document using hybrid NLP techniques'
              },
              {
                step: '3',
                title: 'Get Insights',
                description: 'View summaries, highlights, keywords, analytics, and chat with your document'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6 items-start bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-white text-xl">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl mb-4">
                Ready to Transform Your Documents?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Start analyzing documents instantly. No sign-up required.
              </p>
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-2xl transition-all text-lg inline-flex items-center gap-2"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-200 dark:border-gray-800 bg-white/30 dark:bg-black/30">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 dark:bg-gray-800 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl text-gray-900 dark:text-white">
                  Summarify<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800">.ai</span>
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Transform your documents into actionable insights with AI-powered summarization. Fast, secure, and completely private.
              </p>
              <div className="flex gap-3">
                {/* Social Media Icons */}
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 flex items-center justify-center transition-all group"
                  aria-label="Twitter"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 flex items-center justify-center transition-all group"
                  aria-label="GitHub"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 flex items-center justify-center transition-all group"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-gray-900 dark:text-white mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={onGetStarted}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm"
                  >
                    Get Started
                  </button>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-gray-900 dark:text-white mb-4">Features</h3>
              <ul className="space-y-3">
                <li className="text-gray-600 dark:text-gray-400 text-sm">AI Summarization</li>
                <li className="text-gray-600 dark:text-gray-400 text-sm">Keyword Extraction</li>
                <li className="text-gray-600 dark:text-gray-400 text-sm">Document Highlights</li>
                <li className="text-gray-600 dark:text-gray-400 text-sm">Interactive Chat</li>
                <li className="text-gray-600 dark:text-gray-400 text-sm">Analytics Dashboard</li>
              </ul>
            </div>

            {/* Support & Info */}
            <div>
              <h3 className="text-gray-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>100% Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Lightning Fast</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>AI-Powered</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-500 text-center">
                © 2025 Summarify.ai. All rights reserved. Processing happens locally in your browser.
              </div>
            </div>
          </div>

          {/* Additional Info Banner */}
          <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 dark:border-gray-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-gray-900 dark:text-white mb-1">Ready to get started?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No sign-up required. Start summarizing documents instantly.
                </p>
              </div>
              <button
                onClick={onGetStarted}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
              >
                Try It Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}