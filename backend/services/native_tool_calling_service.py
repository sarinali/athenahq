import json
from typing import AsyncGenerator, Dict, Any
from openai import OpenAI

from config import OPENAI_KEY
from services.tool_registry_service import service as tool_registry_service


class NativeToolCallingService:
    def __init__(self) -> None:
        if not OPENAI_KEY:
            raise ValueError("OPENAI_KEY is required")

        self._client = OpenAI(api_key=OPENAI_KEY)
        self._tool_registry = tool_registry_service

    async def execute_with_streaming(self, prompt: str) -> AsyncGenerator[str, None]:
        """Execute tool calling with streaming responses"""
        try:
            yield f"data: {json.dumps({'type': 'started', 'message': 'Tool calling execution started'})}\n\n"

            tools = self._tool_registry.get_tool_schemas()

            messages = [
                {"role": "system", "content": "You are a helpful assistant that can manage emails, Github, and Google Docs. When given multi-step tasks, execute them step by step using available tools. Always complete the entire requested task."},
                {"role": "user", "content": prompt}
            ]

            # Sequential tool chaining loop
            max_iterations = 10
            iteration = 0

            while iteration < max_iterations:
                iteration += 1

                response = self._client.chat.completions.create(
                    model="gpt-5",
                    messages=messages,
                    tools=tools,
                    tool_choice="auto"
                )

                assistant_message = response.choices[0].message
                messages.append({
                    "role": "assistant",
                    "content": assistant_message.content,
                    "tool_calls": assistant_message.tool_calls
                })

                # If no tool calls, we're done
                if not assistant_message.tool_calls:
                    final_content = assistant_message.content or "Task completed"
                    yield f"data: {json.dumps({'type': 'final_result', 'message': final_content})}\n\n"
                    break

                # Process tool calls
                yield f"data: {json.dumps({'type': 'tool_calls_detected', 'count': len(assistant_message.tool_calls), 'iteration': iteration})}\n\n"

                for tool_call in assistant_message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    yield f"data: {json.dumps({'type': 'tool_started', 'tool_name': function_name, 'input': function_args})}\n\n"

                    try:
                        result = self._tool_registry.call_function(function_name, **function_args)
                        yield f"data: {json.dumps({'type': 'tool_completed', 'tool_name': function_name, 'output': result})}\n\n"

                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": result
                        })
                    except Exception as e:
                        error_msg = f"Error executing {function_name}: {str(e)}"
                        yield f"data: {json.dumps({'type': 'tool_error', 'tool_name': function_name, 'error': error_msg})}\n\n"

                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": error_msg
                        })

            # If we hit max iterations, return what we have
            if iteration >= max_iterations:
                yield f"data: {json.dumps({'type': 'max_iterations_reached', 'message': 'Reached maximum iterations limit'})}\n\n"

        except Exception as e:
            error_message = f"Error executing tool calling: {str(e)}"
            yield f"data: {json.dumps({'type': 'error', 'message': error_message})}\n\n"

    def execute_sync(self, prompt: str) -> Dict[str, Any]:
        """Synchronous execution with tool chaining"""
        try:
            tools = self._tool_registry.get_tool_schemas()

            messages = [
                {"role": "system", "content": "You are a helpful assistant that can manage emails, Github, and Google Docs. When given multi-step tasks, execute them step by step using available tools. Always complete the entire requested task."},
                {"role": "user", "content": prompt}
            ]

            tool_results = []
            max_iterations = 10
            iteration = 0

            while iteration < max_iterations:
                iteration += 1

                response = self._client.chat.completions.create(
                    model="gpt-4-1106-preview",
                    messages=messages,
                    tools=tools,
                    tool_choice="auto"
                )

                assistant_message = response.choices[0].message
                messages.append({
                    "role": "assistant",
                    "content": assistant_message.content,
                    "tool_calls": assistant_message.tool_calls
                })

                # If no tool calls, we're done
                if not assistant_message.tool_calls:
                    final_content = assistant_message.content or "Task completed"
                    break

                # Process tool calls
                for tool_call in assistant_message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    try:
                        result = self._tool_registry.call_function(function_name, **function_args)
                        tool_results.append({
                            "function": function_name,
                            "arguments": function_args,
                            "result": result,
                            "iteration": iteration
                        })

                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": result
                        })
                    except Exception as e:
                        error_msg = f"Error executing {function_name}: {str(e)}"
                        tool_results.append({
                            "function": function_name,
                            "arguments": function_args,
                            "error": error_msg,
                            "iteration": iteration
                        })

                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": error_msg
                        })

            # If we didn't break early, we might have hit max iterations
            if iteration >= max_iterations:
                final_content = "Task execution stopped due to iteration limit"
            elif 'final_content' not in locals():
                final_content = "Task completed"

            return {
                "success": True,
                "message": final_content,
                "tool_calls": tool_results
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "tool_calls": []
            }


service = NativeToolCallingService()