# Website verification

Reviewed on 10 October 2026. This report covers the static website demo, not production trading infrastructure.

## Passed

- All 12 workspace sections rendered in the browser with no missing-value placeholders or uncaught console errors.
- Desktop layout checked at 1440 × 1000. Phone layout checked at 390 × 844 for every section: zero document-level horizontal overflow. Wide tables scroll inside their panels and are keyboard-focusable.
- Phone navigation opened, selected a view, and closed. The opportunity dialog remained within the phone viewport.
- Indian equity filter returned two instruments; searching TCS returned one. Adding TCS to the watchlist persisted through a reload, and the test change was then removed.
- The blocked scanner filter returned three records. ETH displayed its negative cost-adjusted example edge and costs; stale SOL data stayed unavailable.
- Crypto size presets changed the displayed recorded costs and edge. AAPL and RELIANCE comparisons used matching native-currency reference prices for each broker, with hypothetical charges and closed-session disclosures.
- Synthetic ticket inspection showed its recorded assumptions and uncertainty. The local pause guard blocked a new ticket preview. There is no real order submission.
- Global search opened the TCS details. Ctrl+K opened search and Escape closed it. Dialogs use focus trapping and return focus to their opener.
- Table density changed and the four-step guided tour completed. Equity chart range controls changed the fixed example series.
- Automated checks passed for 28 export payloads: JSON and CSV for all 12 views, plus both sizes of the two equity broker comparisons.
- Export payloads include canonical SYNTHETIC provenance, UTC and local snapshot times, dataset version, and the pipeline-test-only notice. Native currencies and explicit synthetic FX assumptions are preserved.
- Automated checks inspected 17 important dialogs without undefined, NaN or unmapped placeholder values. Sample financial display strings matched the authoritative fixture values.
- JavaScript syntax checks passed for application logic, fixture data and the local preview server. The website has no external runtime dependencies or remote asset requests.

## Verification limits

The in-app browser did not return a download event for a generated Blob CSV. The click completed without a console error; JSON and CSV contents and the download handler were verified in automated checks. Saving downloads in the deployed browser must be rechecked during hosting verification.

The app's browser blocks local file URLs, so the portable HTML artifact was packaged for opening by the user in a regular browser. Browser layout and interaction checks used the local HTTP preview of the same editable website source.

No live feed, broker, authenticated financial account, real AI agent, model training, historical backtest engine, database, ledger persistence, account risk service or real reconciliation was tested or connected. Synthetic accounting examples are illustrative display records. These results do not certify the backend milestones or financial acceptance gates in the master specification.

## Publication

The current dashboard is publicly deployed through Netlify at `https://agentichft.online/dashboard/`. The report's functional checks still cover only the static synthetic demonstration; they do not validate a live trading, financial-account or production backend integration.
