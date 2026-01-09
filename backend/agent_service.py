import os
import asyncio
from dotenv import load_dotenv
from agents import Runner, Agent, AsyncOpenAI, set_tracing_disabled, OpenAIChatCompletionsModel, function_tool, ModelSettings

load_dotenv()


OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.environ.get("OPENROUTER_BASE_URL")

set_tracing_disabled(True)

async def get_agent(user_id: str):
    client = AsyncOpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url=OPENROUTER_BASE_URL
    )

    model = OpenAIChatCompletionsModel(
        model="openrouter/auto",
        openai_client=client,
    )

    # Import the MCP-defined tools directly as functions
    from mcp_tools import fetch_todos, add_todo, update_todo, delete_todo, delete_all_todos
    
    # Use the function_tool decorator as a wrapper to automatically generate Tool metadata
    tools = [
        function_tool(fetch_todos),
        function_tool(add_todo),
        function_tool(update_todo),
        function_tool(delete_todo),
        function_tool(delete_all_todos)
    ]
    
    agent = Agent(
        name="Todo Assistant",
        instructions=f"""
            You are a specialized Todo Assistant. 
            You help users manage their tasks via shorthand commands or natural language.
            
            CURRENT USER ID: {user_id}
            
            STRICT COMMAND SYSTEM:
            - "add todo [title]" -> add_todo(user_id='{user_id}', title=...)
            - "add todo [title] status complete/incomplete" -> add_todo(user_id='{user_id}', title=..., completed=True/False)
            - "update todo [id] title [new title]" -> update_todo(user_id='{user_id}', todo_id=[id], title=[new title])
            - "delete todo [id]" -> delete_todo(user_id='{user_id}', todo_id=[id])
            - "show my todos" -> fetch_todos(user_id='{user_id}')

            BEHAVIOR RULES:
            - You MUST always provide the provided user_id ('{user_id}') to every tool call. Do NOT hallucinate a different ID.
            - NO DUPLICATES: If update_todo fails, do NOT create a new todo. Report the error to the user.
            - If a user provides an ID (e.g., 'todo 1'), use `todo_id`.
            - If a user provides a title for update (e.g., 'update Banana'), use `current_title`.
            - When an action is successful, acknowledge it clearly.
            
            SECURITY RULES:
            - You ONLY have knowledge of TODOS.
            - You do NOT have access to passwords or personal accounts.
            - The provided user_id is the ONLY pool of data you can access.
        """,
        model=model,
        tools=tools,
        model_settings=ModelSettings(max_tokens=1000)
    )
    return agent

async def run_agent_with_user(prompt: str, user_id: str, history: list = None, action_history: list = None):
    agent = await get_agent(user_id)
    
    history_context = ""
    if history:
        history_context = "\n\nConversation History:\n"
        for msg in history:
            role = "User" if msg.get("role") == "user" else "Assistant"
            text = msg.get("text", "")
            history_context += f"{role}: {text}\n"

    recent_actions = ""
    if action_history:
        # Format the action_history list into a string
        formatted_actions = [f"- {a['type']}: {a['details']} ({a['timestamp']})" for a in action_history if isinstance(a, dict)]
        if formatted_actions:
            recent_actions = "\n\nRecent Actions in Session:\n" + "\n".join(formatted_actions)
    
    # We don't need to inject user_id here anymore as it is in the system prompt, but keeping it in context doesn't hurt.
    input_with_context = f"{history_context}{recent_actions}\n\nNew User Message: {prompt}"
    
    result = await Runner.run(
        starting_agent=agent,
        input=input_with_context
    )
    
    if hasattr(result, 'final_output'):
        return str(result.final_output)
    return str(result)
