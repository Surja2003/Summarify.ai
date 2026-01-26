import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any
import re
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

# Advanced NLP libraries
try:
    from sentence_transformers import SentenceTransformer
    from transformers import pipeline, AutoTokenizer, AutoModel
    from keybert import KeyBERT
    ADVANCED_MODE = True
except ImportError:
    ADVANCED_MODE = False
    print("Warning: Advanced libraries not installed. Using basic mode.")

# Initialize models globally for reuse (singleton pattern)
_embedding_model = None
_summarization_model = None
_keybert_model = None

def get_embedding_model():
    """
    Get or initialize the sentence embedding model.
    Uses all-MiniLM-L6-v2: Fast, accurate, 384-dimensional embeddings.
    """
    global _embedding_model
    if _embedding_model is None and ADVANCED_MODE:
        try:
            print("Loading sentence embedding model...")
            _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✓ Embedding model loaded")
        except Exception as e:
            print(f"Could not load embedding model: {e}")
    return _embedding_model

def get_summarization_model():
    """
    Get or initialize the abstractive summarization model.
    Uses BART: State-of-the-art seq2seq summarization.
    """
    global _summarization_model
    if _summarization_model is None and ADVANCED_MODE:
        try:
            print("Loading BART summarization model (this may take a moment)...")
            _summarization_model = pipeline(
                "summarization", 
                model="facebook/bart-large-cnn",
                device=-1  # CPU mode, use 0 for GPU
            )
            print("✓ BART model loaded")
        except Exception as e:
            print(f"Could not load summarization model: {e}")
    return _summarization_model

def get_keybert_model():
    """
    Get or initialize KeyBERT for advanced keyword extraction.
    Uses BERT embeddings for context-aware keywords.
    """
    global _keybert_model
    if _keybert_model is None and ADVANCED_MODE:
        try:
            print("Loading KeyBERT model...")
            _keybert_model = KeyBERT(model='all-MiniLM-L6-v2')
            print("✓ KeyBERT model loaded")
        except Exception as e:
            print(f"Could not load KeyBERT: {e}")
    return _keybert_model

def split_sentences(text: str) -> List[str]:
    """Split text into sentences."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip() and len(s.strip()) > 20]

def clean_extracted_text(text: str) -> str:
    """Remove common PDF extraction artifacts (headers/footers/boilerplate) and collapse duplicates."""
    if not text:
        return ""

    normalized = (
        text.replace("\u00a0", " ")
        .replace("\r\n", "\n")
        .replace("\t", " ")
    )

    # Scrub common academic PDF boilerplate even when it isn't separated by newlines
    # (some extractors join a whole page into a single space-separated line).
    scrubbed = normalized
    scrubbed = re.sub(r"https?://doi\.org/\S+", " ", scrubbed, flags=re.IGNORECASE)
    scrubbed = re.sub(
        r"\b10\.\d{4,9}/[-._;()/:A-Z0-9]+\b",
        " ",
        scrubbed,
        flags=re.IGNORECASE,
    )
    scrubbed = re.sub(
        r"\b\d{4}/s\d{5}-\d{3}-\d{5}-\d\b",
        " ",
        scrubbed,
        flags=re.IGNORECASE,
    )
    scrubbed = re.sub(
        r"\bs\d{5}-\d{3}-\d{5}-\d\b",
        " ",
        scrubbed,
        flags=re.IGNORECASE,
    )
    scrubbed = re.sub(
        r"\bwww\.nature\.com/scientificreports\b",
        " ",
        scrubbed,
        flags=re.IGNORECASE,
    )
    scrubbed = re.sub(r"\bscientific\s+reports\b", " ", scrubbed, flags=re.IGNORECASE)
    scrubbed = re.sub(r"\bwww\.(?=\s|$)", " ", scrubbed, flags=re.IGNORECASE)

    raw_lines = [ln.strip() for ln in scrubbed.split("\n") if ln.strip()]

    def fingerprint(line: str) -> str:
        s = line.lower()
        s = re.sub(r"https?://\S+", " ", s)
        s = re.sub(r"\b\d+\b", " ", s)
        s = re.sub(r"[^a-z0-9\s]", " ", s)
        s = re.sub(r"\s+", " ", s).strip()
        return s

    keys = [fingerprint(ln) for ln in raw_lines]
    counts = Counter(k for k in keys if k)

    def is_likely_header_footer(line: str, key: str, count: int) -> bool:
        lower = line.lower()

        # Very frequently repeated short-ish lines are almost always headers/footers.
        if count >= 3 and len(key) < 90:
            return True

        boilerplate_hit = re.search(
            r"\bhttps?://doi\b|\bdoi\b|discover oncology|springer|open access|copyright|©|received:|accepted:|issn\b|\bvol\.?\b|\btable\s+\d+\b|\bfigure\s+\d+\b",
            lower,
        )
        if boilerplate_hit and (count >= 2 or len(key) < 140):
            return True

        # Page-number-like / digit-heavy artifacts.
        compact = re.sub(r"\s+", "", line)
        if re.fullmatch(r"\(?\d{8,}\)?", compact):
            return True

        # Lines that are mostly digits/punct after cleaning.
        alpha_count = len(re.findall(r"[a-z]", lower))
        if alpha_count == 0 and len(line) < 80:
            return True

        return False

    cleaned_lines: List[str] = []
    last_key = ""
    for line, key in zip(raw_lines, keys):
        if not key:
            continue
        count = counts.get(key, 0)
        if is_likely_header_footer(line, key, count):
            continue
        if key == last_key:
            continue
        cleaned_lines.append(line)
        last_key = key

    cleaned = "\n".join(cleaned_lines)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    cleaned = re.sub(r"[ ]{2,}", " ", cleaned)
    return cleaned.strip()

def extract_keywords(text: str, top_n: int = 20) -> List[Dict[str, Any]]:
    """
    Extract keywords using hybrid approach:
    1. KeyBERT (BERT-based, context-aware) - PRIMARY
    2. TF-IDF + frequency - FALLBACK
    """
    # Try KeyBERT first for best semantic understanding
    if ADVANCED_MODE:
        keybert = get_keybert_model()
        if keybert is not None:
            try:
                # Extract with diversity for comprehensive coverage
                keywords_raw = keybert.extract_keywords(
                    text,
                    keyphrase_ngram_range=(1, 2),  # Single + bigrams
                    stop_words='english',
                    use_maxsum=True,  # Maximal diversity
                    nr_candidates=50,
                    top_n=top_n
                )
                # Format as list of dicts
                return [{"word": kw[0], "score": float(kw[1])} for kw in keywords_raw]
            except Exception as e:
                print(f"KeyBERT failed, using TF-IDF fallback: {e}")
    
    # Fallback to TF-IDF approach
    try:
        # Split into sentences for better TF-IDF
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
        
        if not sentences:
            return []
        
        # Use TF-IDF on sentences
        tfidf = TfidfVectorizer(
            stop_words='english',
            max_features=top_n * 3,  # Get more candidates
            min_df=1,
            ngram_range=(1, 2)  # Include 2-word phrases
        )
        X = tfidf.fit_transform(sentences)
        feature_names = tfidf.get_feature_names_out()
        
        # Aggregate scores across all sentences
        word_scores = {}
        for sent_idx in range(X.shape[0]):
            for word_idx in X[sent_idx].nonzero()[1]:
                word = feature_names[word_idx]
                score = X[sent_idx, word_idx]
                word_scores[word] = word_scores.get(word, 0) + score
        
        # Calculate word frequencies for boosting
        words = text.lower().split()
        word_freq = {}
        for word in words:
            if len(word) > 3:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Combine TF-IDF with frequency
        keywords = []
        for word, tfidf_score in word_scores.items():
            freq_score = word_freq.get(word, 0) / len(words) if words else 0
            final_score = (tfidf_score * 0.7) + (freq_score * 0.3)
            if len(word) > 3:  # Filter short words
                keywords.append({"word": word, "score": float(final_score)})
        
        return sorted(keywords, key=lambda x: x['score'], reverse=True)[:top_n]
    except Exception as e:
        print(f"Keyword extraction error: {e}")
        return []

def compute_sentence_scores_advanced(sentences: List[str], domain: str) -> List[Dict[str, Any]]:
    """
    Advanced sentence scoring using semantic embeddings + TF-IDF.
    This provides GPT-like understanding of content importance.
    """
    if not sentences:
        return []
    
    embedding_model = get_embedding_model()
    
    try:
        # TF-IDF scores
        vectorizer = TfidfVectorizer(stop_words='english', max_features=500)
        tfidf_matrix = vectorizer.fit_transform(sentences)
        
        # Semantic embeddings for better understanding
        semantic_scores = None
        if embedding_model and ADVANCED_MODE:
            try:
                embeddings = embedding_model.encode(sentences)
                # Document centroid (average of all sentence embeddings)
                doc_centroid = np.mean(embeddings, axis=0)
                # Similarity to centroid = importance
                semantic_scores = [
                    float(cosine_similarity([emb], [doc_centroid])[0][0])
                    for emb in embeddings
                ]
            except:
                pass
        
        sentence_scores = []
        for i, sentence in enumerate(sentences):
            # Base TF-IDF score
            tfidf_score = float(np.sum(tfidf_matrix[i].toarray()))
            
            # Semantic score (if available)
            semantic_score = semantic_scores[i] if semantic_scores else 0.5
            
            # Combine scores: 60% TF-IDF, 40% semantic
            if semantic_scores:
                score = (tfidf_score * 0.6) + (semantic_score * 0.4)
            else:
                score = tfidf_score
            
            # Position importance (first and last sentences often important)
            if i == 0:
                score *= 1.2
            elif i < 3:
                score *= 1.1
            if i == len(sentences) - 1:
                score *= 1.1
            
            # Domain-specific weighting
            lower_sent = sentence.lower()
            if domain == 'academic':
                academic_keywords = ['research', 'study', 'analysis', 'results', 'conclusion', 
                                   'findings', 'methodology', 'hypothesis', 'data', 'significant']
                if any(kw in lower_sent for kw in academic_keywords):
                    score *= 1.3
            elif domain == 'legal':
                legal_keywords = ['shall', 'hereby', 'pursuant', 'agreement', 'party', 'rights',
                                'contract', 'liability', 'obligation', 'terms']
                if any(kw in lower_sent for kw in legal_keywords):
                    score *= 1.3
            elif domain == 'journalistic':
                if i < 3:
                    score *= 1.4
                journalistic_keywords = ['said', 'according', 'reported', 'announced', 'stated']
                if any(kw in lower_sent for kw in journalistic_keywords):
                    score *= 1.1
            
            # Length normalization (prefer medium-length sentences)
            words = len(sentence.split())
            if 10 <= words <= 30:
                score *= 1.1
            elif words < 5 or words > 50:
                score *= 0.8
            
            # Numeric data bonus (statistics, dates often important)
            if re.search(r'\d+', sentence):
                score *= 1.05
            
            sentence_scores.append({
                "sentence": sentence,
                "score": float(score),
                "index": i
            })
        
        return sentence_scores
    except:
        return [{"sentence": s, "score": 1.0, "index": i} for i, s in enumerate(sentences)]

def maximal_marginal_relevance(
    sentences: List[str],
    sentence_scores: List[Dict[str, Any]],
    num_sentences: int,
    lambda_param: float = 0.6
) -> List[int]:
    """
    MMR: Maximum coverage with diversity - no information loss.
    """
    embedding_model = get_embedding_model()
    
    if not embedding_model or not ADVANCED_MODE:
        sorted_scores = sorted(sentence_scores, key=lambda x: x['score'], reverse=True)
        return sorted([s['index'] for s in sorted_scores[:num_sentences]])
    
    try:
        embeddings = embedding_model.encode(sentences)
        sorted_scores = sorted(sentence_scores, key=lambda x: x['score'], reverse=True)
        
        selected_indices = [sorted_scores[0]['index']]
        selected_embeddings = [embeddings[sorted_scores[0]['index']]]
        remaining = [s for s in sorted_scores[1:]]
        
        while len(selected_indices) < num_sentences and remaining:
            best_score = -float('inf')
            best_idx = None
            best_item = None
            
            for item in remaining:
                idx = item['index']
                relevance = item['score']
                
                similarities = [
                    float(cosine_similarity([embeddings[idx]], [sel_emb])[0][0])
                    for sel_emb in selected_embeddings
                ]
                max_similarity = max(similarities) if similarities else 0
                mmr_score = lambda_param * relevance - (1 - lambda_param) * max_similarity
                
                if mmr_score > best_score:
                    best_score = mmr_score
                    best_idx = idx
                    best_item = item
            
            if best_idx is not None:
                selected_indices.append(best_idx)
                selected_embeddings.append(embeddings[best_idx])
                remaining.remove(best_item)
            else:
                break
        
        return sorted(selected_indices)
    except Exception as e:
        print(f"MMR failed: {e}")
        sorted_scores = sorted(sentence_scores, key=lambda x: x['score'], reverse=True)
        return sorted([s['index'] for s in sorted_scores[:num_sentences]])

def summarize_document(
    text: str,
    speed_mode: str = "balanced",
    domain: str = "general",
    use_abstractive: bool = False
) -> Dict[str, Any]:
    """
    Perform extractive (and optionally abstractive) summarization.
    Returns a result compatible with frontend SummarizationResult type.
    """
    cleaned_text = clean_extracted_text(text)

    # 1. Split into sentences
    sentences = split_sentences(cleaned_text)
    n_sent = len(sentences)
    
    if n_sent == 0:
        return {
            "summary": "No valid sentences found.",
            "highlights": [],
            "keywords": [],
            "sentenceScores": [],
            "metrics": {
                "compressionRatio": 0,
                "originalSentences": 0,
                "summarySentences": 0,
                "processingTime": 0
            }
        }
    
    # 2. MAXIMUM COVERAGE - ensure no information loss
    if speed_mode == "fast":
        max_sents = max(5, min(12, int(n_sent * 0.35)))
    elif speed_mode == "thorough":
        max_sents = max(10, min(50, int(n_sent * 0.70)))  # 70% coverage!
    else:  # balanced
        max_sents = max(8, min(25, int(n_sent * 0.50)))  # 50% coverage
    
    max_sents = min(max_sents, n_sent)
    
    # 3. Compute ADVANCED sentence scores with semantic understanding
    sentence_scores = compute_sentence_scores_advanced(sentences, domain)
    
    # 4. Use MMR for diverse, comprehensive coverage
    top_indices = maximal_marginal_relevance(sentences, sentence_scores, max_sents, lambda_param=0.6)
    summary_sentences = [sentences[i] for i in top_indices]
    
    # 5. Build summary text
    summary = " ".join(summary_sentences)
    
    # 6. Advanced abstractive refinement with pre-trained transformer
    if use_abstractive and len(summary_sentences) > 3:
        try:
            summarizer_model = get_summarization_model()
            if summarizer_model:
                # Split into chunks if too long
                max_chunk_words = 800
                summary_words = summary.split()
                
                if len(summary_words) > max_chunk_words:
                    # Process in chunks
                    chunks = []
                    for i in range(0, len(summary_words), max_chunk_words):
                        chunk = " ".join(summary_words[i:i+max_chunk_words])
                        if len(chunk.split()) > 50:  # Only summarize substantial chunks
                            result = summarizer_model(chunk, max_length=200, min_length=50, do_sample=False)
                            chunks.append(result[0]['summary_text'])
                    summary = " ".join(chunks)
                else:
                    result = summarizer_model(summary, max_length=250, min_length=60, do_sample=False)
                    summary = result[0]['summary_text']
        except Exception as e:
            print(f"Abstractive summarization: {e}")
            pass
    
    # 7. Extract highlights - QUALITY-BASED THRESHOLD (not fixed count)
    # Select all sentences above a quality threshold based on score distribution
    sorted_scores = sorted(sentence_scores, key=lambda x: x['score'], reverse=True)
    
    # Calculate statistics for adaptive threshold
    all_scores = [s['score'] for s in sentence_scores]
    avg_score = np.mean(all_scores)
    std_dev = np.std(all_scores)
    
    # Dynamic threshold: mean + 0.5 * std_dev (captures top ~30-40%)
    # This adapts to document - more highlights for documents with many important sentences
    quality_threshold = avg_score + (0.5 * std_dev)
    
    # Select all above threshold
    quality_highlights = [s for s in sorted_scores if s['score'] >= quality_threshold]
    
    # Ensure reasonable bounds: min 3, max 50% of document
    min_highlights = min(3, n_sent)
    max_highlights = max(5, int(n_sent * 0.5))
    
    if len(quality_highlights) < min_highlights:
        quality_highlights = sorted_scores[:min_highlights]
    elif len(quality_highlights) > max_highlights:
        quality_highlights = sorted_scores[:max_highlights]
    
    highlights = [
        {
            "sentence": s['sentence'],
            "score": s['score'],
            "index": s['index']
        }
        for s in quality_highlights
    ]
    
    # 8. Extract keywords - scale with highlights and document complexity
    # More highlights = more topics covered = more keywords needed
    num_highlights = len(highlights)
    unique_words = len(set(cleaned_text.lower().split()))
    document_complexity = min(1.0, unique_words / 1000)  # 0-1 scale
    
    # Base: 1 keyword per 2 highlights, scaled by complexity
    base_keywords = max(5, num_highlights // 2)
    dynamic_keyword_count = int(base_keywords * (1.0 + document_complexity * 0.8))
    dynamic_keyword_count = max(8, min(60, dynamic_keyword_count))  # Bounds: 8-60
    
    keywords = extract_keywords(cleaned_text, top_n=dynamic_keyword_count)
    
    # 9. Calculate metrics
    orig_words = len(cleaned_text.split())
    summary_words = len(summary.split())
    compression_ratio = int((1 - summary_words / orig_words) * 100) if orig_words > 0 else 0
    
    metrics = {
        "compressionRatio": compression_ratio,
        "originalSentences": n_sent,
        "summarySentences": len(summary_sentences),
        "processingTime": 0  # Will be set by caller
    }
    
    # 10. Return result matching frontend types
    result = {
        "summary": summary,
        "highlights": highlights,
        "keywords": keywords,
        "sentenceScores": sentence_scores,
        "metrics": metrics,
        "originalText": cleaned_text
    }
    
    return result
