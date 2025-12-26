
import requests
import json
import datetime

BASE_URL = "http://localhost:8080"
EMAIL = "admin@shadow.com"
PASSWORD = "admin123"

def debug_admin_messages():
    print(f"Logging in as {EMAIL}...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
        if resp.status_code != 200:
            print(f"Login failed: {resp.status_code} {resp.text}")
            return

        token = resp.json().get("token")
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        print("Fetching /api/shadow/messages...")
        resp = requests.get(f"{BASE_URL}/api/shadow/messages", headers=headers)

        if resp.status_code == 200:
            messages = resp.json()
            print(f"Success. Fetched {len(messages)} messages.")
            print("-" * 50)
            # Print top 5
            for i, msg in enumerate(messages[:5]):
                print(f"[{i}] ID: {msg.get('id')}, Time: {msg.get('createdAt')}, Msg: {msg.get('message')}")
            print("-" * 50)
        else:
            print(f"Fetch failed: {resp.status_code} {resp.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_admin_messages()
