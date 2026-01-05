import os
import asyncio
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# App imports
from agent_service import run_agent_with_user
from db_manager import db_manager

load_dotenv()

app = FastAPI(title="Agent API")

# Allow requests from your Next.js dev server
origins = [
    "http://localhost:3000",
    "https://hachathon-2-phase-3.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db_manager.connect()

@app.on_event("shutdown")
async def shutdown():
    await db_manager.disconnect()

class AskRequest(BaseModel):
    prompt: str
    userId: str
    history: list = []
    actionHistory: list = []

class AskResponse(BaseModel):
    reply: str

@app.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest):
    print("DEBUG: Received /ask request")
    prompt = req.prompt.strip()
    user_id = req.userId.strip()
    history = req.history
    action_history = req.actionHistory
    
    # Store action history in asyncio loop for agent_service to pick up (simplest way without refactoring run_agent_with_user signature)
    import asyncio
    asyncio.recent_actions_list = [f"- {a['type']}: {a['details']} ({a['timestamp']})" for a in action_history]

    print(f"DEBUG: user_id={user_id}, prompt={prompt}")
    logging.info(f"Incoming request: user_id={user_id}, prompt='{prompt[:50]}...', history_len={len(history)}")
    
    if not prompt:
        raise HTTPException(status_code=400, detail="Empty prompt")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required for security isolation")

    try:
        logging.info("Calling agent service...")
        reply = await run_agent_with_user(prompt, user_id, history)
        logging.info("Agent responded successfully")
    except Exception as e:
        logging.exception(f"Agent service failed for user {user_id}")
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")

    return {"reply": reply or "I'm sorry, I couldn't generate a response."}
