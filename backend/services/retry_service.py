import json
from typing import Any, Callable, Dict, Optional, TypeVar, Union

T = TypeVar('T')


class RetryService:
    def __init__(self, max_retries: int = 3) -> None:
        self.max_retries = max_retries

    def retry_with_schema_validation(
        self,
        operation: Callable[[], str],
        schema_validator: Callable[[Dict[str, Any]], bool],
        fallback_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Retry an operation up to max_retries times until valid schema is returned.

        Args:
            operation: Function that returns a string (expected to be JSON)
            schema_validator: Function that validates the parsed JSON schema
            fallback_result: Result to return if all retries are exhausted

        Returns:
            Valid parsed JSON dict or fallback_result
        """
        last_error: Optional[str] = None

        for attempt in range(self.max_retries):
            try:
                # Execute the operation
                result_str = operation()

                # Try to parse JSON
                try:
                    parsed_result = json.loads(result_str.strip())
                except json.JSONDecodeError as e:
                    last_error = f"JSON decode error: {str(e)}"
                    continue

                # Validate schema
                if schema_validator(parsed_result):
                    return parsed_result
                else:
                    last_error = "Schema validation failed"
                    continue

            except Exception as e:
                last_error = f"Operation failed: {str(e)}"
                continue

        # All retries exhausted, return fallback with error info
        fallback_with_error = fallback_result.copy()
        if "reasoning" in fallback_with_error:
            fallback_with_error["reasoning"] = f"{fallback_with_error['reasoning']} (Last error: {last_error})"

        return fallback_with_error


def validate_task_tracking_schema(data: Any) -> Dict[str, Any]:
    """Validate that the response matches expected task tracking schema and return parsed data."""
    import json

    # Handle both string and dict inputs
    if isinstance(data, str):
        try:
            parsed_data = json.loads(data.strip())
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {str(e)}")
    elif isinstance(data, dict):
        parsed_data = data
    else:
        raise ValueError(f"Data must be string or dict, got {type(data)}")

    required_fields = ["status", "confidence", "reasoning"]
    valid_statuses = ["on_track", "off_track", "unknown"]

    # Check required fields exist
    for field in required_fields:
        if field not in parsed_data:
            raise ValueError(f"Missing required field: {field}")

    # Check status is valid
    if parsed_data["status"] not in valid_statuses:
        raise ValueError(f"Invalid status: {parsed_data['status']}")

    # Check confidence is a number between 0 and 1
    try:
        confidence = float(parsed_data["confidence"])
        if not (0.0 <= confidence <= 1.0):
            raise ValueError(f"Confidence out of range: {confidence}")
    except (ValueError, TypeError) as e:
        raise ValueError(f"Invalid confidence value: {str(e)}")

    # Check reasoning is a string
    if not isinstance(parsed_data["reasoning"], str):
        raise ValueError(f"Reasoning must be a string")

    return parsed_data


service = RetryService()