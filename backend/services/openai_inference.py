from typing import Dict, List, Optional

from config import OPENAI_KEY
from openai import OpenAI


class OpenAIInferenceService:
    def __init__(self) -> None:
        if not OPENAI_KEY:
            raise ValueError("OPENAI_KEY is required")
        self._client = OpenAI(api_key=OPENAI_KEY)

    def inference(
        self,
        *,
        context: str,
        prompt: str,
        image_base64: str,
        messages: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        assembled_messages: List[Dict[str, object]] = [
            {"role": "system", "content": context}
        ]

        if messages:
            for message in messages:
                assembled_messages.append(
                    {
                        "role": message["role"],
                        "content": message["content"],
                    }
                )

        user_content = []
        user_content.append({"type": "text", "text": prompt})
        if image_base64:
            clean_base64 = image_base64.strip()
            if clean_base64.startswith("data:"):
                clean_base64 = clean_base64.split(",", 1)[-1]
            clean_base64 = clean_base64.replace(" ", "").replace("\n", "").replace("\r", "")

            user_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{clean_base64}"}
            })

        assembled_messages.append({"role": "user", "content": user_content})

        response = self._client.chat.completions.create(
            model="gpt-4o",
            messages=assembled_messages
        )
        return response.choices[0].message.content


service = OpenAIInferenceService()
