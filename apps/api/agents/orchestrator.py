from typing import AsyncGenerator
from models.request import TripRequest
from agents.planner import build_day_skeletons
from agents.experience import populate_experiences
from agents.budget import build_budget
from datetime import datetime, timezone
import asyncio

async def run_trip_generation(request: TripRequest) -> AsyncGenerator[dict, None]:
    session_id = request.session_id
    ts = lambda: datetime.now(timezone.utc).isoformat()

    try:
        day_skeletons = await build_day_skeletons(request)

        days = []
        for skeleton in day_skeletons:
            day_plan = await populate_experiences(skeleton, request)
            days.append(day_plan)
            yield {
                "type": "day_ready",
                "session_id": session_id,
                "timestamp": ts(),
                "payload": day_plan,
            }
            await asyncio.sleep(0.05)

        budget = await build_budget(days, request)
        yield {
            "type": "budget_update",
            "session_id": session_id,
            "timestamp": ts(),
            "payload": {"type": "budget_update", "budget": budget},
        }

        yield {
            "type": "complete",
            "session_id": session_id,
            "timestamp": ts(),
            "payload": {
                "session_id": session_id,
                "destination_city": request.hard_inputs.destination_city,
                "days": days,
                "budget": budget,
                "generated_at": ts(),
            },
        }

    except Exception as e:
        yield {
            "type": "error",
            "session_id": session_id,
            "timestamp": ts(),
            "payload": {
                "code": "AGENT_FAILURE",
                "message": str(e),
                "resume_from_day": None,
                "retryable": True,
            },
        }
