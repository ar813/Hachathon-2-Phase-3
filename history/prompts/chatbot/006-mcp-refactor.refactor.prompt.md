---
id: 006
title: MCP-Based Agent Refactor
stage: refactor
date: 2026-01-03
surface: agent
model: gemini-2.0-flash-exp
feature: chatbot-mcp
branch: main
user: ARSALAN KHAN
command: mcp-refactor
labels: [mcp, refactor, security, agent-tools]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - backend/db_manager.py
  - backend/mcp_tools.py
  - backend/agent_service.py
  - backend/server.py
  - backend/requirements.txt
  - app/(components)/Chatbot.tsx
tests_yaml:
  - manual verification in dashboard
prompt_text: |
  I want to connect my AI agent to a database so it can read and manage user todos only, using OpenAI Agent Tools. 
  Official MCP SDK (Mandatory). 
  Backend in Python Only. 
  Use Multiple Files (Very Important). 
  User Isolation via User-ID.
response_text: |
  Successfully refactored the backend into a modular, multi-file architecture using the Official MCP SDK. 
  The agent now interacts with todos exclusively through MCP-exposed tools, ensuring strict user isolation and security.
outcome: completed
evaluation: success
---
Refactored the agent to use MCP for all database interactions, ensuring privacy and modularity.
JazakAllah!
