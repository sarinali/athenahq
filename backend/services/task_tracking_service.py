from typing import Dict, Any

from constants.prompts import TaskTrackingPrompts
from services.openai_inference import service as openai_service
from services.retry_service import service as retry_service, validate_task_tracking_schema


class TaskTrackingService:
    def __init__(self) -> None:
        self._openai_service = openai_service
        self._retry_service = retry_service

    def analyze_task_status(self, *, intent: str, image_base64: str) -> Dict[str, Any]:
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

        def analysis_operation() -> str:
            return self._openai_service.inference(
                context=TaskTrackingPrompts.get_task_analysis_system_prompt(),
                prompt=TaskTrackingPrompts.get_task_analysis_user_prompt(intent),
                image_base64=image_base64,
                messages=None
            )

        fallback_result = {
            "status": "unknown",
            "confidence": 0.0,
            "reasoning": "Failed to get valid response after retries",
            "nudge": None,
        }

        result = self._retry_service.retry_with_schema_validation(
            operation=analysis_operation,
            schema_validator=validate_task_tracking_schema,
            fallback_result=fallback_result
        )

        if result.get("status") == "off_track":
            result["nudge"] = TaskTrackingPrompts.get_off_track_nudge()
        else:
            result.setdefault("nudge", None)

        return result


service = TaskTrackingService()
