from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.core import core_router
from config import config

app = FastAPI()

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register routers
app.include_router(core_router, prefix="/core")

@app.get("/")
def read_root() -> dict:
    return {"Hello": "World"}


async def startup_event() -> None:
    load_dotenv()
    config.validate_required_config()
    print("Application startup")

app.add_event_handler("startup", startup_event)
