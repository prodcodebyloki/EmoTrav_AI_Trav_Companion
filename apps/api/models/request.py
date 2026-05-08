from pydantic import BaseModel, Field
from typing import Literal, Optional
from config import SUPPORTED_CITIES

SupportedCity = Literal[
    "Tokyo", "Mumbai", "Lisbon", "Mexico City",
    "Medellín", "Cape Town", "Melbourne", "Dubai"
]

class HardInputs(BaseModel):
    origin_city: str
    destination_city: SupportedCity
    budget_usd: float = Field(gt=0)
    days: int = Field(ge=2, le=10)
    group_size: int = Field(ge=1, le=20)
    transport: Literal["flight", "train", "car", "any"] = "any"

class SoftInputs(BaseModel):
    vibe: Literal["romantic", "adventurous", "healing", "chaotic", "social", "slow", "creative"]
    energy_level: Literal["low", "medium", "high"]
    spontaneity: Literal[1, 2, 3, 4, 5] = 3
    social_preference: Literal["solo", "small_group", "crowd"] = "solo"

class TripRequest(BaseModel):
    session_id: str
    hard_inputs: HardInputs
    soft_inputs: SoftInputs

class AdaptationRequest(BaseModel):
    session_id: str
    trigger: Literal["weather", "user_message", "manual"]
    trigger_detail: str
    target_day: Optional[int] = None
    user_message: Optional[str] = None
