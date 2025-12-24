
import requests
import json
import sys

BASE_URL = "http://localhost:8080"
EMAIL = "debug_user_" + str(sys.argv[1]) if len(sys.argv) > 1 else "debug1@test.com"
PASSWORD = "password"

def run_test():
    print(f"Testing with email: {EMAIL}")

    # 1. Signup
    print("1. Signup...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/signup", json={"email": EMAIL, "password": PASSWORD})
        print(f"   Status: {resp.status_code}")
    except Exception as e:
        print(f"   Failed to connect: {e}")
        return

    # 2. Login
    print("2. Login...")
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    print(f"   Status: {resp.status_code}")
    if resp.status_code != 200:
        print("   Login failed. Exiting.")
        return
    token = resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 3. Get Groups
    print("3. Get Groups...")
    resp = requests.get(f"{BASE_URL}/api/groups", headers=headers)
    print(f"   Status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"   Groups: {len(resp.json())}")
    else:
        print(f"   Error: {resp.text}")

    # 4. Create Group (if none)
    group_id = 1
    if resp.status_code == 200 and len(resp.json()) == 0:
        print("   Creating group...")
        resp = requests.post(f"{BASE_URL}/api/groups", headers=headers, json={"name": "Debug Group", "description": "Test", "isPrivate": False})
        print(f"   Status: {resp.status_code}")
        if resp.status_code == 200:
             group_id = resp.json().get("id")

    if resp.status_code == 200 and len(resp.json()) > 0:
        group_id = resp.json()[0].get("id")

    # 5. Get Messages
    print(f"5. Get Messages for Group {group_id}...")
    resp = requests.get(f"{BASE_URL}/api/groups/{group_id}/messages", headers=headers)
    print(f"   Status: {resp.status_code}")
    if resp.status_code != 200:
        print(f"   Error: {resp.text}")

if __name__ == "__main__":
    run_test()
