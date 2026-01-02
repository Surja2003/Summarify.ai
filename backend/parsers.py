import io
from typing import List, Optional
from fastapi import UploadFile
from PyPDF2 import PdfReader
import docx

async def parse_files(files: Optional[List[UploadFile]], text: Optional[str]) -> str:
    contents = []
    if files:
        for file in files:
            if file.filename.endswith('.pdf'):
                contents.append(await parse_pdf(file))
            elif file.filename.endswith('.docx'):
                contents.append(await parse_docx(file))
            elif file.filename.endswith('.txt'):
                contents.append((await file.read()).decode('utf-8'))
            else:
                raise ValueError(f"Unsupported file type: {file.filename}")
    if text:
        contents.append(text)
    return "\n".join(contents)

async def parse_pdf(file: UploadFile) -> str:
    pdf_bytes = await file.read()
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text = []
    for page in reader.pages:
        text.append(page.extract_text() or "")
    return "\n".join(text)

async def parse_docx(file: UploadFile) -> str:
    docx_bytes = await file.read()
    doc = docx.Document(io.BytesIO(docx_bytes))
    return "\n".join([para.text for para in doc.paragraphs])
