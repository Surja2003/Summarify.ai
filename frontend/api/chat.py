import os
import re
from datetime import datetime
from typing import Any, Dict, List

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel


def _get_openai_client(api_key: str):
    try:
        import openai  # type: ignore

        return openai.OpenAI(api_key=api_key)
    except Exception:
        return None


app = FastAPI(title="Sumrify Chat API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    documentText: str
    conversationHistory: List[Dict[str, str]] = []


def _split_sentences(text: str) -> List[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.replace("\n", " "))
    return [p.strip() for p in parts if p and len(p.strip()) > 25]


def _extract_relevant_context(message: str, document_text: str, max_chars: int = 6000) -> str:
    keywords = [w for w in re.findall(r"[a-zA-Z0-9]+", message.lower()) if len(w) > 3]
    if not keywords:
        return document_text[:max_chars]

    sentences = _split_sentences(document_text)
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


def _fallback_answer(message: str, document_text: str) -> str:
    context = _extract_relevant_context(message, document_text, max_chars=2400)
    if not context.strip():
        return "I don’t have any document text to reference yet. Please upload a document first."
    return (
        "Based on the document, here’s what I found:\n\n"
        + context
        + "\n\nIf you want, ask a more specific question (section/topic/term) and I’ll narrow it down."
    )


def _huggingface_generate(*, token: str, model: str, prompt: str) -> str:
    url = f"https://api-inference.huggingface.co/models/{model}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    payload: Dict[str, Any] = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 350,
            "temperature": 0.2,
            "return_full_text": False,
        },
        "options": {"wait_for_model": True},
    }

    with httpx.Client(timeout=60) as client:
        r = client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()

    if isinstance(data, list) and data:
        first = data[0]
        if isinstance(first, dict) and isinstance(first.get("generated_text"), str):
            return first["generated_text"].strip()

    if isinstance(data, dict) and isinstance(data.get("generated_text"), str):
        return data["generated_text"].strip()

    if isinstance(data, dict) and isinstance(data.get("error"), str):
        raise RuntimeError(data["error"])

    raise RuntimeError("Unexpected Hugging Face response format")


def _chat_impl(req: ChatRequest):
    message = (req.message or "").strip()
    document_text = (req.documentText or "").strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    if not document_text:
        return JSONResponse(
            {
                "role": "assistant",
                "content": "I can help, but I don’t have any document text yet. Upload a document and then ask your question.",
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

    openai_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    hf_token = os.getenv("HUGGINGFACE_API_TOKEN") or os.getenv("HF_API_TOKEN")
    hf_model = os.getenv("HUGGINGFACE_MODEL", "HuggingFaceH4/zephyr-7b-beta")

    client = _get_openai_client(openai_key) if openai_key else None
    if not openai_key or client is None:
        if hf_token:
            try:
                context = _extract_relevant_context(message, document_text, max_chars=6500)
                history = (req.conversationHistory or [])[-8:]

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
                prompt_lines.append(f"USER: {message}")
                prompt_lines.append("ASSISTANT:")
                prompt = "\n".join(prompt_lines)

                hf_text = _huggingface_generate(token=hf_token, model=hf_model, prompt=prompt)
                if hf_text:
                    return JSONResponse(
                        {
                            "role": "assistant",
                            "content": hf_text,
                            "timestamp": datetime.utcnow().isoformat(),
                        }
                    )
            except Exception:
                pass

        return JSONResponse(
            {
                "role": "assistant",
                "content": _fallback_answer(message, document_text),
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

    context = _extract_relevant_context(message, document_text, max_chars=6500)
    history = (req.conversationHistory or [])[-12:]
    messages: List[Dict[str, Any]] = [
        {
            "role": "system",
            "content": (
                "You are Sumrify’s assistant. Answer the user’s question using ONLY the provided document context. "
                "If the answer isn’t in the context, say you can’t find it in the document and ask a clarifying question. "
                "Be concise, factual, and avoid inventing details."
            ),
        },
        {"role": "system", "content": "Document context:\n" + context},
    ]

    for item in history:
        role = item.get("role")
        content = item.get("content")
        if role in {"user", "assistant"} and isinstance(content, str) and content.strip():
            messages.append({"role": role, "content": content.strip()})

    messages.append({"role": "user", "content": message})

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
        )
        content = (resp.choices[0].message.content or "").strip()
        if not content:
            content = _fallback_answer(message, document_text)

        return JSONResponse(
            {
                "role": "assistant",
                "content": content,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
    except Exception as e:
        return JSONResponse(
            {
                "role": "assistant",
                "content": _fallback_answer(message, document_text),
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)[:300],
            },
            status_code=200,
        )


@app.post("/")
@app.post("/api/chat")
def chat(req: ChatRequest):
    return _chat_impl(req)
