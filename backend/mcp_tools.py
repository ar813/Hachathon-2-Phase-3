from mcp.server.fastmcp import FastMCP
from db_manager import db_manager
from typing import Optional

# Create an MCP server
mcp = FastMCP("TodoManager")

@mcp.tool()
async def fetch_todos(user_id: str):
    """Fetch all todos for a specific user ID."""
    print(f"TOOL: fetch_todos called for user_id={user_id}")
    await db_manager.connect()
    todos = await db_manager.get_todos(user_id)
    print(f"TOOL: Found {len(todos)} todos")
    return todos

@mcp.tool()
async def add_todo(user_id: str, title: str, description: Optional[str] = None, completed: Optional[bool] = False):
    """Add a new todo for a specific user ID with an optional completion status."""
    print(f"TOOL: add_todo called for user_id={user_id}, title={title}")
    await db_manager.connect()
    res = await db_manager.add_todo(user_id, title, description, completed or False)
    print(f"TOOL: Added todo result={res}")
    return res

@mcp.tool()
async def update_todo(user_id: str, todo_id: Optional[int] = None, current_title: Optional[str] = None, title: Optional[str] = None, description: Optional[str] = None, completed: Optional[bool] = None):
    """Update an existing todo's title, description, or status for a specific user ID. Identify by todo_id or current_title."""
    print(f"TOOL: update_todo called for user_id={user_id}, todo_id={todo_id}, current_title={current_title}")
    await db_manager.connect()
    result = await db_manager.update_todo(user_id, todo_id, current_title, title, description, completed)
    if not result:
        print("TOOL: update_todo failed (not found)")
        return {"error": "Todo not found or access denied. Direct update failed."}
    print("TOOL: update_todo success")
    return result

@mcp.tool()
async def delete_todo(user_id: str, todo_id: Optional[int] = None, title: Optional[str] = None, description: Optional[str] = None):
    """Delete a todo item for a specific user ID by ID, title, or description."""
    print(f"TOOL: delete_todo called for user_id={user_id}, todo_id={todo_id}, title={title}")
    await db_manager.connect()
    success = await db_manager.delete_todo(user_id, todo_id, title, description)
    if not success:
        print("TOOL: delete_todo failed (not found)")
        return {"error": "Todo not found or access denied"}
    print("TOOL: delete_todo success")
    return {"message": "Todo deleted successfully"}

@mcp.tool()
async def delete_all_todos(user_id: str):
    """Delete ALL todo items for a specific user ID."""
    print(f"TOOL: delete_all_todos called for user_id={user_id}")
    await db_manager.connect()
    success = await db_manager.delete_all_todos(user_id)
    if not success:
        print("TOOL: delete_all_todos failed")
        return {"error": "Failed to delete todos or already empty"}
    print("TOOL: delete_all_todos success")
    return {"message": "All todos deleted successfully"}

if __name__ == "__main__":
    mcp.run()
