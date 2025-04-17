# Txs

Package holding `reverse-djed` transaction builders.

TODO:
- [x] `createOrder`: Create a new UTxO at the order address, containing a `DjedOrderTicket` token and ADA, DJED or SHEN, depending on the order type.
  - [x] `mintDJED`: Create a new UTxO at the order address, containing a `DjedOrderTicket` token and ADA.
    - [x] Use `DjedOrderToken` minting policy reference script.
  - [x] `burnDJED`: Create a new UTxO at the order address, containing a `DjedOrderTicket` token and the DJED to burn.
  - [x] `mintSHEN`: Create a new UTxO at the order address, containing a `DjedOrderTicket` token and ADA.
  - [x] `burnSHEN`: Create a new UTxO at the order address, containing a `DjedOrderTicket` token and the SHEN to burn.
- [ ] `fulfillOrder`: Spend a order UTxO, containing a `DjedOrderTicket` token and ADA, DJED or SHEN, depending on the order type, burn the `DjedOrderTicket` token and spend the pool UTxO, sending the offered ADA, DJED or SHEN to the pool address in a new UTxO and the requested ADA, DJED or SHEN to the order owner.
  - [ ] `mintDJED`: Spend a order UTxO, containing a `DjedOrderTicket` token and ADA, burn the `DjedOrderTicket` token and spend the pool UTxO, sending the offered ADA to the pool address in a new UTxO and the requested DJED to the order owner.
  - [ ] `burnDJED`
  - [ ] `mintSHEN`: Spend a order UTxO, containing a `DjedOrderTicket` token and ADA, burn the `DjedOrderTicket` token and spend the pool UTxO, sending the offered ADA to the pool address in a new UTxO and the requested SHEN to the order owner.
  - [ ] `burnSHEN`
- [x] `cancelOrder`
  - [x] by owner of order
  - [ ] by order processor
  - [x] `mintDJED`
  - [x] `burnDJED`
  - [x] `mintSHEN`
  - [x] `burnSHEN`
- [ ] Use chain time instead of local time (`Date.now()` causes issues when blocks aren't produced for a while).
- [ ] Stop hard-coding fees (currently just in registry).
- [ ] Stop hard-coding reference UTxOs (currently just in registry).
- [ ] Stop hard-coding asset IDs - separate token names from policy IDs.
- [ ] Stop hard-coding order validator address (use script hash wherever possible).
- [x] Consider operator fees for mint transactions.
- [ ] Consider operator fees for burn transactions.