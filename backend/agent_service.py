import os
import asyncio
from dotenv import load_dotenv
from agents import Runner, Agent, AsyncOpenAI, set_tracing_disabled, OpenAIChatCompletionsModel, function_tool, ModelSettings

load_dotenv()


OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.environ.get("OPENROUTER_BASE_URL")

set_tracing_disabled(True)

async def get_agent():
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
        instructions="""
            You are a specialized Todo Assistant. 
            You help users manage their tasks via shorthand commands or natural language.
            
            STRICT COMMAND SYSTEM:
            - "add todo [title]" -> add_todo(title)
            - "add todo [title] status complete/incomplete" -> add_todo(title, completed=True/False)
            - "update todo [id] title [new title]" -> update_todo(todo_id=[id], title=[new title])
            - "update todo [id] status complete" -> update_todo(todo_id=[id], completed=True)
            - "delete todo [id]" -> delete_todo(todo_id=[id])
            - "mark todo [id] complete" -> update_todo(todo_id=[id], completed=True)
            - "show my todos" -> fetch_todos()

            BEHAVIOR RULES:
            - You MUST always provide the correct user_id (from CONTEXT) to every tool call.
            - NO DUPLICATES: If update_todo fails, do NOT create a new todo. Report the error to the user.
            - If a user provides an ID (e.g., 'todo 1'), use `todo_id`.
            - If a user provides a title for update (e.g., 'update Banana'), use `current_title`.
            - When an action is successful, acknowledge it clearly.
            
            ACTION HISTORY:
            - You will be provided with a list of "Recent Actions" in the context. Use this to track what has already been done in the current session.
            
            SECURITY RULES:
            - You ONLY have knowledge of TODOS.
            - You do NOT have access to passwords or personal accounts.
            - If asked about non-todo topics, politely say you are only here to help with tasks.
            - The provided user_id is the ONLY pool of data you can access.
        """,
        model=model,
        tools=tools,
        model_settings=ModelSettings(max_tokens=4000)
    )
    return agent

async def run_agent_with_user(prompt: str, user_id: str, history: list = None):
    agent = await get_agent()
    
    history_context = ""
    if history:
        history_context = "\n\nConversation History:\n"
        for msg in history:
            role = "User" if msg.get("role") == "user" else "Assistant"
            text = msg.get("text", "")
            history_context += f"{role}: {text}\n"

    recent_actions = ""
    if hasattr(asyncio, 'recent_actions_list') and asyncio.recent_actions_list:
        recent_actions = "\n\nRecent Actions in Session:\n" + "\n".join(asyncio.recent_actions_list)
    
    input_with_context = f"[CONTEXT: user_id='{user_id}']{history_context}{recent_actions}\n\nNew User Message: {prompt}"
    
    result = await Runner.run(
        starting_agent=agent,
        input=input_with_context
    )
    
    if hasattr(result, 'final_output'):
        return str(result.final_output)
    return str(result)
