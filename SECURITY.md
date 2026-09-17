# Security boundary

Never commit:

- private keys or seed phrases
- WIF exports
- raw signing material
- production wallet descriptors
- API tokens or cloud credentials

A scalar of `1` is not a safe Taproot signing key. BIP341 requires the secret-key tweak.

The hex in `src/lib/decoder/compilation.ts` is a public test fixture:

`SHA-256("SOVEREIGN_ROOT_TEST_FIXTURE_NOT_A_KEY")`

It is used only as an RNS residue source. It is not a spending key.

P2PKH Base58 and Taproot v1 Bech32m are different address types.
