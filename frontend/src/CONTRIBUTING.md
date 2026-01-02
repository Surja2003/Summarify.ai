# Contributing to CortexCoders AI Summarizer

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 🤝 Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/cortexcoders-summarizer.git
cd cortexcoders-summarizer
```

### 3. Set Up Development Environment

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 📝 Development Guidelines

### Code Style

We use TypeScript and follow these conventions:

**Naming Conventions:**
```typescript
// Components: PascalCase
export function MyComponent() {}

// Functions: camelCase
function calculateScore() {}

// Constants: UPPER_SNAKE_CASE
const MAX_SENTENCES = 100;

// Interfaces: PascalCase with 'I' prefix optional
interface SummarizationResult {}
```

**File Structure:**
```
/components
  - ComponentName.tsx (one component per file)
/utils
  - utility-name.ts (grouped utilities)
/types.ts (shared types)
```

**TypeScript:**
```typescript
// Always use explicit types
function processText(text: string): Result {
  // ...
}

// Use interfaces for objects
interface Config {
  mode: 'fast' | 'balanced';
  domain: string;
}

// Avoid 'any' type
// Bad: function process(data: any)
// Good: function process(data: unknown)
```

### Component Guidelines

**Functional Components:**
```typescript
import React from 'react';

interface Props {
  data: Data;
  onUpdate: (value: string) => void;
}

export function MyComponent({ data, onUpdate }: Props) {
  return (
    <div className="...">
      {/* Component content */}
    </div>
  );
}
```

**Hooks:**
```typescript
// State at top
const [value, setValue] = useState<string>('');

// Effects after state
useEffect(() => {
  // Effect logic
}, [dependencies]);

// Event handlers
const handleClick = () => {
  // Handler logic
};
```

**Styling:**
```typescript
// Use Tailwind utility classes
<div className="flex items-center gap-4 p-4 bg-white rounded-lg">

// For dynamic styles, use template literals
<div className={`base-class ${isActive ? 'active-class' : 'inactive-class'}`}>

// For complex conditions, use classnames library or extract to function
const buttonClass = getButtonClass(variant, size, disabled);
```

### Commit Messages

Follow the Conventional Commits specification:

```bash
# Feature
git commit -m "feat: add keyword extraction feature"

# Bug fix
git commit -m "fix: resolve sentence scoring bug"

# Documentation
git commit -m "docs: update API documentation"

# Style changes
git commit -m "style: format code with prettier"

# Refactoring
git commit -m "refactor: simplify TF-IDF calculation"

# Tests
git commit -m "test: add unit tests for summarizer"

# Chores
git commit -m "chore: update dependencies"
```

### Pull Request Process

1. **Update Documentation**
   - Add/update comments in code
   - Update README if needed
   - Add entry to CHANGELOG

2. **Test Your Changes**
   - Manual testing checklist
   - Ensure no console errors
   - Test in multiple browsers

3. **Create Pull Request**
   - Use descriptive title
   - Fill out PR template
   - Link related issues

4. **Code Review**
   - Address reviewer feedback
   - Keep PR scope focused
   - Be responsive to comments

## 🐛 Bug Reports

### Before Submitting

- Check existing issues
- Verify it's reproducible
- Test in latest version

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [e.g. Chrome 120]
- OS: [e.g. Windows 11]
- Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want.

**Describe alternatives you've considered**
Alternative solutions or features.

**Additional context**
Mockups, examples, or references.
```

## 🧪 Testing

### Manual Testing Checklist

Before submitting PR, verify:

- [ ] Upload PDF file works
- [ ] Upload DOCX file works
- [ ] Upload TXT file works
- [ ] Text paste works
- [ ] All processing modes work
- [ ] All domain modes work
- [ ] Summary generation works
- [ ] Keyword extraction works
- [ ] Highlights display correctly
- [ ] Analytics show proper data
- [ ] Chat feature responds
- [ ] History saves/loads
- [ ] Settings persist
- [ ] Export functions work
- [ ] Dark mode works
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Performance acceptable

### Adding Tests (Future)

```typescript
// Unit tests (when test framework added)
describe('TFIDFVectorizer', () => {
  it('should tokenize text correctly', () => {
    const vectorizer = new TFIDFVectorizer();
    const result = vectorizer.tokenize('Hello World');
    expect(result).toEqual(['hello', 'world']);
  });
});
```

## 📚 Documentation

### Code Comments

```typescript
/**
 * Calculates TF-IDF scores for a document.
 * 
 * @param text - The document text to process
 * @param options - Configuration options
 * @returns Array of term-score pairs
 * 
 * @example
 * const scores = calculateTFIDF('sample text', { minScore: 0.1 });
 */
function calculateTFIDF(text: string, options: Options): Score[] {
  // Implementation
}
```

### README Updates

When adding features:
1. Update feature list
2. Add usage examples
3. Update screenshots
4. Update TOC if needed

## 🎨 Design Contributions

### UI/UX Improvements

- Follow existing design system
- Maintain consistency
- Consider accessibility
- Test on multiple devices

### Design Assets

- Use SVG for icons
- Optimize images
- Follow naming conventions
- Include source files

## 🔧 Advanced Contributions

### Adding New Algorithms

1. **Research**
   - Literature review
   - Benchmark comparisons
   - Complexity analysis

2. **Implementation**
   - Write clean, commented code
   - Add type definitions
   - Optimize for performance

3. **Documentation**
   - Algorithm explanation
   - Complexity analysis
   - Usage examples
   - Benchmark results

4. **Testing**
   - Unit tests
   - Integration tests
   - Performance tests
   - Accuracy validation

### Adding New Features

1. **Planning**
   - Create issue/proposal
   - Discuss with maintainers
   - Design API/interface

2. **Development**
   - Follow code guidelines
   - Write documentation
   - Add tests

3. **Review**
   - Self-review checklist
   - Request feedback early
   - Iterate based on input

## 🏆 Recognition

Contributors will be:
- Listed in README
- Mentioned in release notes
- Thanked in acknowledgments

## 📞 Getting Help

- **Questions:** Open a Discussion
- **Bugs:** Open an Issue
- **Chat:** Join our Discord (if available)
- **Email:** team@cortexcoders.dev

## 🎯 Priority Areas

We're especially looking for contributions in:

1. **Algorithm Improvements**
   - BERT integration
   - TextRank implementation
   - Multi-language support

2. **Performance**
   - Web Worker integration
   - Streaming processing
   - Memory optimization

3. **Features**
   - Multi-document summarization
   - Citation extraction
   - Custom training

4. **Testing**
   - Unit test framework
   - E2E tests
   - Benchmark suite

5. **Documentation**
   - Video tutorials
   - Blog posts
   - Use case studies

## 📋 Checklist for PRs

Before submitting:

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings/errors
- [ ] Tested manually
- [ ] Commit messages are clear
- [ ] PR description is complete
- [ ] Related issues linked

## 🎓 Learning Resources

New to contributing? Check these out:

- [First Contributions](https://github.com/firstcontributions/first-contributions)
- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to CortexCoders AI Summarizer! 🎉**

Questions? Feel free to reach out to the maintainers.
