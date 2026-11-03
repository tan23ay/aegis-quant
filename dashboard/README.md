# AEGIS QUANT

An accessible, responsive research workspace based on **AEGIS QUANT — Master Specification V4.0 (Merged and Hardened)**. This delivery is an interactive **static website demonstration** using synthetic fixtures. It is not the complete trading platform described in that specification.

## Open locally

Install Node.js 18 or newer, open this folder in a terminal, then run:

```sh
npm run preview
```

Open the local address printed by the preview server. No package installation or external service credentials are required. `server.mjs` serves the files for local review; it is not a production financial backend.

## Explore the workspace

The workspace includes Overview, Global Markets, Comparison, Opportunity Scanner, Trading Terminal, AI Agent Center, Strategy Laboratory, Backtest Explorer, Portfolio & P&L, Risk Controls, Execution Quality and Infrastructure & Data Health. Settings are available as a utility view.

Use the market filters and search, inspect opportunity details, compare predefined order sizes and cost scenarios, preview a simulated order, explore sample strategies, pause demo order entry and export sample records. Monetary figures, chart series, source statuses and timing examples are labeled as synthetic or modeled. Sample timestamps describe the fixtures, not a live feed.

Equity comparison uses a shared reference quote and hypothetical broker costs. Crypto comparison shows sample venue scenarios. Sample fee schedules and FX assumptions are unverified and are not current legal, tax or provider advice.

## Demo limits

- No live market-data feed, connected broker, order-submission adapter or real trading mode.
- No production backend, authentication, account permissions, database, durable OMS, ledger, secure credentials service or reconciliation service.
- Agent cards illustrate a research workflow; no autonomous agents or external LLM runs are operating.
- Strategy and backtest views are predefined synthetic examples; no model training or historical backtest is executed.
- Order-size and scenario controls preview predefined examples. They do not estimate executable market liquidity or establish profitability.
- Risk pause controls this website's demo session only. It is not an account-level emergency stop and cannot cancel real orders or liquidate positions.
- Watchlist preferences use this browser's local storage. Demo state is not a secure or shared account record.
- Synthetic returns and metrics demonstrate the interface. They are not evidence of investment performance or realistic fills.

**Tier A · Research & Monitoring. Research and simulation only. Not investment advice.** The product makes no exchange-proximate HFT claim.

## Files

- `index.html` — website entry point.
- `assets/` — application logic, styles and local assets.
- `package.json` and `server.mjs` — dependency-free local preview.
- `DEPLOYMENT.md` — later Hostinger deployment instructions and current status.

A static web host requires `index.html` and `assets/`; the local preview server and documentation do not need to be uploaded to the public web root.

## Verification

All 12 views were checked at desktop and phone sizes. Search, filters, watchlist persistence, keyboard access, guided tour, scenario selection, preferences and the local pause guard were exercised. Automated checks passed for 28 export payloads and 17 important dialogs. See `QA_REPORT.md` for the actual verification scope and its limits. These checks do not establish the specification's production platform acceptance gates.

The separate `aegis-quant-dashboard.html` deliverable embeds the website's scripts and styles. Open it in a regular browser to review without a preview server. The editable hosting source remains this folder's `index.html` and `assets/`. The app's in-app browser does not permit local file URLs.

## Deployment status

**Not deployed.** The requested later destination is **agentichft.online** on Hostinger. See `DEPLOYMENT.md` for the prepared hosting steps and connector limitation.
