import json
from google import genai
from config import GOOGLE_API_KEY, CITY_COST_PROFILES, VIBE_BLOCKS

client = genai.Client(api_key=GOOGLE_API_KEY)

async def populate_experiences(skeleton: dict, request) -> dict:
    hard = request.hard_inputs
    soft = request.soft_inputs
    city = hard.destination_city
    costs = CITY_COST_PROFILES.get(city, {"meal": 10, "culture": 10, "outdoor": 5, "nightlife": 20})
    day_num = skeleton["day_number"]
    anchor_count = skeleton["anchor_count"]

    prompt = f"""
You are filling a travel day with real experiences.

City: {city} | Zone: {skeleton['location_zone']}
Day {day_num} theme: {skeleton['emotional_theme']}
Vibe: {soft.vibe} | {VIBE_BLOCKS[soft.vibe]}
Fill exactly {anchor_count} experiences.

City cost hints (USD): meal={costs['meal']}, culture={costs['culture']}, outdoor={costs['outdoor']}, nightlife={costs['nightlife']}

Return ONLY a JSON array, no prose, no markdown:
[
  {{
    "id": "exp_d{day_num}_01",
    "name": "Real venue name",
    "type": "food",
    "location": {{
      "name": "Venue name",
      "address": "Full street address",
      "lat": 0.0,
      "lng": 0.0,
      "neighborhood": "{skeleton['location_zone']}"
    }},
    "time_start": "09:00",
    "duration_minutes": 60,
    "estimated_cost_usd": {costs['meal']},
    "energy_score": 40,
    "vibe_tags": ["{soft.vibe}", "local"],
    "notes": "Why this place is worth visiting.",
    "alternatives": [
      {{"id": "alt_d{day_num}_01a", "name": "Backup venue name", "reason": "Why this works as backup"}}
    ]
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

    experiences = json.loads(text.strip())
    estimated_spend = sum(e.get("estimated_cost_usd", 0) for e in experiences)

    return {
        **skeleton,
        "experiences": experiences,
        "estimated_spend": estimated_spend,
    }
