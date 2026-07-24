import requests
import csv
import json
import time

BASE_URL = "https://api.emergent.sh/api/v0/contests/fabrizio/submissions"

HEADERS = {
    "accept": "*/*",
    "accept-language": "fr-CA,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "content-type": "application/json",
    "origin": "https://app.emergent.sh",
    "referer": "https://app.emergent.sh/",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
}

# Colle ici les cookies nécessaires si l'API en a besoin (cf_clearance, __cf_bm...)
COOKIES = {
    "cf_clearance": "TON_COOKIE_ICI",
}

all_submissions = []
limit = 50
offset = 0

while True:
    params = {"limit": limit, "offset": offset, "trending": "false"}
    resp = requests.get(BASE_URL, headers=HEADERS, cookies=COOKIES, params=params)
    resp.raise_for_status()
    data = resp.json()

    # Ajuste selon la vraie structure de la réponse — inspecte data.keys() au besoin
    items = data.get("submissions") or data.get("data") or data.get("items") or []

    if not items:
        break

    all_submissions.extend(items)
    print(f"Récupéré {len(items)} projets (offset {offset}) — total: {len(all_submissions)}")

    if len(items) < limit:
        break

    offset += limit
    time.sleep(0.5)  # évite de spammer l'API

print(f"\nTotal final: {len(all_submissions)} projets")

# Export JSON complet (structure brute)
with open("submissions.json", "w", encoding="utf-8") as f:
    json.dump(all_submissions, f, ensure_ascii=False, indent=2)

# Export CSV si les champs sont plats
if all_submissions:
    with open("submissions.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=all_submissions[0].keys())
        writer.writeheader()
        writer.writerows(all_submissions)

print("Fichiers exportés: submissions.json / submissions.csv")