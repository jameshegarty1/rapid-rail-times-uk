import requests
from fastapi import HTTPException

API_URL = "https://api.nationalrail.co.uk/api/train_schedule"  # Update with actual endpoint
API_KEY = "55435278-c2e4-4799-8636-ffbe1136dcae"

def get_train_recommendations(origin: str, destination: str):
    try:
        response = requests.get(
            API_URL,
            params={"origin": origin, "destination": destination, "api_key": API_KEY}
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

