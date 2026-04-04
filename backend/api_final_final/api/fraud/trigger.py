

import requests


API_URL = "http://127.0.0.1:8000/score"

def get_credit_score(gstin: str) -> dict:
    try:
        response = requests.get(f"{API_URL}/{gstin}")
        response.raise_for_status()  
        return response.json()
    except requests.exceptions.RequestException as e:
        print("API call failed:", e)
        return {}

if __name__ == "__main__":
    gstin_input = input("Enter GSTIN to score: ").strip()
    result = get_credit_score(gstin_input)
    print("Credit scoring result:")
    for k, v in result.items():
        print(f"{k}: {v}")
