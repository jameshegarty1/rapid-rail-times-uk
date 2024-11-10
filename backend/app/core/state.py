# app/core/state.py
from typing import Optional
from app.simple_queue import AsyncTaskManager

class AppState:
    task_manager: Optional[AsyncTaskManager] = None

app_state = AppState()
