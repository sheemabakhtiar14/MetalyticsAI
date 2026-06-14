from __future__ import annotations

import json
from pathlib import Path


SHARED_KEYS = {
    "production_amount",
    "useful_output",
    "waste_generated",
    "recovered_material",
    "recycled_content",
}

STATE_FILE = Path(__file__).with_name("shared_inputs.json")


def read_shared_inputs() -> dict:
    if not STATE_FILE.exists():
        return {}

    try:
        data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}

    return {key: data[key] for key in SHARED_KEYS if key in data}


def write_shared_inputs(values: dict) -> dict:
    current = read_shared_inputs()

    for key in SHARED_KEYS:
        if key not in values:
            continue
        try:
            current[key] = float(values[key])
        except (TypeError, ValueError):
            continue

    STATE_FILE.write_text(json.dumps(current, indent=2), encoding="utf-8")
    return current
