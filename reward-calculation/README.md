# Polymarket Reward Calculator Example

This example demonstrates how to calculate estimated liquidity rewards for a specific Polymarket event programmatically.

## Features

- Fetches market data using the Gamma API.
- Fetches live order book data using the CLOB API.
- **Crucial:** Demonstrates how to correctly sort the order book (Bids Descending, Asks Ascending) to avoid pricing errors.
- Calculates market depth using an **additive spread** logic (e.g., +/- 1 cent), which is essential for accurately assessing liquidity in low-priced markets.
- Estimates daily rewards based on a hypothetical investment amount.

## Usage

1.  Ensure you have Node.js installed.
2.  Run the script:

```bash
npx ts-node calculate-rewards.ts
```

## Logic Overview

The core calculation logic addresses common pitfalls when working with raw order book data:

1.  **Sorting:** Raw API data may not be sorted. We explicitly sort bids by price (high->low) and asks by price (low->high).
2.  **Spread:** Instead of a percentage-based spread (which fails on low prices like $0.02), we use a fixed price delta (e.g., +/- $0.01).
3.  **Depth:** We sum the USD value (`price * size`) of all orders within the spread range to determine the effective liquidity.
