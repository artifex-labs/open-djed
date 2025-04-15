# API

Package holding `reverse-djed` web API. This API should be used by the web app for work that requires access to external APIs (like Blockfrost and potentially Ogmios).

TODO:

- [x] Separate Mainnet and Preprod production deployments.
- [ ] Deploy Mainnet and Preprod staging deployments of API and app per PR.
- [ ] Poll and cache order, pool and oracle UTxOs from SaaS Blockfrost and precompute as much data as possible.
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
