import google.generativeai as genai
import json
from config import GOOGLE_API_KEY
from models.request import TripRequest

genai.configure(api_key=GOOGLE_API_KEY)

EMOTIONAL_THEMES = ["decompress", "exploration", "peak", "immersion", "wind-down", "spontaneous"]

SPONTANEITY_BLOCKS = {
    1: "Plan every hour. Use specific named venues. No open slots.",
    2: "Plan morning, afternoon, evening anchors. Soft time windows.",
    3: "Mix 3 anchors per day with open neighbourhood exploration zones.",
    4: "Max 2 anchors per day. Rest as neighbourhood moods, not venues.",
    5: "Day theme and zone only. No venue names. Sensory descriptions only.",
}

ANCHOR_COUNTS = {1: 6, 2: 5, 3: 3, 4: 2, 5: 1}

async def build_day_skeletons(request: TripRequest) -> list[dict]:
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

Return ONLY a JSON array, no prose:
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

    model = genai.GenerativeModel("gemini-2.0-flash-001")
    response = await model.generate_content_async(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
