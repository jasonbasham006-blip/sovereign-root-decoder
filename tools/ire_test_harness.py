#!/usr/bin/env python3
"""IRE watchdog harness. Locked integers only. No Clay, no keys, no title."""
from __future__ import annotations

import hashlib
import math
import sys

LIVE_X = 3_398_738
LIVE_MODULI = [49, 1118, 79, 107]
LIVE_RES = [0, 18, 0, 97]
DEMO_MODULI = [101, 103, 107, 109]
DEMO_RES = [23, 45, 12, 89]
SEED = "BASHAM_BEAUCHAMP_SOVEREIGN_ROOT"
HASHES = {
    241: "967b6637715c6e246b59e1f37c5f3fd791fd4324d3345d799f5e3c5c15d76a7b",
    244: "e86a5b0a0e31a264cd4bfe982612bf1a68337c3b4ea413b57f9fd2c3843ad2ce",
    247: "62233114db0d6c5845275ebff3b639c569ed551c8244789520f022006619fff4",
    250: "6b5415b18c45aa2aa423e79db62ec0de9e4a5eacf10999ddc48d9e23e45464a8",
    253: "cb3cdb6c46bb981c1f8078f76fc1a7227cdfaa22b54beebbb62aedbde171ecc9",
}


def garner(moduli, residues):
    x = []
    for i, m in enumerate(moduli):
        t = residues[i]
        for j in range(i):
            t = ((t - x[j]) * pow(moduli[j], -1, m)) % m
        x.append(t)
    value = x[0]
    prod = 1
    for i in range(1, len(moduli)):
        prod *= moduli[i - 1]
        value += x[i] * prod
    return x, value


def rail(n: int) -> str:
    return "ODD_RAIL_HALF" if n % 2 else "EVEN_RAIL_WHOLE"


def main() -> int:
    fails = []
    if (718 ^ 892) != 434:
        fails.append("xor")
    if ((718 ^ 892) & 1118) != 18:
        fails.append("gate18")
    if (718 | 892) != 1022:
        fails.append("or")
    if [LIVE_X % m for m in LIVE_MODULI] != LIVE_RES:
        fails.append("live residues")
    if math.prod(LIVE_MODULI) != 463_072_246:
        fails.append("M")
    if LIVE_X % 13 != 5:
        fails.append("x mod 13")
    coeffs, recon = garner(LIVE_MODULI, LIVE_RES)
    if recon != LIVE_X or coeffs != [0, 46, 62, 0]:
        fails.append(f"live garner {coeffs} {recon}")
    _, demo = garner(DEMO_MODULI, DEMO_RES)
    if demo != 79_321_787:
        fails.append("demo garner")
    if 5 * 100 * 36 // 12 != 1500:
        fails.append("holding 1/12")
    sample = [2, -2, 4, -4, 2, 0, -2, 2, 4, -2, 0, 2]
    evens = [c for c in sample if c % 2 == 0]
    rec, k = 1, 1
    filled = []
    for c in evens:
        if c == 0:
            n = -2 * k
            filled.append(n)
            rec *= n
            k += 1
        else:
            rec *= c
    if filled != [-2, -4] or rec != 65536:
        fails.append(f"neg-fill {filled} {rec}")
        fails.append("holding 1/12")
    if [0 + 2 * j for j in range(8)] != [0, 2, 4, 6, 8, 10, 12, 14]:
        fails.append("even walk")
    if 241 % 2 == 0 or 244 != 4 * 61 or 247 != 13 * 19 or 250 != 2 * 125 or 253 != 11 * 23:
        fails.append("index factors")
    if 22 * 23 // 2 != 253:
        fails.append("T22")
    for n, expect in HASHES.items():
        payload = f"ORIGIN_0::{SEED}::INDEX_{n}::{rail(n)}"
        got = hashlib.sha256(payload.encode()).hexdigest()
        if got != expect:
            fails.append(f"hash {n}")
    if (3_398_738 * 828 + 8 * 219 + 2) % 49 != 39:
        fails.append("k_sigma")
    if 923 * 20 != 1420 * 13:
        fails.append("r18")
    if fails:
        print("IRE_WATCHDOG FAIL:", ", ".join(fails))
        return 1
    print("IRE_WATCHDOG PASS origin=0 step=2 live_garner=3398738 demo=79321787 holding=1500")
    print("GATE integers hold. Clay forbidden. access_vector=false. seed is a label.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
