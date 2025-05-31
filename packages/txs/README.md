# Txs

Package holding `reverse-djed` transaction builders.

TODO:

- [ ] ~~`processOrder`: Spend a order UTxO, containing a `DjedOrderTicket` token and ADA, DJED or SHEN, depending on the order type, burn the `DjedOrderTicket` token and spend the pool UTxO, sending the offered ADA, DJED or SHEN to the pool address in a new UTxO and the requested ADA, DJED or SHEN to the order owner.~~ After spiking this issue, we realized this process is centralized and therefor offers us no value to complete.
- [x] `cancelOrder`
  - [ ] ~~by order processor~~. After spiking order processing, we realized this process is centralized and therefor offers us no value to complete.
- Registry:
  - [ ] Stop hard-coding fees (currently just in registry).
  - [ ] Stop hard-coding reference UTxOs (currently just in registry). Either:
    - Dynamically query for reference UTxOs.
    - Or create unspendable reference UTxOs at a proof-of-burn address and hard-code these instead.
  - [ ] Stop hard-coding asset IDs - separate token names from policy IDs.
  - [ ] Stop hard-coding order validator address (use script hash wherever possible).
