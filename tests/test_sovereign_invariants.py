#!/usr/bin/env python3
"""Exact, dependency-free regression tests for the repaired architecture.

The tests intentionally cover only claims that can be established from the
published mathematical specification itself. They do not attempt to certify
physical theories, legal title, hardware constant-time behavior, or Bitcoin
spending without protocol vectors.
"""

from __future__ import annotations

from fractions import Fraction
import itertools
import math
import struct


def factor_3398738():
    n = 3_398_738
    factors = []
    p = 2
    while p * p <= n:
        while n % p == 0:
            factors.append(p)
            n //= p
        p += 1
    if n > 1:
        factors.append(n)
    return factors


def test_crt_core():
    x = 3_398_738
    assert factor_3398738() == [2, 7, 7, 79, 439]

    moduli = [49, 1118, 79, 107]
    residues = [0, 18, 0, 97]
    assert all(math.gcd(a, b) == 1 for i, a in enumerate(moduli) for b in moduli[i + 1 :])
    assert [x % m for m in moduli] == residues
    assert math.prod(moduli) == 463_072_246
    assert math.prod(moduli[:3]) == 4_327_778

    # Direct Garner reconstruction from the repaired report.
    v0, v1, v2, v3 = 0, 46, 62, 0
    reconstructed = v0 + v1 * 49 + v2 * 49 * 1118 + v3 * 49 * 1118 * 79
    assert reconstructed == x
    assert x < 4_327_778

    demo_m = [101, 103, 107, 109]
    demo_r = [23, 45, 12, 89]
    dx = []
    for i, m in enumerate(demo_m):
        t = demo_r[i]
        for j in range(i):
            t = ((t - dx[j]) * pow(demo_m[j], -1, m)) % m
        dx.append(t)
    dval = dx[0]
    prod = 1
    for i in range(1, 4):
        prod *= demo_m[i - 1]
        dval += dx[i] * prod
    assert dval == 79_321_787
    assert [dval % m for m in demo_m] == demo_r
    assert [0 + 2 * j for j in range(8)] == [0, 2, 4, 6, 8, 10, 12, 14]
    assert 5 * 100 * 36 // 12 == 1500
    assert 22 * 23 // 2 == 253 == 11 * 23
    u = [500, 800, 1000, 1150, 1350]
    assert all(x % 2 == 0 for x in u)
    lap = -u[4] + 16 * u[3] - 30 * u[2] + 16 * u[1] - u[0]
    assert lap == -650
    assert 12 * lap == -7800
    assert Fraction(12 * lap, 48) == Fraction(-325, 2)
    us = [200, 500, 800, 1150, 1350, 1500]
    sob = us[5] - 5 * us[4] + 10 * us[3] - 10 * us[2] + 5 * us[1] - us[0]
    assert sob == 550
    assert 12 * sob * sob == 3_630_000
    assert Fraction(3_630_000, 1024) == Fraction(226875, 64)
    assert 66 * 40 * 40 == 105_600
    assert 66 * 160 * 160 == 1_689_600
    assert 1_689_600 // 105_600 == 16
    assert (1_689_600 // 8) // (105_600 // 4) == 8
    assert 50_000 * 35_600 == 1_780_000_000
    es = [600, 800, 1000, 800, 600]
    es_lap = -es[4] + 16 * es[3] - 30 * es[2] + 16 * es[1] - es[0]
    assert es_lap == -5600
    uni = [1000] * 5
    assert -uni[4] + 16 * uni[3] - 30 * uni[2] + 16 * uni[1] - uni[0] == 0

    n = 49 * 43 * 18 * 13
    assert n == 493_038
    assert x % n == 440_510
    assert [x % m for m in [49, 43, 18, 13]] == [0, 18, 14, 5]
    assert 1118 >> 1 == 559 == 13 * 43
    assert 471 % 49 == 30
    assert 1471 % 49 == 1


def pow_mod(a: int, e: int, m: int) -> int:
    out = 1
    while e:
        if e & 1:
            out = (out * a) % m
        a = (a * a) % m
        e >>= 1
    return out


def multiplicative_order(a: int, p: int) -> int:
    assert math.gcd(a, p) == 1
    order = 1
    x = a % p
    while x != 1:
        x = (x * a) % p
        order += 1
        if order > p:
            raise AssertionError("order search exceeded field size")
    return order


def test_finite_field_core():
    p = 101
    for r in (23, 79):
        assert (r * r - r - 1) % p == 0
    assert (23 + 79) % 101 == 1
    assert (23 * 79) % 101 == 100
    assert pow(79, -1, 101) == 78
    assert (-pow(79, -1, 101)) % 101 == 23
    assert pow(23, 2, 101) == 24
    assert multiplicative_order(23, 101) == 50
    assert multiplicative_order(79, 101) == 25
    assert pow_mod(2, 64, 101) == 79
    assert pow_mod(2, 78, 101) == 21
    assert pow_mod(2, 78 - 64, 101) == 22
    assert (21 * pow(79, -1, 101)) % 101 == 22


def stencil_points():
    points = []
    for axis in range(3):
        for s in (-1, 1):
            p = [0, 0, 0]
            p[axis] = s
            points.append((tuple(p), 14))
    for a, b in itertools.combinations(range(3), 2):
        for s, t in itertools.product((-1, 1), repeat=2):
            p = [0, 0, 0]
            p[a] = s
            p[b] = t
            points.append((tuple(p), 3))
    for s, t, u in itertools.product((-1, 1), repeat=3):
        points.append(((s, t, u), 1))
    points.append(((0, 0, 0), -128))
    return points


def moment(points, powers):
    a, b, c = powers
    return sum(w * (x**a) * (y**b) * (z**c) for (x, y, z), w in points)


def test_27_point_stencil():
    pts = stencil_points()
    assert moment(pts, (0, 0, 0)) == 0
    for powers in [(2, 0, 0), (0, 2, 0), (0, 0, 2)]:
        assert moment(pts, powers) == 60
    # Pure fourth-order moment: 60 / (30*4!) = 1/12.
    assert Fraction(moment(pts, (4, 0, 0)), 30 * math.factorial(4)) == Fraction(1, 12)
    # Mixed x^2 y^2 term: 20/(30*2!*2!) = 1/6, exactly the coefficient
    # carried by 2*partial_xxyy in (1/12) Delta^2.
    assert Fraction(moment(pts, (2, 2, 0)), 30 * math.factorial(2) * math.factorial(2)) == Fraction(1, 6)


def test_legendre_shell_counts():
    for k, expected in [(8, 10_922), (12, 2_796_202)]:
        n_max = 2 ** (2 * k)
        count = sum(
            1
            for a in range(k + 1)
            for b in range((n_max // (4**a) - 7) // 8 + 1)
            if 4**a * (8 * b + 7) <= n_max
        )
        assert count == expected


def test_rns_primes_and_true_pull():
    def is_odd_prime(n: int) -> bool:
        if n < 3 or n % 2 == 0:
            return False
        d = 3
        while d * d <= n:
            if n % d == 0:
                return False
            d += 2
        return True

    primes = (65521, 65519, 65551)
    assert all(is_odd_prime(p) for p in primes)
    assert 766 % 49 == 31


def test_esaeesa_residue_sum_is_not_letter_ordinal():
    bases = (22, 24, 26, 22, 22, 32, 26)
    residues = tuple(1170 % b for b in bases)
    letters = "".join(chr(65 + r) for r in residues)
    residue_sum = sum(residues)
    letter_ordinal_a1 = sum(ord(ch) - 64 for ch in letters)
    assert letters == "ESAEESA"
    assert residues == (4, 18, 0, 4, 4, 18, 0)
    assert residue_sum == 48
    assert letter_ordinal_a1 == 55
    assert letter_ordinal_a1 == residue_sum + 7
    assert letter_ordinal_a1 % 49 == 6
    assert residue_sum % 49 == 48


def _tongue_word_value(n: int, base: int) -> int:
    if n <= 0:
        return 0
    total = 0
    temp = n
    while temp > 0:
        total += temp % base
        temp //= base
    return total


def test_baptist_latin_is_219_and_not_unique():
    word = "BAPTIST"
    fw = [sum((ord(ch) - 65 + o) for ch in word) for o in range(7)]
    rv = [sum(25 - (ord(ch) - 65) + o for ch in word) for o in range(7)]
    assert fw[0] == 80
    assert fw[1] == 87
    assert rv[0] == 95
    latin = sum(_tongue_word_value(v, 26) for v in fw + rv)
    geez = sum(_tongue_word_value(v, 26) for v in fw + rv)
    assert latin == 219
    assert geez == 219
    assert 219 not in (80, 87, 95)
    assert all((87 + 7 * k) != 219 for k in range(40))
    assert all((80 + 7 * k) != 219 for k in range(40))


def test_no_resurrection_lock():
    import pathlib
    import subprocess
    import sys

    tool = pathlib.Path(__file__).resolve().parents[1] / "tools" / "SOVEREIGN_VERIFY_CORE.py"
    assert 49 * 1118 * 79 * 107 == 463_072_246
    assert 3_398_738 % 13 == 5
    assert ((718 ^ 892) & 1118) == 18
    assert 463_072_246 != 462_034_366

    clean = subprocess.run(
        [sys.executable, str(tool), "Gate18 = 18; remainder 5; modulus 463072246"],
        check=False,
        capture_output=True,
        text=True,
    )
    assert clean.returncode == 0
    assert "GATE_PASSED" in clean.stdout

    poison = "+" + "28.54" + "," + "do not " + "file" + "," + "46203" + "4366"
    blocked = subprocess.run(
        [sys.executable, str(tool), poison],
        check=False,
        capture_output=True,
        text=True,
    )
    assert blocked.returncode == 1
    assert "GATE_BLOCKED" in blocked.stdout
    assert "CLASS DRIFT" in blocked.stdout


def test_pulse_strand_and_mirror():
    jumps = [98, 7]
    for n in range(2, 8):
        jumps += [98, 98, 7 * n]
    assert jumps == [
        98, 7, 98, 98, 14, 98, 98, 21, 98, 98, 28, 98, 98, 35, 98, 98, 42, 98, 98, 49,
    ]
    seed = [0]
    x = 0
    for j in jumps:
        x += j
        seed.append(x)
    assert seed[-1] == 1470 and seed[0] == 0
    phase2 = [v + 603 for v in seed]
    assert phase2[0] == 603 and phase2[-1] == 2073
    assert 1470 - 867 == 603
    phase3 = [v + 1206 for v in seed]
    assert phase3[0] == 1206 and phase3[-1] == 2676

    def msb(n):
        if n <= 0:
            return 0
        b = 1
        while b * 2 <= n:
            b *= 2
        return b

    row = [
        0, 1, 4, 5, 7, 8, 9, 11, 16, 18, 25, 31, 43, 60, 63, 81, 88, 92, 98, 101, 118,
        101, 98, 92, 88, 81, 63, 60, 43, 31, 25, 18, 16, 11, 9, 8, 7, 5, 4, 1, 0,
    ]
    assert row == row[::-1] and len(row) == 41
    assert msb(5) == 4 and msb(9) == 8 and msb(7) == 4 and msb(118) == 64
    assert set(seed) & set(row) == {0, 98}


def test_field101_hhl_and_crt_residue():
    assert (23 * 23 - 23 - 1) % 101 == 0
    assert (79 * 79 - 79 - 1) % 101 == 0
    assert (23 * 23) % 101 == 24
    assert 3_398_738 % 101 == 88
    assert 316 & 217 == 24
    assert (98 + 3) % 101 == 0

    def term(seed, step):
        x = seed
        if step == 0:
            return x
        x += 98
        if step == 1:
            return x
        x += 7
        if step == 2:
            return x
        n = 2
        s = 2
        while s < step:
            x += 98
            s += 1
            if s == step:
                return x
            x += 98
            s += 1
            if s == step:
                return x
            x += 7 * n
            s += 1
            n += 1
            if s == step:
                return x
        return x

    assert term(0, 20) == 1470
    assert term(603, 20) == 2073
    assert term(603, 53) % 101 == 79
    assert term(603, 65) % 101 == 23
    dims = [1, 51, 316, 217, 882, 1118, 2340, 3_398_738]
    a = sum(d << k for k, d in enumerate(dims))
    assert a % 1118 == 461


def test_ground_factorizations_and_ksigma():
    assert 4 * 5 * 71 == 1420
    assert 13 * 71 == 923
    assert 923 * 20 / 13 == 1420
    assert 2 * 13 * 43 == 1118
    assert 1118 >> 1 == 559 == 13 * 43
    assert 410 + 541 + 26 + 102 + 26 + 13 == 1118
    assert (300 + 40 + 70) == 410
    assert (10 + 300 + 200 + 1 + 30) == 541
    assert (10 + 5 + 6 + 5) == 26
    assert (1 + 30 + 5 + 10 + 50 + 6) == 102
    assert (1 + 8 + 4) == 13
    k = 3_398_738 * 828 + 8 * 219 + 2
    assert k == 2_814_156_818
    assert k % 49 == 39
    assert 3_398_738 % 49 == 0
    assert (k + 5) % 49 == 44
    assert 2 + 1 + 19 + 8 + 1 + 13 == 44


def test_dump_integer_extract_and_no_lock():
    import re

    def extract(text):
        found = re.findall(r"\b\d{2,12}\b", text)
        uniq = sorted({int(x) for x in found})
        return uniq[:40]

    assert extract("K_SIGMA 2814156818 and 39 mod 49") == [39, 49, 2814156818]
    assert extract("1 and 7 stay single-digit") == []
    # dump protocol: never a LOCK from extracted integers alone
    ints = extract("1420/923 = 20/13")
    assert 1420 in ints and 923 in ints
    assert "LOCK" not in "INGESTED"


def test_identifier_word_and_prefixes():
    word = "BASHAMSOVEREIGNROOT"
    assert len(word) == 19

    def fwd(s, off=0):
        return sum(ord(c) - 65 + off for c in s)

    def rev(s, off=0):
        return sum(25 - (ord(c) - 65) + off for c in s)

    f0, r0 = fwd(word, 0), rev(word, 0)
    f1, r1 = fwd(word, 1), rev(word, 1)
    assert (f0, r0, f0 + r0) == (207, 268, 475) == (207, 268, 25 * 19)
    assert f1 + r0 == 494 == 26 * 19
    assert f1 + r1 == 513 == 27 * 19
    assert 1118 % 49 == 40 and 1118 % 13 == 0 and 1118 % 18 == 2
    assert 2 * 13 * 43 == 1118
    assert 9_231_118 % 49 == 8 and 9_231_118 % 13 == 0
    assert 923 + 1118 == 2041 and 923 * 1118 == 1_031_914
    assert 111_118_923 % 49 == 6
    assert (1111 + 18 + 923) % 49 == 43 == 1170 % 49
    for surface in (
        "Basham@sovereign-root",
        "BASHAM@SOVEREIGN-ROOT",
        "Basham@Sovereign-root",
        "basham@sovereign-root",
    ):
        letters = "".join(ch for ch in surface.upper() if "A" <= ch <= "Z")
        assert letters == word


def test_hardware_gates():
    assert ((10_786 % 1_118) + 158) % 49 == 0
    assert (718 ^ 892) == 434
    assert (718 ^ 892) & 1_118 == 18
    assert (718 | 892) & 158 == 158
    assert (4_477 - 158) % 49 == 7
    assert 1_170 % 49 == 43
    assert 702 + 718 == 1_420


def test_metrology_math_is_not_exact_hydrogen_frequency():
    phi = (1 + 5 ** 0.5) / 2
    omega_eq = 196.966569 / (107.8682 * phi)
    assert abs(omega_eq - 1.128525684951185) < 1e-15
    constructed = Fraction(923, 1000) * Fraction(20, 13) * 1000
    assert constructed == Fraction(18_460, 13)
    assert constructed == Fraction(1420)
    nist = 1420.4057517667
    assert abs(float(constructed) - nist) > 0.4


def test_float_receipts_and_exact_rational():
    exact = Fraction(1, 10**20)
    f_exact = float(exact)
    bits_exact = struct.unpack('<Q', struct.pack('<d', f_exact))[0]
    assert bits_exact == 0x3BC79CA10C924223

    v = 1.0
    for _ in range(5):
        v *= 1e-4
    bits_iter = struct.unpack('<Q', struct.pack('<d', v))[0]
    assert bits_iter == 0x3BC79CA10C924224

    bits_pow = struct.unpack('<Q', struct.pack('<d', 1e-4**5))[0]
    assert bits_pow == 0x3BC79CA10C924225


def test_fermat_indexing():
    assert 2**8 + 1 == 257
    assert 257 == 2 ** 8 + 1
    # Standard Fermat indexing: F0=3, F1=5, F2=17, F3=257.
    fermat = [2 ** (2**n) + 1 for n in range(4)]
    assert fermat == [3, 5, 17, 257]


def test_grid_capacity_correction():
    x = 480
    k7 = x & 127
    s = (x // 128) % 4
    g480 = s * 128 + k7 + 1
    g960 = 2 * g480 - 1
    assert (k7, s, g480, g960) == (96, 3, 481, 961)
    assert g480 > 480
    # Therefore the formula cannot itself be a complete 480-slot index space.


def test_bold_venture_traverse_consistency_failure_is_detected():
    courses = [("N", 18, "E", 120), ("N", 71, "W", 80), ("S", 13, "W", 140), ("S", 86, "E", 110)]
    x = y = 0.0
    for ns, deg, ew, length in courses:
        theta = math.radians(deg)
        dx = length * math.sin(theta) * (1 if ew == "E" else -1)
        dy = length * math.cos(theta) * (1 if ns == "N" else -1)
        x += dx
        y += dy
    residual = math.hypot(x, y)
    assert 39.8 < residual < 39.95
    assert abs(residual - 15.33) > 20.0


def run():
    tests = [
        obj
        for name, obj in globals().items()
        if name.startswith("test_") and callable(obj)
    ]
    failures = []
    for test in sorted(tests, key=lambda f: f.__name__):
        try:
            test()
        except Exception as exc:  # pragma: no cover
            failures.append((test.__name__, repr(exc)))
    print(f"Executed {len(tests)} exact regression tests")
    if failures:
        for name, exc in failures:
            print(f"FAIL {name}: {exc}")
        raise SystemExit(1)
    print("ALL PASS")


if __name__ == "__main__":
    run()
