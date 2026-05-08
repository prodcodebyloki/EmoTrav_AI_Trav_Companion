import asyncio
from datetime import datetime, timezone
from typing import AsyncGenerator
from models.request import TripRequest
from agents.planner import build_day_skeletons
from agents.experience import populate_experiences
from agents.budget import build_budget


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


async def run_trip_generation(request: TripRequest) -> AsyncGenerator[dict, None]:
    session_id = request.session_id

    try:
        day_skeletons = await build_day_skeletons(request)

        # Populate all days in parallel — faster than sequential Gemini calls
        tasks = [populate_experiences(s, request) for s in day_skeletons]
        results = await asyncio.gather(*tasks)

        days = []
        for day_plan in results:
            days.append(day_plan)
            yield {
                "type": "day_ready",
                "session_id": session_id,
                "timestamp": _ts(),
                "payload": day_plan,
            }

        budget = await build_budget(days, request)
        yield {
            "type": "budget_update",
            "session_id": session_id,
            "timestamp": _ts(),
            "payload": {"type": "budget_update", "budget": budget},
        }

        yield {
            "type": "complete",
            "session_id": session_id,
            "timestamp": _ts(),
            "payload": {
                "session_id": session_id,
                "destination_city": request.hard_inputs.destination_city,
                "days": days,
                "budget": budget,
                "generated_at": _ts(),
            },
        }

    except Exception as e:
        yield {
            "type": "error",
            "session_id": session_id,
            "timestamp": _ts(),
            "payload": {
                "code": "AGENT_FAILURE",
                "message": str(e),
                "resume_from_day": None,
                "retryable": True,
            },
        }
