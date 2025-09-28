from pydantic import BaseModel


class ToolCallingRequest(BaseModel):
    prompt: str


class ToolCallingResponse(BaseModel):
    message: str