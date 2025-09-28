from pydantic import BaseModel


class AgentPersonalityRequest(BaseModel):
    personality_description: str


class AgentPersonalityResponse(BaseModel):
    personality_description: str
    message: str