import google.generativeai as genai
import json
from config import GOOGLE_API_KEY, CITY_COST_PROFILES

genai.configure(api_key=GOOGLE_API_KEY)

VIBE_BLOCKS = {
    "romantic": "Intimate restaurants, sunset viewpoints, wine bars, slow walks. No chains, no crowds.",
    "adventurous": "Street food, local transport, markets, things hard to find. No hotel restaurants.",
    "healing": "Parks, temples, spas, quiet cafés, bookshops, nature. Low crowds, gentle pace.",
    "chaotic": "Night markets, street food, crowded spots, rooftop bars. Alive and unpredictable.",
    "social": "Communal dining, live music, walking tours, neighbourhood bars. No solo-only spots.",
    "slow": "One neighbourhood only. Max 3 experiences. Long lunches. Nothing before 09:00.",
    "creative": "Street art, galleries, design shops, craft workshops. No chains, no generic sites.",
}

async def populate_experiences(skeleton: dict, request) -> dict:
    hard = request.hard_inputs
    soft = request.soft_inputs
    city = hard.destination_city
    costs = CITY_COST_PROFILES.get(city, {"meal": 10, "culture": 10, "outdoor": 5, "nightlife": 20})

    prompt = f"""
You are filling a travel day with real experiences.

City: {city} | Zone: {skeleton['location_zone']}
Day {skeleton['day_number']} theme: {skeleton['emotional_theme']}
Vibe: {soft.vibe} | {VIBE_BLOCKS[soft.vibe]}
Fill exactly {skeleton['anchor_count']} experiences.

City cost hints (USD): meal={costs['meal']}, culture={costs['culture']}, outdoor={costs['outdoor']}, nightlife={costs['nightlife']}

Return ONLY a JSON array of Experience objects:
[
  {{
    "id": "exp_d{skeleton['day_number']}_01",
    "name": "Venue name",
    "type": "food",
    "location": {{
      "name": "Venue name",
      "address": "Full address",
      "lat": 0.0,
      "lng": 0.0,
      "neighborhood": "{skeleton['location_zone']}"
    }},
    "time_start": "09:00",
    "duration_minutes": 60,
    "estimated_cost_usd": {costs['meal']},
    "energy_score": 40,
    "vibe_tags": ["{soft.vibe}", "local"],
    "notes": "Why this place matters.",
    "alternatives": [
      {{"id": "alt_d{skeleton['day_number']}_01a", "name": "Alternative venue", "reason": "Backup option"}}
    ]
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

    experiences = json.loads(text.strip())
    estimated_spend = sum(e.get("estimated_cost_usd", 0) for e in experiences)

    return {
        **skeleton,
        "experiences": experiences,
        "estimated_spend": estimated_spend,
    }
