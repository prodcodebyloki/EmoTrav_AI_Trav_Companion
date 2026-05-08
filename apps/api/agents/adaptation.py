from gemini import client, parse_gemini_json
from models.request import AdaptationRequest

async def run_adaptation(request: AdaptationRequest) -> dict:
    prompt = f"""
You are the AdaptationAgent. A trigger has fired. Make minimum changes needed.

Trigger: {request.trigger}
Detail: {request.trigger_detail}
Target day: {request.target_day or 'all affected'}
User message: {request.user_message or 'n/a'}

Return ONLY a JSON AdaptationDiff, no prose, no markdown:
{{
  "trigger": "{request.trigger}",
  "trigger_detail": "{request.trigger_detail}",
  "affected_days": [],
  "summary": "One-line summary of what changed",
  "changes": []
}}
"""

    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt,
    )
    return parse_gemini_json(response.text)
