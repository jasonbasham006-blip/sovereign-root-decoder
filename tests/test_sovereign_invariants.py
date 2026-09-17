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
