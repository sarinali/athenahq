from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from models.tool_calling import ToolCallingRequest
from services.native_tool_calling_service import service as native_tool_calling_service


native_tool_calling_router = APIRouter()


@native_tool_calling_router.post("/execute-stream")
async def execute_native_tool_calling_stream(payload: ToolCallingRequest):
    return StreamingResponse(
        native_tool_calling_service.execute_with_streaming(payload.prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@native_tool_calling_router.post("/execute")
async def execute_native_tool_calling(payload: ToolCallingRequest):
    """Synchronous execution endpoint for testing"""
    result = native_tool_calling_service.execute_sync(payload.prompt)
    return result