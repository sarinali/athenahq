from fastapi import APIRouter

from models.core import PingRequest, PingResponse


core_router = APIRouter()


@core_router.post("/ping", response_model=PingResponse)
async def ping(payload: PingRequest) -> PingResponse:
    ...
