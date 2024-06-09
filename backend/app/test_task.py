from tasks import get_train_routes_task

result = get_train_routes_task.delay(['origin1'], ['destination1'])
print(result.get(timeout=10)) 
