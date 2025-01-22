import os
import asyncio
from typing import List, Any, Dict, Tuple, Callable
from functools import wraps
from asyncio import Queue
from concurrent.futures import ThreadPoolExecutor
import structlog
from time import time
from app.exceptions import TrainServiceException

# Create module logger
log = structlog.get_logger("async.queue")

# Initialize task queue and thread pool
task_queue: Queue = Queue()
thread_pool = ThreadPoolExecutor(max_workers=3)


async def run_in_thread(func: Callable, *args, **kwargs) -> Any:
    """Run a synchronous function in the thread pool."""
    return await asyncio.get_event_loop().run_in_executor(
        thread_pool,
        func,
        *args
    )


class AsyncTaskManager:
    def __init__(self):
        self.tasks: Dict[str, Dict] = {}
        self.results: Dict[str, Dict] = {}
        self._worker_task = None
        self.log = log.bind(component="task_manager")

    async def start(self):
        """Start the task worker."""
        if self._worker_task is None:
            self._worker_task = asyncio.create_task(self._worker())
            self.log.info("task_manager.worker.started")

    async def stop(self):
        """Stop the task worker."""
        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
            self._worker_task = None
            self.log.info("task_manager.worker.stopped")

    async def _worker(self):
        """Main worker loop processing tasks from the queue."""
        while True:
            try:
                task_id, func, args, kwargs = await task_queue.get()
                task_log = self.log.bind(
                    task_id=task_id,
                    function=func.__name__
                )

                start_time = time()
                task_log.info("task_manager.task.started")

                try:
                    # Run the synchronous function in a thread pool
                    result = await run_in_thread(func, *args, **kwargs)
                    duration = time() - start_time

                    self.results[task_id] = {
                        'status': 'completed',
                        'result': result,
                        'duration': duration
                    }

                    task_log.info(
                        "task_manager.task.completed",
                        duration=round(duration, 3)
                    )

                except TrainServiceException as e:
                    self.results[task_id] = {
                        'status': 'failed',
                        'result': {
                            'status_code': e.status_code,
                            'detail': e.detail
                        }
                    }
                    task_log.error(
                        "task_manager.task.failed",
                        error=str(e),
                        error_type="TrainServiceException",
                        status_code=e.status_code
                    )

                except Exception as e:
                    self.results[task_id] = {
                        'status': 'failed',
                        'result': {
                            'status_code': 500,
                            'detail': str(e)
                        }
                    }
                    task_log.error(
                        "task_manager.task.failed",
                        error=str(e),
                        error_type=type(e).__name__,
                        exc_info=True
                    )

                finally:
                    task_queue.task_done()

            except asyncio.CancelledError:
                self.log.info("task_manager.worker.cancelled")
                break

            except Exception as e:
                self.log.error(
                    "task_manager.worker.error",
                    error=str(e),
                    error_type=type(e).__name__,
                    exc_info=True
                )
                await asyncio.sleep(1)  # Prevent tight loop on repeated errors

    async def get_result(self, task_id: str, timeout: float = None) -> Dict[str, Any]:
        """Get task result with optional timeout."""
        log_ctx = self.log.bind(task_id=task_id, timeout=timeout)

        start_time = asyncio.get_event_loop().time()
        while timeout is None or (asyncio.get_event_loop().time() - start_time) < timeout:
            if task_id in self.results:
                result = self.results[task_id]
                log_ctx.debug(
                    "task_manager.result.retrieved",
                    status=result['status']
                )
                return result
            await asyncio.sleep(0.1)

        log_ctx.warning("task_manager.result.timeout")
        raise TimeoutError("Task result not available within timeout")


def async_task(func: Callable) -> Callable:
    """Decorator to convert a function into an async task."""

    @wraps(func)
    async def wrapper(*args, **kwargs):
        task_id = f"task_{id(func)}_{id(args)}_{id(kwargs)}"

        task_log = log.bind(
            task_id=task_id,
            function=func.__name__
        )

        task_log.debug(
            "task_manager.task.queued",
            args_count=len(args),
            kwargs_count=len(kwargs)
        )

        await task_queue.put((task_id, func, args, kwargs))
        return task_id

    return wrapper