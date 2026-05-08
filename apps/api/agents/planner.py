import json
from google import genai
from config import GOOGLE_API_KEY, ANCHOR_COUNTS, SPONTANEITY_BLOCKS

client = genai.Client(api_key=GOOGLE_API_KEY)

async def build_day_skeletons(request) -> list[dict]:
    hard = request.hard_inputs
    soft = request.soft_inputs

    prompt = f"""
You are a travel planner. Build a {hard.days}-day skeleton itinerary for {hard.destination_city}.

Vibe: {soft.vibe} | Energy: {soft.energy_level} | Spontaneity: {soft.spontaneity}/5
Budget: ${hard.budget_usd} total | Group: {hard.group_size}

RULES:
- Day 1 theme: always "decompress" or "exploration"
- Last day theme: always "wind-down" or "immersion"
- energy_curve: array of 18 integers (06:00-23:00), each 0-100
- Match energy_curve to energy_level: low=20-50, medium=30-70, high=50-90
- anchor_count for spontaneity {soft.spontaneity}: {ANCHOR_COUNTS[soft.spontaneity]}
- Spontaneity behaviour: {SPONTANEITY_BLOCKS[soft.spontaneity]}

Return ONLY a JSON array, no prose, no markdown:
[
  {{
    "day_number": 1,
    "emotional_theme": "decompress",
    "energy_curve": [0,0,10,20,30,40,50,55,60,55,50,45,60,55,50,40,30,20],
    "location_zone": "Shimokitazawa, {hard.destination_city}",
    "transport_between": "base",
    "anchor_count": {ANCHOR_COUNTS[soft.spontaneity]}
  }}
]
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
