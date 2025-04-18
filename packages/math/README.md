TODO:

- [x] `shenADARate` and `adaSHENRate`
- [x] `shenADAMintRate` and `shenADABurnRate`
  - [ ] Figure out where fee field comes from and pass "right" object.
- [x] `djedADARate` and `adaDJEDRate`
- [x] `djedADAMintRate` and `djedADABurnRate`
  - [ ] Figure out where fee field comes from and pass "right" object.
- [x] `reserveRatio`
- [ ] Figure out whether `maxReserveRatio` and `minReserveRatio` are configurable.
- [x] `maxDJEDMintAmount`
- [x] `maxSHENMintAmount`
- [x] `maxSHENBurnAmount`
- [ ] Figure out operator fees.
- [ ] Generalize code:
  - [ ] Single method supporting mint, burn, djed, shen instead of four separate methods.
  - [ ] Refer to DJED as stablecoins, SHEN as reserve coins.
