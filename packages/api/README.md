# API

Package holding `reverse-djed` web API. This API should be used by the web app for work that requires access to external APIs (like Blockfrost and potentially Ogmios).

TODO:

- [ ] Action on `main` to update API on push
- [ ] Separate Mainnet and Preprod production deployments.
- [ ] Custom domain `api.djed.artifex.finance` and `preprod.api.djed.artifex.finance` instead of hard-coded GCR URL.
- [ ] Read-through cache to avoid spamming SaaS Blockfrost.
- [ ] Deploy Mainnet and Preprod staging deployments of API and app per PR.
- [x] API endpoints.
  - [x] Get orders.
  - [x] Get protocol data.
  - [x] Get token action data.
  - [x] Mint DJED
  - [x] Burn DJED
  - [x] Mint SHEN
  - [x] Burn SHEN
  - [x] Cancel order
