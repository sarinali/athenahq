from fastapi import APIRouter

from models.core import PingRequest, PingResponse, TaskTrackingRequest, TaskTrackingResponse
from models.agent_personality import AgentPersonalityRequest, AgentPersonalityResponse
from services.openai_inference import service as openai_service
from services.task_tracking_service import service as task_tracking_service
from services.agent_personality_manager import service as agent_personality_service


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
    result = await task_tracking_service.analyze_task_status(
        intent=payload.intent,
        image_base64=payload.image_base64
    )
    return TaskTrackingResponse(**result)



@core_router.post("/agent-personality", response_model=AgentPersonalityResponse)
async def set_agent_personality(payload: AgentPersonalityRequest) -> AgentPersonalityResponse:
    """Set the agent's name and personality description"""
    agent_personality_service.set_personality(
        personality_description=payload.personality_description
    )

    return AgentPersonalityResponse(
        personality_description=payload.personality_description,
        message="Agent personality updated successfully"
    )


@core_router.get("/agent-personality")
async def get_agent_personality() -> dict:
    """Get the current agent personality settings"""
    return agent_personality_service.get_personality_info()


@core_router.post("/echo")
async def echo_message(payload: dict) -> dict:
    message = payload.get("message", "")
    print(f"[Backend] Received message: {message}")
    return {"message": f"Echo: {message}", "received_at": "2024-01-01T00:00:00Z"}
