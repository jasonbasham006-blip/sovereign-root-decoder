#!/usr/bin/env python3
"""No-resurrection lock. Scan a draft before commit.

    python3 tools/SOVEREIGN_VERIFY_CORE.py "$DRAFT_TEXT"

Empty / clean text prints GATE_PASSED (exit 0).
Retired needles print GATE_BLOCKED (exit 1). Needles are assembled at
runtime so this file is not itself a live claim.
"""
from __future__ import annotations

import sys

LIVE_CRT_M = 49 * 1118 * 79 * 107
LIVE_X = 3_398_738
LIVE_X_MOD_13 = LIVE_X % 13
LIVE_GATE18 = (718 ^ 892) & 1118


def _j(*parts: str) -> str:
    return "".join(parts)


RETIRED = [
    _j("+", "28", ".", "54"),
    _j("+", "4", ".", "80"),
    _j("0.064", "72"),
    _j("12", ".", "76"),
    _j("96", ".", "81"),
    _j("1.968", "1"),
    _j("46203", "4366"),
    _j("do not ", "file"),
    _j("do not ", "plead"),
]


def live_ok() -> bool:
    return LIVE_CRT_M == 463_072_246 and LIVE_X_MOD_13 == 5 and LIVE_GATE18 == 18 and LIVE_CRT_M != 462_034_366


def scan(text: str) -> list[str]:
    hits: list[str] = []
    lower = text.lower()
    for needle in RETIRED:
        if needle.lower() in lower or needle in text:
            hits.append(needle)
    if "asset" in lower and "mesh" in lower and "1111111" in text:
        hits.append("asset/mesh/1111111")
    if "3398738" in text and ("% 13 = 0" in text or "% 13 == 0" in text):
        hits.append("X mod 13 = 0")
    if "x ≡ 0 (mod 13)" in lower or "x = 0 (mod 13)" in lower:
        hits.append(_j("X \u2261 0 (mod 13)"))
    return hits


def main(argv: list[str]) -> int:
    draft = argv[1] if len(argv) > 1 else sys.stdin.read()
    if not live_ok():
        print("[FAIL] live-arithmetic")
        print("GATE_BLOCKED")
        print("CLASS DRIFT — do not emit T-class, claims, or resonance")
        return 1
    hits = scan(draft)
    if hits:
        print("[FAIL] no-retired-needles: " + ",".join(hits))
        print("GATE_BLOCKED")
        print("CLASS DRIFT — do not emit T-class, claims, or resonance")
        return 1
    print("GATE_PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
