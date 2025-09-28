import random
from typing import List


class TaskTrackingPrompts:
    OFF_TRACK_NUDGES: List[str] = [
        "I see your focus drifting - want to jump back into that task for a few minutes?",
        "Quick nudge: the goal you care about is waiting. Let's give it a little love.",
        "Feels like a detour. How about we knock out one tiny step toward your intent?",
        "Future-you is rooting for you to lean back in right now.",
        "Hey, this tab isn't helping the mission. Ready to slide back to it?",
        "You've got a plan - let's sync back up with it for a quick win.",
        "We both know what you meant to work on. Want to pick it up again?",
        "That distraction can wait. Your goal deserves the next few minutes.",
        "Small reset, big payoff: hop back into what matters most?",
        "Imagine how good it'll feel to make progress - let's get you there now.",
        "Let's reroute this energy into the task you actually care about.",
        "A tiny sprint on your real priority will feel better than this scroll - shall we?",
    ]

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
        return random.choice(cls.OFF_TRACK_NUDGES)
