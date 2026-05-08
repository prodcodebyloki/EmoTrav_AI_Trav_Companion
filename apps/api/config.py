from dotenv import load_dotenv
import os

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
NEXT_PUBLIC_API_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:3000")

SESSION_TTL_SECONDS = 1800  # 30 min

SUPPORTED_CITIES = [
    "Tokyo", "Mumbai", "Lisbon", "Mexico City",
    "Medellín", "Cape Town", "Melbourne", "Dubai"
]

CITY_CURRENCY_MAP = {
    "Tokyo": "JPY",
    "Mumbai": "INR",
    "Lisbon": "EUR",
    "Mexico City": "MXN",
    "Medellín": "COP",
    "Cape Town": "ZAR",
    "Melbourne": "AUD",
    "Dubai": "AED",
}

CITY_COST_PROFILES = {
    "Tokyo":       {"meal": 15, "culture": 12, "outdoor": 5,  "nightlife": 25},
    "Mumbai":      {"meal": 6,  "culture": 5,  "outdoor": 3,  "nightlife": 15},
    "Lisbon":      {"meal": 14, "culture": 10, "outdoor": 4,  "nightlife": 18},
    "Mexico City": {"meal": 8,  "culture": 8,  "outdoor": 4,  "nightlife": 15},
    "Medellín":    {"meal": 7,  "culture": 5,  "outdoor": 5,  "nightlife": 12},
    "Cape Town":   {"meal": 12, "culture": 10, "outdoor": 6,  "nightlife": 20},
    "Melbourne":   {"meal": 18, "culture": 15, "outdoor": 5,  "nightlife": 22},
    "Dubai":       {"meal": 25, "culture": 20, "outdoor": 10, "nightlife": 40},
}

ACCOMMODATION_TIERS = {
    "Tokyo":       {"budget": 45, "mid": 110, "premium": 220},
    "Mumbai":      {"budget": 20, "mid": 60,  "premium": 150},
    "Lisbon":      {"budget": 35, "mid": 90,  "premium": 180},
    "Mexico City": {"budget": 25, "mid": 70,  "premium": 160},
    "Medellín":    {"budget": 20, "mid": 55,  "premium": 130},
    "Cape Town":   {"budget": 30, "mid": 85,  "premium": 200},
    "Melbourne":   {"budget": 40, "mid": 110, "premium": 240},
    "Dubai":       {"budget": 80, "mid": 180, "premium": 400},
}

ANCHOR_COUNTS = {1: 6, 2: 5, 3: 3, 4: 2, 5: 1}

SPONTANEITY_BLOCKS = {
    1: "Plan every hour. Use specific named venues. No open slots.",
    2: "Plan morning, afternoon, evening anchors with named venues. Soft time windows.",
    3: "Mix 3 named anchor experiences per day with open neighbourhood exploration zones.",
    4: "Max 2 anchor experiences per day. Rest as neighbourhood moods, not venues.",
    5: "Day theme and zone only. No venue names. Sensory descriptions only.",
}

VIBE_BLOCKS = {
    "romantic":    "Intimate restaurants, sunset viewpoints, wine bars, slow walks. No chains, no crowds.",
    "adventurous": "Street food, local transport, markets, things hard to find. No hotel restaurants.",
    "healing":     "Parks, temples, spas, quiet cafés, bookshops, nature. Low crowds, gentle pace.",
    "chaotic":     "Night markets, street food, crowded spots, rooftop bars. Alive and unpredictable.",
    "social":      "Communal dining, live music, walking tours, neighbourhood bars. No solo-only spots.",
    "slow":        "One neighbourhood only. Max 3 experiences. Long lunches. Nothing before 09:00.",
    "creative":    "Street art, galleries, design shops, craft workshops. No chains, no generic sites.",
}
