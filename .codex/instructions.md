# Backend Guidelines for Codex

- Always define request and response payload types in `models/`, scoped to each route module.
- Always implement backend services as singletons inside `services/`; instantiate at the bottom with `service = Service()`.
- Always place FastAPI routes in `routes/` and import + register them using the pattern:
  - `from routes.webhooks import webhooks_router`
  - `app.include_router(webhooks_router, prefix="/webhook")`
- Maintain configuration in `config.py` using the following pattern to load environment variables via `python-dotenv`:

```python
import os
from typing import Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class Config:

    def __init__(self):
        self.SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")


    def validate_required_config(self) -> None:
        """Validate that required configuration values are present."""
        required_configs = []

        if not self.SUPABASE_URL:
            required_configs.append("SUPABASE_URL")
        if required_configs:
            missing_configs = ", ".join(required_configs)
            raise ValueError(f"Missing required environment variables: {missing_configs}")


config = Config()

SUPABASE_URL = config.SUPABASE_URL
```

- Always add new environment keys to `.env.example`.
- Only add comments that explain the reasoning behind unusual decisions.
- Default to the simplest working implementation; iterate on sophistication only when requested.
