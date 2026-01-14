import os
import tempfile
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import re
import httpx

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

    def extract_relevant_context(max_chars: int = 6000) -> str:
        keywords = [w for w in re.findall(r"[a-zA-Z0-9]+", (message or "").lower()) if len(w) > 3]
        if not document_text:
            return ""
        if not keywords:
            return document_text[:max_chars]

        # Split into rough sentences.
        sentences = re.split(r"(?<=[.!?])\s+", document_text.replace("\n", " "))
        sentences = [s.strip() for s in sentences if s and len(s.strip()) > 25]
        if not sentences:
            return document_text[:max_chars]

        scored: List[tuple[str, int]] = []
        for s in sentences:
            s_lower = s.lower()
            score = sum(1 for kw in keywords if kw in s_lower)
            if score:
                scored.append((s, score))

        if not scored:
            return document_text[:max_chars]

        scored.sort(key=lambda x: x[1], reverse=True)
        selected: List[str] = []
        total = 0
        for sent, _ in scored:
            if sent in selected:
                continue
            if total + len(sent) + 2 > max_chars:
                break
            selected.append(sent)
            total += len(sent) + 2
            if len(selected) >= 18:
                break
        return "\n".join(selected)[:max_chars]

    def fallback_answer() -> str:
        context = extract_relevant_context(max_chars=2400)
        if not context.strip():
            return "I don’t have any document text to reference yet. Please upload a document first."
        return (
            "Based on the document, here’s what I found:\n\n"
            + context
            + "\n\nIf you want, ask a more specific question (section/topic/term) and I’ll narrow it down."
        )

    openai_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    hf_token = os.getenv("HUGGINGFACE_API_TOKEN") or os.getenv("HF_API_TOKEN")
    hf_model = os.getenv("HUGGINGFACE_MODEL", "HuggingFaceH4/zephyr-7b-beta")

    if openai_key:
        try:
            import openai  # type: ignore

            client = openai.OpenAI(api_key=openai_key)
            context = extract_relevant_context(max_chars=6500)
            history = (conversation_history or [])[-12:]

            messages: List[Dict[str, Any]] = [
                {
                    "role": "system",
                    "content": (
                        "You are Sumrify’s assistant. Answer the user’s question using ONLY the provided document context. "
                        "If the answer isn’t in the context, say you can’t find it in the document and ask a clarifying question. "
                        "Be concise, factual, and avoid inventing details."
                    ),
                },
                {"role": "system", "content": "Document context:\n" + (context or "")},
            ]

            for item in history:
                role = item.get("role")
                content = item.get("content")
                if role in {"user", "assistant"} and isinstance(content, str) and content.strip():
                    messages.append({"role": role, "content": content.strip()})

            messages.append({"role": "user", "content": (message or "").strip()})

            resp = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.2,
            )
            content = (resp.choices[0].message.content or "").strip()
            return content or fallback_answer()
        except Exception:
            return fallback_answer()

    if hf_token:
        try:
            context = extract_relevant_context(max_chars=6500)
            history = (conversation_history or [])[-8:]

            prompt_lines: List[str] = [
                "You are Sumrify’s assistant. Answer using ONLY the provided document context.",
                "If the answer is not in the context, say you cannot find it in the document and ask a clarifying question.",
                "",
                "DOCUMENT CONTEXT:",
                context,
                "",
            ]
            for item in history:
                role = item.get("role")
                content = item.get("content")
                if role in {"user", "assistant"} and isinstance(content, str) and content.strip():
                    prompt_lines.append(f"{role.upper()}: {content.strip()}")
            prompt_lines.append(f"USER: {(message or '').strip()}")
            prompt_lines.append("ASSISTANT:")
            prompt = "\n".join(prompt_lines)

            url = f"https://api-inference.huggingface.co/models/{hf_model}"
            headers = {
                "Authorization": f"Bearer {hf_token}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
            payload: Dict[str, Any] = {
                "inputs": prompt,
                "parameters": {"max_new_tokens": 350, "temperature": 0.2, "return_full_text": False},
                "options": {"wait_for_model": True},
            }

            with httpx.Client(timeout=60) as client:
                r = client.post(url, headers=headers, json=payload)
                r.raise_for_status()
                data = r.json()

            if isinstance(data, list) and data:
                first = data[0]
                if isinstance(first, dict) and isinstance(first.get("generated_text"), str):
                    text = first["generated_text"].strip()
                    return text or fallback_answer()

            if isinstance(data, dict) and isinstance(data.get("generated_text"), str):
                text = data["generated_text"].strip()
                return text or fallback_answer()

            return fallback_answer()
        except Exception:
            return fallback_answer()

    return fallback_answer()
