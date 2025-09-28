

class AgentPersonalityManager:
    def __init__(self) -> None:
        self._personality_description: str = "You are a fun, encouraging Gen Z/millennial assistant who speaks casually but is super supportive. You use modern slang, emojis, and keep things light while being genuinely helpful. You can manage emails, Github, and Google Docs."

    def set_personality(self, personality_description: str) -> None:
        """Set the agent's name and personality description"""
        self._personality_description = personality_description.strip()

    def get_personality_description(self) -> str:
        """Get the current personality description"""
        return self._personality_description

    def get_formatted_context(self) -> str:
        """Get the formatted context for LLM inference"""
        return f"{self._personality_description} When given multi-step tasks, execute them step by step using available tools. Always complete the entire requested task."

    def get_personality_info(self) -> dict:
        """Get all personality information as a dictionary"""
        return {
            "personality_description": self._personality_description
        }


service = AgentPersonalityManager()