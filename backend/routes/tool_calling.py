from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from models.tool_calling import ToolCallingRequest
from services.tool_calling_service import service as tool_calling_service


tool_calling_router = APIRouter()


@tool_calling_router.post("/execute-stream")
async def execute_tool_calling_stream(payload: ToolCallingRequest):
    return StreamingResponse(
        tool_calling_service.execute_with_streaming(payload.prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )