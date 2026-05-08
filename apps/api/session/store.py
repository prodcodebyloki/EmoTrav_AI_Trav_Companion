from cachetools import TTLCache
from threading import Lock
from config import SESSION_TTL_SECONDS

_cache: TTLCache = TTLCache(maxsize=500, ttl=SESSION_TTL_SECONDS)
_lock = Lock()

def get_session(session_id: str) -> dict | None:
    with _lock:
        return _cache.get(session_id)

def set_session(session_id: str, data: dict) -> None:
    with _lock:
        _cache[session_id] = data

def delete_session(session_id: str) -> None:
    with _lock:
        _cache.pop(session_id, None)
