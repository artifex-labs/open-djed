# Txs

Package holding DJED transaction builders.

TODO:

- Registry:
  - [ ] Stop hard-coding fees (currently just in registry).
  - [ ] Stop hard-coding reference UTxOs (currently just in registry). Either:
    - Dynamically query for reference UTxOs.
    - Or create unspendable reference UTxOs at a proof-of-burn address and hard-code these instead.
  - [ ] Stop hard-coding asset IDs - separate token names from policy IDs.
  - [ ] Stop hard-coding order validator address (use script hash wherever possible).
