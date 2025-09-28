import random
from typing import List


class TaskTrackingPrompts:
    OFF_TRACK_NUDGES = [
        "reminder: ur ass has work to do... 😿",
        "bruh.. why are you scrolling again? 🥀📱",
        "get back to work before I tell on you. LOL 🤡",
        "this detour is not cute. just pack it up. 😣🚫",
        "scrolling won't finish the task for you... u know that right? 🙃📜",
        "future-you is facepalming rn. fix it. 🤦‍♂️🤦‍♀️",
        "plot twist: that tab wasn't urgent. go work. 💻",
        "bro… you're embarrassing us rn 😭💔",
        "the grind is calling. pick up the phone. 🥀",
        "ur goal is over there 👉 not here 👈 🎯",
        "tf r u doing here?? back to work. 🤨🕒",
        "you've reached max procrastination XP. log off. 🎮💀",
        "lowkey this is a waste of ur hotness. go focus. 😮‍💨🔥",
        "ok detour queen 👑 now get back on track. 🛣️✨",
        "friendly reminder: nobody asked for this scroll. 🙄📲",
        "don't make me close these tabs for you. 🖱️😤",
        "u lowkey cant be real... get back to work. 🥴🫠",
        "ur future husband/wife is waiting for you. go focus. 💍😍",
        "ai is replacing u first... LOL 🤖☠️",
        "yo... that's embarrassing to look at rn... 😬🫣",
        "nah bc this procrastination arc is mid 💀📉",
        "you're speedrunning distractions rn 🏃💨",
        "your job is ✍️ not scrolling 📸",
        "scroll energy: 10/10. work energy: 0/10. fix it ⚖️🕹️",
        "even your laptop's judging you rn 💻👀",
        "go touch some… tasks 📝 instead of your phone 📱",
        "plot twist 2: u actually *wanted* to be productive 🤔🎬",
    ]
    
    _used_nudge_indices = set()

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
