import os
import asyncio
from typing import List
from loguru import logger
from functools import wraps
from asyncio import Queue
from concurrent.futures import ThreadPoolExecutor
from app.services.train_service import get_train_routes
from app.exceptions import TrainServiceException

task_queue = Queue()
thread_pool = ThreadPoolExecutor(max_workers=3)  

async def run_in_thread(func, *args, **kwargs):
    return await asyncio.get_event_loop().run_in_executor(
        thread_pool, 
        func,
        *args
    )

class AsyncTaskManager:
    def __init__(self):
        self.tasks = {}
        self.results = {}
        self._worker_task = None
    
    async def start(self):
        """Start the task worker"""
        if self._worker_task is None:
            self._worker_task = asyncio.create_task(self._worker())
            logger.info("Task worker started")

    async def stop(self):
        """Stop the task worker"""
        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
            self._worker_task = None
            logger.info("Task worker stopped")

    async def _worker(self):
        """Main worker loop processing tasks from the queue"""
        while True:
            try:
                task_id, func, args, kwargs = await task_queue.get()
                logger.info(f"Starting task {task_id}")
                
                try:
                    # Run the synchronous function in a thread pool
                    result = await run_in_thread(func, *args, **kwargs)
                    self.results[task_id] = {
                        'status': 'completed',
                        'result': result
                    }
                    logger.info(f"Task {task_id} completed successfully")
                except TrainServiceException as e:
                    self.results[task_id] = {
                        'status': 'failed',
                        'result': {'status_code': e.status_code, 'detail': e.detail}
                    }
                    logger.error(f"Task {task_id} failed: {e}")
                except Exception as e:
                    self.results[task_id] = {
                        'status': 'failed',
                        'result': {'status_code': 500, 'detail': str(e)}
                    }
                    logger.error(f"Task {task_id} failed with unexpected error: {e}")
                finally:
                    task_queue.task_done()
                    
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker error: {e}")
                await asyncio.sleep(1)  # Prevent tight loop on repeated errors

    async def get_result(self, task_id: str, timeout: float = None):
        """Get task result with optional timeout"""
        start_time = asyncio.get_event_loop().time()
        while timeout is None or (asyncio.get_event_loop().time() - start_time) < timeout:
            if task_id in self.results:
                return self.results[task_id]
            await asyncio.sleep(0.1)
        raise TimeoutError("Task result not available within timeout")


# Task decorator
def async_task(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        task_id = f"task_{id(func)}_{id(args)}_{id(kwargs)}"
        await task_queue.put((task_id, func, args, kwargs))
        return task_id
    return wrapper

# Your converted task
@async_task
def get_train_routes_task(origins: List[str], destinations: List[str], forceFetch: bool):
    """
    Async version of the train routes task.
    Returns the task ID immediately, use get_result to fetch the actual result.
    """
    return get_train_routes(origins, destinations, forceFetch)

