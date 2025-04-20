# API

Package holding `reverse-djed` web API. This API should be used by the web app for work that requires access to external APIs (like Blockfrost and potentially Ogmios).

TODO:

- [ ] Separate Mainnet and Preprod production deployments.
- [ ] Deploy Mainnet and Preprod staging deployments of API and app per PR.
- [ ] Poll and cache order, pool and oracle UTxOs from SaaS Blockfrost and precompute as much data as possible.
- [ ] Failover to Demeter in case SaaS Blockfrost is down.
- [x] API endpoints.
  - [x] Get orders.
  - [x] Get protocol data.
  - [x] Get token action data.
  - [x] Mint DJED
  - [x] Burn DJED
  - [x] Mint SHEN
  - [x] Burn SHEN
  - [x] Cancel order
