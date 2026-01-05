from mcp.server.fastmcp import FastMCP
from db_manager import db_manager
from typing import Optional

# Create an MCP server
mcp = FastMCP("TodoManager")

@mcp.tool()
async def fetch_todos(user_id: str):
    """Fetch all todos for a specific user ID."""
    await db_manager.connect()
    return await db_manager.get_todos(user_id)

@mcp.tool()
async def add_todo(user_id: str, title: str, description: Optional[str] = None, completed: Optional[bool] = False):
    """Add a new todo for a specific user ID with an optional completion status."""
    await db_manager.connect()
    return await db_manager.add_todo(user_id, title, description, completed or False)

@mcp.tool()
async def update_todo(user_id: str, todo_id: Optional[int] = None, current_title: Optional[str] = None, title: Optional[str] = None, description: Optional[str] = None, completed: Optional[bool] = None):
    """Update an existing todo's title, description, or status for a specific user ID. Identify by todo_id or current_title."""
    await db_manager.connect()
    result = await db_manager.update_todo(user_id, todo_id, current_title, title, description, completed)
    if not result:
        return {"error": "Todo not found or access denied. Direct update failed."}
    return result

@mcp.tool()
async def delete_todo(user_id: str, todo_id: Optional[int] = None, title: Optional[str] = None, description: Optional[str] = None):
    """Delete a todo item for a specific user ID by ID, title, or description."""
    await db_manager.connect()
    success = await db_manager.delete_todo(user_id, todo_id, title, description)
    if not success:
        return {"error": "Todo not found or access denied"}
    return {"message": "Todo deleted successfully"}

@mcp.tool()
async def delete_all_todos(user_id: str):
    """Delete ALL todo items for a specific user ID."""
    await db_manager.connect()
    success = await db_manager.delete_all_todos(user_id)
    if not success:
        return {"error": "Failed to delete todos or already empty"}
    return {"message": "All todos deleted successfully"}

if __name__ == "__main__":
    mcp.run()
