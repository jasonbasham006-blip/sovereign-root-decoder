#!/usr/bin/env python3
"""Generate the 98-pulse strand. Not the Drive palindrome. Arithmetic only."""

JUMPS = [98, 7]
for n in range(2, 8):
    JUMPS += [98, 98, 7 * n]
OFFSET = 603


def pulse_phase(k: int) -> list[int]:
    x = k * OFFSET
    out = [x]
    for j in JUMPS:
        x += j
        out.append(x)
    return out


def pulse_strand(phases: int) -> list[int]:
    out: list[int] = []
    for k in range(phases):
        out.extend(pulse_phase(k))
    return out


if __name__ == "__main__":
    import sys

    n = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    for k in range(n):
        p = pulse_phase(k)
        print(f"phase {k}: {p[0]} .. {p[-1]} ({len(p)} terms)")
    print("strand", pulse_strand(n))
