"""Draft five complete interface localizations from the Turkish source.

Run only during authoring. The site uses the generated static module.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import json
import re
import subprocess
import time

import requests


ROOT = Path(__file__).resolve().parents[1]
SOURCE = "import { trMessages } from './src/i18n.js'; console.log(JSON.stringify(trMessages));"
turkish = json.loads(subprocess.check_output(["node", "--input-type=module", "-e", SOURCE], cwd=ROOT, text=True, encoding="utf-8"))
languages = ["en", "de", "ru", "ar", "fr"]


def flatten(node, path=()):
    if isinstance(node, str):
        yield path, node
    elif isinstance(node, dict):
        for key, value in node.items():
            yield from flatten(value, path + (key,))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            yield from flatten(value, path + (index,))


fields = list(flatten(turkish))
chunks = []
chunk = []
length = 0
for field in fields:
    if length + len(field[1]) > 3200 and chunk:
        chunks.append(chunk)
        chunk = []
        length = 0
    chunk.append(field)
    length += len(field[1])
if chunk:
    chunks.append(chunk)


def translate_chunk(language, chunk_index, fields_chunk):
    entries = [value.replace("{count}", "ZZCNTZZ") for _, value in fields_chunk]
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
            return [translated[i].replace("ZZCNTZZ", "{count}").replace("ZZCNTZ", "{count}") for i in range(len(entries))]
        except Exception as exc:
            if attempt == 3:
                raise RuntimeError(f"{language}/{chunk_index}: {exc}") from exc
            time.sleep(1.5 * (attempt + 1))


def assign(node, path, value):
    dest = node
    for part in path[:-1]:
        dest = dest[part]
    dest[path[-1]] = value


localizations = {language: json.loads(json.dumps(turkish, ensure_ascii=False)) for language in languages}
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {
        executor.submit(translate_chunk, language, index, chunk): (language, index, chunk)
        for language in languages
        for index, chunk in enumerate(chunks)
    }
    for future in as_completed(futures):
        language, index, original = futures[future]
        for (path, _), value in zip(original, future.result()):
            assign(localizations[language], path, value)
        print(f"Translated {language}/chunk-{index + 1}", flush=True)

output = ROOT / "src" / "page-translations.js"
output.write_text(
    "// Static interface localizations. No translation requests are made at runtime.\n"
    "export const pageTranslations = "
    + json.dumps(localizations, ensure_ascii=False, indent=2)
    + ";\n",
    encoding="utf-8",
)
print(f"Wrote {output}")
