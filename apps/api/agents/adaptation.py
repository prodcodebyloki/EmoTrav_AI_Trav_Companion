import json
from google import genai
from config import GOOGLE_API_KEY
from models.request import AdaptationRequest

client = genai.Client(api_key=GOOGLE_API_KEY)

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

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt,
    )
    text = response.text.strip()
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
