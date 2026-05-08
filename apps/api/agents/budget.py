from config import ACCOMMODATION_TIERS
from models.request import TripRequest

def get_accommodation_tier(budget_usd: float, days: int) -> str:
    daily = budget_usd / days
    if daily < 80:
        return "budget"
    elif daily <= 150:
        return "mid"
    return "premium"

def flag(spent: float, total: float) -> str:
    ratio = spent / total if total > 0 else 0
    if ratio < 0.8:
        return "on_track"
    elif ratio < 0.95:
        return "near_limit"
    return "over_budget"

async def build_budget(days: list[dict], request: TripRequest) -> dict:
    hard = request.hard_inputs
    city = hard.destination_city
    tier = get_accommodation_tier(hard.budget_usd, hard.days)
    nightly = ACCOMMODATION_TIERS.get(city, {}).get(tier, 80)

    daily_breakdown = []
    cat_totals = {"accommodation_usd": 0, "transport_usd": 0, "food_usd": 0, "experiences_usd": 0, "misc_usd": 0}

    for day in days:
        exps = day.get("experiences", [])
        food_cost = sum(e["estimated_cost_usd"] for e in exps if e["type"] == "food")
        exp_cost = sum(e["estimated_cost_usd"] for e in exps if e["type"] != "food")
        transport = 20
        misc = 10
        day_total = nightly + transport + food_cost + exp_cost + misc

        entry = {
            "day_number": day["day_number"],
            "accommodation_usd": nightly,
            "transport_usd": transport,
            "food_usd": food_cost,
            "experiences_usd": exp_cost,
            "misc_usd": misc,
            "day_total_usd": day_total,
            "flag": flag(day_total, hard.budget_usd / hard.days),
        }
        daily_breakdown.append(entry)
        for k in cat_totals:
            cat_totals[k] += entry[k]

    grand_total = sum(d["day_total_usd"] for d in daily_breakdown)
    remaining = hard.budget_usd - grand_total

    return {
        "total_budget_usd": hard.budget_usd,
        "days": hard.days,
        "daily_breakdown": daily_breakdown,
        "category_totals": cat_totals,
        "grand_total_usd": grand_total,
        "remaining_usd": remaining,
        "overall_flag": flag(grand_total, hard.budget_usd),
        "local_currency_hint": "",
        "warnings": ["Over budget — consider reducing experiences"] if remaining < 0 else [],
    }
