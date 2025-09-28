import asyncio
from typing import Dict, Any

from constants.prompts import TaskTrackingPrompts
from services.openai_inference import service as openai_service
from services.retry_service import service as retry_service, validate_task_tracking_schema
from services.agent_personality_manager import service as agent_personality_service


class TaskTrackingService:
    def __init__(self) -> None:
        self._openai_service = openai_service
        self._retry_service = retry_service

    async def analyze_task_status(self, *, intent: str, image_base64: str) -> Dict[str, Any]:
        """
        Analyze if a person is on track with their stated intent based on a screenshot.

        Returns:
            Dict with status, confidence, and reasoning
        """
        if not image_base64:
            return {
                "status": "unknown",
                "confidence": 0.0,
                "reasoning": "No image provided",
                "nudge": None,
            }

        async def analysis_operation():
            return await self._openai_service.inference_async(
                context=TaskTrackingPrompts.get_task_analysis_system_prompt(),
                prompt=TaskTrackingPrompts.get_task_analysis_user_prompt(intent),
                image_base64=image_base64,
                messages=None
            )

        async def nudge_operation():
            agent_personality = agent_personality_service.get_personality_description()
            return await self._openai_service.inference_async(
                context=agent_personality,
                prompt=TaskTrackingPrompts.get_nudge_generation_prompt(intent, agent_personality),
                image_base64=None,
                messages=None
            )

        try:
            analysis_raw, nudge_raw = await asyncio.gather(
                analysis_operation(),
                nudge_operation(),
                return_exceptions=True
            )
        except Exception as e:
            return {
                "status": "unknown",
                "confidence": 0.0,
                "reasoning": f"Failed to execute parallel requests: {str(e)}",
                "nudge": None,
            }

        fallback_result = {
            "status": "unknown",
            "confidence": 0.0,
            "reasoning": "Failed to get valid response after retries",
            "nudge": None,
        }

        if isinstance(analysis_raw, Exception):
            result = fallback_result
        else:
            try:
                result = validate_task_tracking_schema(analysis_raw)
            except Exception:
                result = fallback_result

        if result.get("status") == "off_track" and not isinstance(nudge_raw, Exception):
            try:
                result["nudge"] = nudge_raw.strip()
            except Exception:
                result["nudge"] = f"Hey! Let's get back to {intent} 💪"
        else:
            result["nudge"] = None

        return result


service = TaskTrackingService()
