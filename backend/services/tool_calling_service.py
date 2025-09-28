import asyncio
import json
from typing import AsyncGenerator

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

from config import OPENAI_KEY
from services.tool_registry_service import service as tool_registry_service


class StreamingCallbackHandler(BaseCallbackHandler):
    def __init__(self, event_queue: asyncio.Queue):
        self.event_queue = event_queue
        try:
            self.loop = asyncio.get_running_loop()
        except RuntimeError:
            self.loop = None

    def _put(self, data: dict):
        if self.loop is None or self.loop.is_closed():
            self.loop = asyncio.get_event_loop()

        self.loop.call_soon_threadsafe(
            self.event_queue.put_nowait,
            f"data: {json.dumps(data)}\n\n"
        )

    def on_tool_start(self, serialized, input_str, **kwargs):
        self._put({"type": "tool_started", "tool_name": serialized.get("name"), "input": input_str})

    def on_tool_end(self, output, **kwargs):
        self._put({"type": "tool_completed", "output": output})

    def on_tool_error(self, error: Exception, **kwargs):
        self._put({"type": "tool_error", "error": str(error)})



class ToolCallingService:
    def __init__(self) -> None:
        if not OPENAI_KEY:
            raise ValueError("OPENAI_KEY is required")

        self._llm = ChatOpenAI(model="gpt-4.1", temperature=0, api_key=OPENAI_KEY)
        self._tools = tool_registry_service.get_tools()

        self._prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful assistant that can manage emails, Github, and Google Docs."),
            MessagesPlaceholder("chat_history", optional=True),
            ("human", "{input}"),
            MessagesPlaceholder("agent_scratchpad"),
        ])

        self._agent = create_openai_tools_agent(self._llm, self._tools, self._prompt)
        self._agent_executor = AgentExecutor(agent=self._agent, tools=self._tools)

    async def execute_with_streaming(self, prompt: str) -> AsyncGenerator[str, None]:
        event_queue = asyncio.Queue()
        callback_handler = StreamingCallbackHandler(event_queue)

        try:
            yield f"data: {json.dumps({'type': 'started', 'message': 'Tool calling execution started'})}\n\n"

            async def run_agent():
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    lambda: self._agent_executor.invoke(
                        {"input": prompt},
                        config={"callbacks": [callback_handler]}
                    )
                )
                await event_queue.put("DONE")
                return result

            agent_task = asyncio.create_task(run_agent())

            while True:
                try:
                    event = await asyncio.wait_for(event_queue.get(), timeout=0.1)
                    if event == "DONE":
                        break
                    yield event
                except asyncio.TimeoutError:
                    if agent_task.done():
                        break
                    continue

            result = await agent_task
            output = result.get("output", "Task completed")
            yield f"data: {json.dumps({'type': 'final_result', 'message': output})}\n\n"

        except Exception as e:
            error_message = f"Error executing tool calling: {str(e)}"
            yield f"data: {json.dumps({'type': 'error', 'message': error_message})}\n\n"


service = ToolCallingService()