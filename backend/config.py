import os
from typing import Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class Config:
    def __init__(self):
        self.OPENAI_KEY: Optional[str] = os.getenv("OPENAI_KEY")

    def validate_required_config(self) -> None:
        missing = []

        if not self.OPENAI_KEY:
            missing.append("OPENAI_KEY")

        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")


config = Config()
config.validate_required_config()

OPENAI_KEY = config.OPENAI_KEY
