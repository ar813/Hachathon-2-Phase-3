import os
import asyncpg
from typing import List, Optional, Dict
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("NEON_CONNECTION_STRING")

class DatabaseManager:
    def __init__(self):
        self.pool = None

    async def connect(self):
        if not self.pool:
            self.pool = await asyncpg.create_pool(DATABASE_URL, ssl='require')

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

    async def get_todos(self, user_id: str) -> List[Dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, title, description, completed FROM todos WHERE user_id = $1 ORDER BY created_at DESC",
                user_id
            )
            return [dict(row) for row in rows]

    async def add_todo(self, user_id: str, title: str, description: Optional[str] = None, completed: bool = False) -> Dict:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "INSERT INTO todos (user_id, title, description, completed) VALUES ($1, $2, $3, $4) RETURNING id, title, description, completed",
                user_id, title, description, completed
            )
            return dict(row)

    async def update_todo(self, user_id: str, todo_id: Optional[int] = None, current_title: Optional[str] = None, title: Optional[str] = None, description: Optional[str] = None, completed: Optional[bool] = None) -> Optional[Dict]:
        async with self.pool.acquire() as conn:
            # Resolve the todo_id if not provided but current_title is
            target_id = todo_id
            if target_id is None and current_title is not None:
                target_id = await conn.fetchval(
                    "SELECT id FROM todos WHERE user_id = $1 AND title = $2 LIMIT 1",
                    user_id, current_title
                )
            
            if target_id is None:
                return None

            # Verify ownership and existence
            exists = await conn.fetchval("SELECT 1 FROM todos WHERE id = $1 AND user_id = $2", target_id, user_id)
            if not exists:
                return None

            update_fields = []
            params = [target_id]
            
            if title is not None:
                params.append(title)
                update_fields.append(f"title = ${len(params)}")
            if description is not None:
                params.append(description)
                update_fields.append(f"description = ${len(params)}")
            if completed is not None:
                params.append(completed)
                update_fields.append(f"completed = ${len(params)}")
            
            if not update_fields:
                return await conn.fetchrow("SELECT id, title, description, completed FROM todos WHERE id = $1", target_id)

            query = f"UPDATE todos SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, title, description, completed"
            row = await conn.fetchrow(query, *params)
            return dict(row)

    async def delete_todo(self, user_id: str, todo_id: Optional[int] = None, title: Optional[str] = None, description: Optional[str] = None) -> bool:
        async with self.pool.acquire() as conn:
            if todo_id is not None:
                result = await conn.execute("DELETE FROM todos WHERE id = $1 AND user_id = $2", todo_id, user_id)
            elif title is not None:
                # Use ILIKE for case-insensitive matching
                result = await conn.execute("DELETE FROM todos WHERE title ILIKE $1 AND user_id = $2", title, user_id)
            elif description is not None:
                result = await conn.execute("DELETE FROM todos WHERE description ILIKE $1 AND user_id = $2", description, user_id)
            else:
                return False
                
            return result.startswith("DELETE") and result != "DELETE 0"

    async def delete_all_todos(self, user_id: str) -> bool:
        async with self.pool.acquire() as conn:
            result = await conn.execute("DELETE FROM todos WHERE user_id = $1", user_id)
            # result returns 'DELETE n' where n is the number of rows deleted
            return result.startswith("DELETE")

db_manager = DatabaseManager()
