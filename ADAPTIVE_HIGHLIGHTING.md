# Adaptive Highlights & Keywords System

## Overview
The system now uses **quality-based thresholds** instead of fixed counts for highlights and keywords. This ensures the number adapts to the actual content importance in each document.

## How It Works

### Highlights (Key Sentences)
**Old Approach**: Fixed counts based on document size
- Small docs: 5 highlights
- Medium docs: 8-12 highlights  
- Large docs: 20 highlights max

**New Approach**: Quality-based percentile threshold
1. Calculate all sentence scores using TF-IDF + semantic embeddings
2. Compute mean and standard deviation of scores
3. Set threshold = mean + (0.5 × std_dev)
4. **Select ALL sentences above this threshold**
5. Apply safety bounds: min 3, max 50% of document

**Result**: Documents with many important sentences get more highlights automatically!

### Keywords
**Old Approach**: Fixed at 15-20 keywords per document

**New Approach**: Scales with document complexity and highlights
1. **Document Complexity**: 
   - Count unique words (4+ letters)
   - Scale: 0-1 based on uniqueness
   
2. **Base Calculation**:
   - 1 keyword per 3 sentences (min 8, max 50)
   - Scale by complexity: `baseKeywords × (0.7 + complexity × 0.6)`

3. **Adaptive to Highlights**:
   - Backend also considers: 1 keyword per 2 highlights
   - More highlights = more topics = more keywords

**Result**: Simple documents get 8-15 keywords, complex documents get 30-60 keywords!

## Example Scenarios

### Scenario 1: Focused Document
- 100 sentences with 3-4 key themes
- Score distribution: Most sentences low, 10-15 very high
- **Result**: 12-15 highlights (only the truly important ones)
- **Keywords**: 15-20 (focused on main themes)

### Scenario 2: Information-Dense Document
- 100 sentences with diverse, important content
- Score distribution: 40+ sentences above quality threshold
- **Result**: 40-50 highlights (captures comprehensive coverage)
- **Keywords**: 40-50 (represents topic diversity)

### Scenario 3: Short Document
- 10 sentences, all moderately important
- Score distribution: Narrow spread
- **Result**: 5-7 highlights (safety minimum: 3, respects quality)
- **Keywords**: 8-12 (minimum ensures useful output)

## Benefits

1. **Content-Aware**: Adapts to actual document characteristics
2. **No Information Loss**: Important content never excluded by arbitrary caps
3. **Efficient for Simple Docs**: Doesn't over-extract from focused content
4. **Scales Naturally**: Complex documents automatically get more coverage
5. **Statistical Rigor**: Uses mean/std_dev for objective thresholds

## Technical Details

### Frontend (TypeScript)
```typescript
// Quality threshold calculation
const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
const stdDev = Math.sqrt(
  allScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / allScores.length
);
const qualityThreshold = avgScore + (0.5 * stdDev);

// Dynamic keywords
const uniqueWords = new Set(text.toLowerCase().match(/\b\w{4,}\b/g) || []).size;
const documentComplexity = Math.min(1.0, uniqueWords / 1000);
const baseKeywords = Math.max(8, Math.min(50, Math.ceil(sentences.length / 3)));
const dynamicKeywordCount = Math.ceil(baseKeywords * (0.7 + documentComplexity * 0.6));
```

### Backend (Python)
```python
# Quality threshold with numpy
avg_score = np.mean(all_scores)
std_dev = np.std(all_scores)
quality_threshold = avg_score + (0.5 * std_dev)

# Keyword scaling
num_highlights = len(highlights)
unique_words = len(set(text.lower().split()))
document_complexity = min(1.0, unique_words / 1000)
base_keywords = max(5, num_highlights // 2)
dynamic_keyword_count = int(base_keywords * (1.0 + document_complexity * 0.8))
dynamic_keyword_count = max(8, min(60, dynamic_keyword_count))
```

## Testing Recommendations

Test with:
1. **Short memo** (1 page) → Expect 3-8 highlights, 8-12 keywords
2. **Research paper** (20 pages) → Expect 50-100+ highlights, 40-60 keywords
3. **News article** (focused) → Expect 10-15 highlights, 12-20 keywords
4. **Legal document** (dense) → Expect 60-150+ highlights, 50-60 keywords

The system will automatically adapt to each document's unique characteristics!
