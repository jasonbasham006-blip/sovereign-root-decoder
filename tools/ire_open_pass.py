#!/usr/bin/env python3
"""Even-rail open pass. Fractions parked. Unexpected 0 → negative wholes.

Does not LOCK. Does not close Clay. Does not change live CRT integers.
"""
from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dump" / "out"


def recover_unexpected_zero(coords, expect_nonzero=True):
    evens = []
    halves = 0
    for c in coords:
        if c % 2:
            halves += 1
            continue
        evens.append(c)
    core = 1
    for c in evens:
        core *= c
    if core != 0:
        return {"core": core, "recovered": core, "path": "even", "filled": [], "halves": halves}
    if not expect_nonzero:
        return {"core": 0, "recovered": 0, "path": "true-zero", "filled": [], "halves": halves}
    filled = []
    k = 1
    recovered = 1
    for c in evens:
        if c == 0:
            n = -2 * k
            filled.append(n)
            recovered *= n
            k += 1
        else:
            recovered *= c
    return {
        "core": 0,
        "recovered": recovered,
        "path": "negative-fill",
        "filled": filled,
        "halves": halves,
    }


def main() -> int:
    wd = subprocess.run([sys.executable, str(ROOT / "tools" / "ire_test_harness.py")])
    if wd.returncode != 0:
        print("OPEN_PASS FAIL watchdog")
        return 1

    sample = [2, -2, 4, -4, 2, 0, -2, 2, 4, -2, 0, 2]
    fill = recover_unexpected_zero(sample, True)
    truez = recover_unexpected_zero([2, 0, 4], False)
    if fill["path"] != "negative-fill" or fill["recovered"] != 65536 or fill["filled"] != [-2, -4]:
        print("OPEN_PASS FAIL neg-fill", fill)
        return 1
    if truez["path"] != "true-zero":
        print("OPEN_PASS FAIL true-zero", truez)
        return 1

    # OPEN hydro items — worked, not closed.
    queue = [
        {
            "id": "THM-SOBOLEV-GAP",
            "status": "OPEN",
            "note": "Ḣ^{1/2} is the half-bit (s=1). Local theory sits on even indices H^2, H^4. Parking the half does not promote F_101 to R^3. Millennium gap stays OPEN.",
        },
        {
            "id": "GATE-C-TO-A",
            "status": "FORBIDDEN",
            "note": "C→A stays dark. Even-rail work does not write regularity.",
        },
        {
            "id": "HARVEST-SQRT33",
            "status": "BOUNDED",
            "note": "√33 parked; /6 applied only at flush. Distinct from 2/3 ceiling.",
        },
    ]

    OUT.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M")
    report = {
        "pass": "OPEN_PASS",
        "watchdog": "PASS",
        "even_rail": True,
        "neg_fill": fill,
        "true_zero": truez,
        "queue": queue,
        "locked_untouched": [3398738, 463072246, 18, 5],
        "clay": "FORBIDDEN",
    }
    dest = OUT / f"{stamp}-open.json"
    dest.write_text(json.dumps(report, indent=2) + "\n")
    print("OPEN_PASS HOLD even-rail neg-fill=65536 true-zero=0")
    print("THM-SOBOLEV-GAP stays OPEN. C→A stays FORBIDDEN.")
    print("wrote", dest.name)
    return 0


if __name__ == "__main__":
    sys.exit(main())
