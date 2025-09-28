import random
from typing import List


class TaskTrackingPrompts:
    

    @staticmethod
    def get_task_analysis_system_prompt() -> str:
        return """You are an AI assistant that analyzes screenshots to determine if a person is on track or off track with their current task.

Your job is to:
1. Analyze the screenshot provided
2. Determine if the person appears to be focused on their stated intent or distracted
3. Respond with ONLY a valid JSON object in this exact format:

{
  "status": "on_track" | "off_track" | "unknown",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation of your assessment"
}

On track indicators:
- Activities that directly support the stated intent
- Work-related applications when intent is work-focused
- Educational content when intent is learning
- Research activities when intent involves research
- Task management or planning tools when intent is organizing

Off track indicators:
- Activities unrelated to the stated intent
- Social media when intent is work/study
- Entertainment when intent is productivity
- Gaming when intent is professional work
- Personal browsing when intent is task completion

Unknown indicators:
- Screen is unclear or unreadable
- Desktop with no clear activity
- Ambiguous applications that could support or detract from intent
- Insufficient information to make determination

CRITICAL: Respond ONLY with the JSON object. No additional text, explanations, or formatting."""

    @staticmethod
    def get_task_analysis_user_prompt(intent: str) -> str:
        return f"Analyze this screenshot and determine if the person is on track or off track with their stated intent: '{intent}'"

    @classmethod
    def get_off_track_nudge(cls) -> str:
        if len(cls._used_nudge_indices) >= len(cls.OFF_TRACK_NUDGES):
            cls._used_nudge_indices.clear()
        
        available_indices = [i for i in range(len(cls.OFF_TRACK_NUDGES)) if i not in cls._used_nudge_indices]
        
        chosen_index = random.choice(available_indices)
        
        cls._used_nudge_indices.add(chosen_index)

        return cls.OFF_TRACK_NUDGES[chosen_index]

    @staticmethod
    def get_nudge_generation_prompt(intent: str, agent_personality: str) -> str:
        """Generate prompt for creating a personalized off-track nudge"""
        return f"""Based on your personality: "{agent_personality}"

Generate a playful, encouraging nudge message for someone who got distracted from their task: "{intent}".

The nudge should:
- Match your personality and speaking style exactly
- Reference their specific intent: "{intent}"
- Limit to 1 sentence (10 words or less)
- Include relevant emojis that fit your vibe
- Sound natural and conversational

Generate ONE nudge message that sounds like you and will get them to get back on track with "{intent}"."""
