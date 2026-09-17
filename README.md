# Sovereign Root Decoder

Bitwise-deterministic research engine **v16.17**.

Public clone: [github.com/jasonbasham006-blip/sovereign-root-decoder](https://github.com/jasonbasham006-blip/sovereign-root-decoder)

This is a **research baseline**, not a legal filing, not a wallet, and not a Navier–Stokes regularity proof. Arithmetic that recomputes from integers is marked verified. Physics, title, and Taproot spending stay quarantined.

```bash
git clone https://github.com/jasonbasham006-blip/sovereign-root-decoder.git
```

## Authority boundary

- Exact integer / finite-field identities may be certified.
- A physical claim needs an independent model (NIST, BKM, etc.).
- A title claim needs the statute and the primary record.
- A finite sample is not a universal theorem.

See `SECURITY.md`. No private keys, WIF, or spending credentials are in this tree. The RNS token is `SHA-256("SOVEREIGN_ROOT_TEST_FIXTURE_NOT_A_KEY")`.

## What other agents should read first

| Path | Contents |
| --- | --- |
| `src/lib/decoder/hydro-alpha.ts` | Functional trichotomy: (A) pointwise χ² ≤ 2/3; (B) integrated S–enstrophy unbounded on A⁸(α) |
| `src/lib/decoder/hydro-int.ts` | Volume averages m₄₀₀ = 3/35, m₂₂₂ = 1/315 as (N, D) pairs |
| `src/lib/decoder/bitshift.ts` | Bit-shift protocol: S(k,s)=2k+s, 1118 ≫ 1 = 559 = 13×43, 480-grid → 481 |
| `src/lib/decoder/planes.ts` | Eight operational planes with 2026-09-17 statuses |
| `src/lib/decoder/proofs.ts` | L6 gates |
| `tests/test_sovereign_invariants.py` | Exact regression tests (CRT, F_101, stencil, gates) |

## Hydro lock (do not merge)

| Id | Object | Bound |
| --- | --- | --- |
| (A) | pointwise P² / (‖S‖² ‖ω‖⁴) | **2/3** |
| (B) | (∫P)² / (∫‖S‖² ∫‖ω‖²) on A⁸(α) | **∞** (min at α=0 is 730080/60615149) |
| P₇ 143/7¹¹ | claimed SOS bound | **falsified** as a bound for (B) |

Algebraic `923 × 20/13 = 1420` is exact. NIST hydrogen is `1420.4057517667 MHz`. Those are not equal. `23² ≡ 24 (mod 101)`, not 79.

## Run

```bash
npm install
npm run dev
npm run typecheck
python3 tests/test_sovereign_invariants.py
```

Decoder kernels: `src/lib/decoder/`. UI: `src/components/`.

## Status

`T1_LOCKED` · fail-closed · bitwise-deterministic · SEA-CORRECTED-2026-09-17
