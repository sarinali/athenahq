from typing import List, Optional

from pydantic import BaseModel


class PingMessage(BaseModel):
    role: str
    content: str


class PingRequest(BaseModel):
    context: str
    image_base64: str
    messages: Optional[List[PingMessage]] = None


class PingResponse(BaseModel):
    result: str


class TaskTrackingRequest(BaseModel):
    intent: str
    image_base64: str


class TaskTrackingResponse(BaseModel):
    status: str
    confidence: float
    reasoning: str
