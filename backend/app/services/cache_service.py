from cachetools import TTLCache
import threading
import json

class CacheService:
    def __init__(self, ttl_seconds=120):  # 2 minutes TTL as per your Redis setup
        self.cache = TTLCache(maxsize=1000, ttl=ttl_seconds)
        self._lock = threading.Lock()
    
    def get(self, key):
        value = self.cache.get(key)
        if value:
            return json.loads(value)
        return None
    
    def setex(self, key, expiry, value):
        with self._lock:
            self.cache[key] = value
