# API

Package holding `reverse-djed` web API. This API should be used by the web app for work that requires access to external APIs (like Blockfrost and potentially Ogmios).

TODO:

- [ ] Poll and cache order, pool and oracle UTxOs from SaaS Blockfrost.
- [ ] Failover to Demeter in case SaaS Blockfrost is down.
- [ ] API endpoints.
  - [ ] Get orders.
  - [ ] Get pool.
  - [ ] Get oracle.
  - [ ] Mint DJED
  - [ ] Burn DJED
  - [ ] Mint SHEN
  - [ ] Burn SHEN
  - [ ] Cancel order

```
bun install
bun run dev
```

```
bun run deploy
```
