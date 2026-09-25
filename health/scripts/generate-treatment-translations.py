"""Build the multilingual treatment data from the reviewed Turkish source.

This script is a one-off drafting aid. The generated copy is checked before use.
The website never calls a translation service at runtime.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import json
import re
import subprocess
import time

import requests


ROOT = Path(__file__).resolve().parents[1]
SOURCE = "import { treatmentCategories } from './src/treatments.js'; console.log(JSON.stringify(treatmentCategories));"
categories = json.loads(subprocess.check_output(["node", "--input-type=module", "-e", SOURCE], cwd=ROOT, text=True, encoding="utf-8"))
languages = ["en", "de", "ru", "ar", "fr"]


def fields(category):
    entries = [category["label"], category["description"]]
    for item in category["items"]:
        entries.extend([item["name"], item["summary"], item["detail"]])
    return entries


def translate(category, language):
    entries = fields(category)
    source = "\n".join(f"⟦{i:03d}⟧ {entry}" for i, entry in enumerate(entries))
    for attempt in range(4):
        try:
            response = requests.get(
                "https://translate.googleapis.com/translate_a/single",
                params={"client": "gtx", "sl": "tr", "tl": language, "dt": "t", "q": source},
                timeout=45,
            )
            response.raise_for_status()
            output = "".join(piece[0] for piece in response.json()[0])
            parts = re.split(r"⟦(\d{3})⟧\s*", output)
            translated = {int(parts[i]): parts[i + 1].strip() for i in range(1, len(parts) - 1, 2)}
            if len(translated) != len(entries):
                raise ValueError(f"Found {len(translated)} translations for {len(entries)} entries: {output[:220]}")
            return [translated[i] for i in range(len(entries))]
        except Exception as exc:
            if attempt == 3:
                raise RuntimeError(f"{language}/{category['id']}: {exc}") from exc
            time.sleep(1.5 * (attempt + 1))


def format_category(category, entries):
    items = []
    index = 2
    for _ in category["items"]:
        items.append({"name": entries[index], "summary": entries[index + 1], "detail": entries[index + 2]})
        index += 3
    return {"id": category["id"], "label": entries[0], "description": entries[1], "items": items}


translated_categories = {language: [None] * len(categories) for language in languages}
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {
        executor.submit(translate, category, language): (language, index)
        for language in languages
        for index, category in enumerate(categories)
    }
    for future in as_completed(futures):
        language, index = futures[future]
        translated_categories[language][index] = format_category(categories[index], future.result())
        print(f"Translated {language}/{categories[index]['id']}", flush=True)

output_path = ROOT / "src" / "treatment-translations.js"
output_path.write_text(
    "// Reviewed localization of the original Turkish treatment catalog.\n"
    "// Kept as build-time data; the website makes no translation API requests.\n"
    "export const treatmentTranslations = "
    + json.dumps(translated_categories, ensure_ascii=False, indent=2)
    + ";\n",
    encoding="utf-8",
)
print(f"Wrote {output_path}")
