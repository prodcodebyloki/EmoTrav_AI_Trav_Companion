from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models.request import TripRequest
from agents.orchestrator import run_trip_generation
import json

router = APIRouter()

@router.post("/generate")
async def generate_trip(request: TripRequest):
    async def event_stream():
        async for event in run_trip_generation(request):
            yield f"data: {json.dumps(event)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )
