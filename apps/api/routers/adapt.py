from fastapi import APIRouter
from models.request import AdaptationRequest
from agents.adaptation import run_adaptation

router = APIRouter()

@router.post("/adapt")
async def adapt_trip(request: AdaptationRequest):
    diff = await run_adaptation(request)
    return diff
