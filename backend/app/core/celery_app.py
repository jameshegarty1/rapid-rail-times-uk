from celery import Celery

celery_app = Celery("worker", broker="redis://redis:6379/0", backend="redis://redis:6379/0")

celery_app.conf.task_routes = {
    'app.tasks.get_train_routes_task': {'queue': 'main-queue'},
}
celery_app.conf.task_default_queue = 'main-queue'
celery_app.autodiscover_tasks(['app.tasks'])
