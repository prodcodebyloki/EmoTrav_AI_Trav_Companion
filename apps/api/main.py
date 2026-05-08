from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import trip, adapt, session

app = FastAPI(title="EmoTrav API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://emotrav-web-*.run.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trip.router, prefix="/trip", tags=["trip"])
app.include_router(adapt.router, prefix="/trip", tags=["adapt"])
app.include_router(session.router, prefix="/session", tags=["session"])

@app.get("/health")
def health():
    return {"status": "ok"}
