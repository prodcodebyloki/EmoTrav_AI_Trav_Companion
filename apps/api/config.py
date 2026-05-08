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
