import google.generativeai as genai
import json
from config import GOOGLE_API_KEY
from models.request import AdaptationRequest

genai.configure(api_key=GOOGLE_API_KEY)

async def run_adaptation(request: AdaptationRequest) -> dict:
    prompt = f"""
You are the AdaptationAgent. A trigger has fired. Make minimum changes needed.

Trigger: {request.trigger}
Detail: {request.trigger_detail}
Target day: {request.target_day or 'all affected'}
User message: {request.user_message or 'n/a'}

Return ONLY a JSON AdaptationDiff:
{{
  "trigger": "{request.trigger}",
  "trigger_detail": "{request.trigger_detail}",
  "affected_days": [],
  "summary": "One-line summary of what changed",
  "changes": []
}}

If no change needed, return empty changes array with explanation in summary.
"""

    model = genai.GenerativeModel("gemini-2.0-flash-001")
    response = await model.generate_content_async(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
