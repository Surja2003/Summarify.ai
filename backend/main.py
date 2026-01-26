from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import uvicorn
import os
import io
import time
from datetime import datetime
from parsers import parse_files
from summarizer import summarize_document
from utils import cache, get_history, export_summary, chat_with_document


def _parse_cors_origins(value: str | None) -> list[str]:
    if not value:
        return ["*"]
    raw = value.strip()
    if raw == "*":
        return ["*"]
    parts = [p.strip() for p in raw.split(",")]
    return [p for p in parts if p]

app = FastAPI(
    title="Sumrify: AI Document Summarizer API",
    description="Backend API for AI-powered document summarization",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(os.getenv("CORS_ORIGINS", "*")),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request validation
class SummarizeRequest(BaseModel):
    text: str
    settings: Dict[str, Any]
    fileName: Optional[str] = "document.txt"

class ChatRequest(BaseModel):
    message: str
    documentText: str
    conversationHistory: List[Dict[str, str]] = []

class HistoryItem(BaseModel):
    id: str
    fileName: str
    timestamp: str
    summary: str
    compressionRatio: int
    settings: Dict[str, Any]
    userId: Optional[str] = None

# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Sumrify API is running",
        "version": "1.0.0",
        "endpoints": {
            "POST /api/summarize": "Summarize document",
            "POST /api/summarize/batch": "Batch summarize multiple documents",
            "POST /api/chat": "Chat with document",
            "GET /api/history": "Get summarization history",
            "POST /api/history": "Add to history",
            "POST /api/export": "Export summary",
            "GET /health": "Health check"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Main summarization endpoint
@app.post("/api/summarize")
async def summarize(request: SummarizeRequest):
    """
    Summarize a single document using extractive + optional abstractive methods.
    Compatible with the frontend's SummarizationResult type.
    """
    start_time = time.time()
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="No text provided.")
        
        settings = request.settings
        # Summarize using backend logic
        result = summarize_document(
            request.text,
            speed_mode=settings.get('speedMode', 'balanced'),
            domain=settings.get('domain', 'general'),
            use_abstractive=settings.get('useAbstractive', False)
        )
        
        # Add metadata to match frontend types
        result['fileName'] = request.fileName
        result['timestamp'] = datetime.utcnow().isoformat()
        result['settings'] = settings
        # `summarize_document` may return a cleaned/normalized version.
        result['originalText'] = result.get('originalText') or request.text
        result['metrics']['processingTime'] = round((time.time() - start_time) * 1000)  # milliseconds
        
        # Cache result
        cache.add(result)
        
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Batch summarization for multiple documents
@app.post("/api/summarize/batch")
async def summarize_batch(
    files: List[UploadFile] = File(...),
    settings: str = Form(...)
):
    """
    Summarize multiple documents. Can return separate or merged summaries.
    """
    import json
    settings_dict = json.loads(settings)
    
    start_time = time.time()
    try:
        documents = []
        for file in files:
            text = await parse_files([file], None)
            doc_result = summarize_document(
                text,
                speed_mode=settings_dict.get('speedMode', 'balanced'),
                domain=settings_dict.get('domain', 'general'),
                use_abstractive=settings_dict.get('useAbstractive', False)
            )
            doc_result['fileName'] = file.filename
            doc_result['id'] = str(hash(file.filename))
            documents.append(doc_result)
        
        # If merged mode, combine all documents
        if settings_dict.get('summaryMode') == 'merged':
            combined_text = "\n\n".join([doc['originalText'] for doc in documents])
            merged_result = summarize_document(
                combined_text,
                speed_mode=settings_dict.get('speedMode', 'balanced'),
                domain=settings_dict.get('domain', 'general'),
                use_abstractive=settings_dict.get('useAbstractive', False)
            )
            merged_result['fileName'] = f"{len(files)} Documents (Merged)"
            merged_result['timestamp'] = datetime.utcnow().isoformat()
            merged_result['settings'] = settings_dict
            merged_result['originalText'] = merged_result.get('originalText') or combined_text
            merged_result['documents'] = documents
            merged_result['isMerged'] = True
            merged_result['metrics']['processingTime'] = round((time.time() - start_time) * 1000)
            return JSONResponse(merged_result)
        else:
            # Return separate summaries
            for doc in documents:
                doc['timestamp'] = datetime.utcnow().isoformat()
                doc['settings'] = settings_dict
            return JSONResponse({"documents": documents, "isMerged": False})
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat with document
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Interactive chat about the document content.
    Uses simple keyword extraction and similarity matching.
    """
    try:
        response = chat_with_document(
            request.message,
            request.documentText,
            request.conversationHistory
        )
        return JSONResponse({
            "role": "assistant",
            "content": response,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# History management
@app.get("/api/history")
def get_history_endpoint(userId: Optional[str] = None):
    """Get summarization history, optionally filtered by userId."""
    history_items = get_history(userId)
    return JSONResponse(history_items)

@app.post("/api/history")
async def add_history(item: HistoryItem):
    """Add an item to history."""
    cache.add_to_history(item.dict())
    return JSONResponse({"status": "success", "id": item.id})

# Export functionality
@app.post("/api/export")
async def export_document(
    summary: str = Form(...),
    format: str = Form("txt"),
    fileName: str = Form("summary")
):
    """Export summary as TXT or PDF."""
    try:
        file_path = export_summary(summary, format, fileName)
        return FileResponse(
            file_path,
            filename=f"{fileName}.{format}",
            media_type="application/octet-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
