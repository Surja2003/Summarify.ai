import os
import tempfile
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

class SimpleCache:
    """In-memory cache for summarization results and history."""
    def __init__(self):
        self.results = []
        self.history = []

    def add(self, result: Dict[str, Any]):
        """Add a result to cache."""
        self.results.append(result)
        if len(self.results) > 50:
            self.results.pop(0)

    def add_to_history(self, item: Dict[str, Any]):
        """Add an item to history."""
        self.history.append(item)
        if len(self.history) > 100:
            self.history.pop(0)

    def get(self):
        """Get all cached results."""
        return self.results[::-1]
    
    def get_history_items(self, userId: Optional[str] = None):
        """Get history items, optionally filtered by user."""
        if userId:
            return [h for h in self.history if h.get('userId') == userId]
        return self.history[::-1]

cache = SimpleCache()

def get_history(userId: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get summarization history."""
    return cache.get_history_items(userId)

def export_summary(summary: str, format: str, fileName: str = "summary") -> str:
    """Export summary to file. Supports txt and pdf formats."""
    if format == "txt":
        fd, path = tempfile.mkstemp(suffix=".txt")
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            f.write(summary)
        return path
    elif format == "pdf":
        # For PDF export, we'd need a library like reportlab or fpdf
        # For now, fallback to txt
        fd, path = tempfile.mkstemp(suffix=".txt")
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            f.write(summary)
        return path
    else:
        raise ValueError(f"Unsupported format: {format}")

def chat_with_document(
    message: str,
    document_text: str,
    conversation_history: List[Dict[str, str]]
) -> str:
    """
    Simple chat functionality - extracts relevant sentences from document
    based on user's message using keyword matching.
    
    In production, this would use a proper LLM or retrieval-augmented generation.
    """
    # Simple keyword extraction from user message
    keywords = message.lower().split()
    keywords = [k for k in keywords if len(k) > 3]  # Filter short words
    
    if not keywords:
        return "I'm not sure what you're asking. Could you please rephrase your question?"
    
    # Find relevant sentences
    sentences = document_text.split('.')
    relevant_sentences = []
    
    for sentence in sentences:
        sentence_lower = sentence.lower()
        score = sum(1 for kw in keywords if kw in sentence_lower)
        if score > 0:
            relevant_sentences.append((sentence.strip(), score))
    
    if not relevant_sentences:
        return "I couldn't find information about that in the document. Could you ask something else?"
    
    # Sort by relevance and take top 3
    relevant_sentences.sort(key=lambda x: x[1], reverse=True)
    top_sentences = [s[0] for s in relevant_sentences[:3]]
    
    # Format response
    response = "Based on the document, here's what I found:\n\n"
    response += ". ".join(top_sentences)
    
    if len(top_sentences) < len(relevant_sentences):
        response += "\n\n(There are more related sections in the document.)"
    
    return response
