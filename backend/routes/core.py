from fastapi import APIRouter

from models.core import PingRequest, PingResponse, TaskTrackingRequest, TaskTrackingResponse
from services.openai_inference import service as openai_service
from services.task_tracking_service import service as task_tracking_service


core_router = APIRouter()


@core_router.post("/ping", response_model=PingResponse)
async def ping(payload: PingRequest) -> PingResponse:
    result = openai_service.inference(
        context=payload.context,
        prompt="Summarize the image content.",
        image_base64=payload.image_base64,
        messages=[message.model_dump() for message in payload.messages] if payload.messages else None,
    )
    return PingResponse(result=result)


@core_router.post("/track-task", response_model=TaskTrackingResponse)
async def track_task(payload: TaskTrackingRequest) -> TaskTrackingResponse:
    result = task_tracking_service.analyze_task_status(
        intent=payload.intent,
        image_base64=payload.image_base64
    )
    return TaskTrackingResponse(**result)


@core_router.post("/echo")
async def echo_message(payload: dict) -> dict:
    message = payload.get("message", "")
    print(f"[Backend] Received message: {message}")
    return {"message": f"Echo: {message}", "received_at": "2024-01-01T00:00:00Z"}
