import json
import csv
import re

INPUT_FILE = "submissions.json"
OUTPUT_FILE = "submissions_clean.csv"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

# Si le JSON est encapsulé dans une clé (ex: {"submissions": [...]}), décommente et ajuste :
# data = data["submissions"]

if not isinstance(data, list):
    raise ValueError("Le JSON de premier niveau n'est pas une liste. Vérifie sa structure.")

fieldnames = []
for item in data:
    for key in item.keys():
        if key not in fieldnames:
            fieldnames.append(key)

def clean_text(value):
    """Remplace tout saut de ligne / retour chariot / tabulation par un espace simple,
    et compresse les espaces multiples. Garantit qu'une ligne du CSV = une ligne du fichier."""
    if value is None:
        return ""
    text = str(value)
    text = text.replace("\r\n", " ").replace("\r", " ").replace("\n", " ").replace("\t", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text

def flatten_value(value):
    if isinstance(value, (dict, list)):
        return clean_text(json.dumps(value, ensure_ascii=False))
    return clean_text(value)

with open(OUTPUT_FILE, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=fieldnames,
        delimiter=",",
        quoting=csv.QUOTE_ALL,
        lineterminator="\n",  # force un terminateur de ligne cohérent
    )
    writer.writeheader()
    for item in data:
        row = {key: flatten_value(item.get(key)) for key in fieldnames}
        writer.writerow(row)

print(f"Export terminé : {OUTPUT_FILE} ({len(data)} lignes)")

# Vérification rapide : le nombre de lignes du fichier doit être = nombre de projets + 1 (en-tête)
with open(OUTPUT_FILE, encoding="utf-8-sig") as f:
    line_count = sum(1 for _ in f)
print(f"Vérification : {line_count} lignes dans le fichier (attendu: {len(data) + 1})")