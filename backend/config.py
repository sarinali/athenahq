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
        self.GITHUB_TOKEN: Optional[str] = os.getenv("GITHUB_TOKEN")
        self.GITHUB_APP_ID: Optional[str] = os.getenv("GITHUB_APP_ID")
        self.GITHUB_APP_PRIVATE_KEY: Optional[str] = os.getenv("GITHUB_APP_PRIVATE_KEY")
        self.GITHUB_REPOSITORY: Optional[str] = os.getenv("GITHUB_REPOSITORY")

    def validate_required_config(self) -> None:
        missing = []

        if not self.OPENAI_KEY:
            missing.append("OPENAI_KEY")

        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")


config = Config()
config.validate_required_config()

OPENAI_KEY = config.OPENAI_KEY
GITHUB_TOKEN = config.GITHUB_TOKEN
GITHUB_APP_ID = config.GITHUB_APP_ID
GITHUB_APP_PRIVATE_KEY = config.GITHUB_APP_PRIVATE_KEY
GITHUB_REPOSITORY = config.GITHUB_REPOSITORY