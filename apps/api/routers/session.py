from fastapi import APIRouter
from session.store import get_session

router = APIRouter()

@router.get("/ping/{session_id}")
def ping(session_id: str):
    exists = get_session(session_id) is not None
    return {"session_id": session_id, "active": exists}
