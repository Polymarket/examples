# Getting started with the Polymarket examples

This document explains how to set up and run the examples in this repository using a local Node.js environment.

It is intended for developers who are new to the Polymarket API and want a simple, copy-pasteable workflow for trying out the examples.

---

## 1. What this repository contains

This repository provides TypeScript examples that demonstrate how to:

- interact with Polymarket smart contract wallets
- work with proxy wallets (email / Magic accounts)
- work with safe wallets (browser wallets like MetaMask or Rainbow)

The examples are organized under the `examples/` directory.  
You can run them directly with `ts-node` once your environment is configured.

For a high-level overview of Polymarket developer tooling (CLOB clients, order utils, Gamma API, etc.), refer to the official documentation website.

---

## 2. Prerequisites

Before running any examples, you will need:

- **Node.js** (recommended: LTS or newer)
- **Yarn** or **npm** for installing dependencies
- A **Polymarket account** with access to the relevant network
- Any required API keys or private keys, depending on the example you run

> Never commit secrets (private keys, API keys, etc.) to Git.  
> Always keep them in local `.env` files or secret managers.

---

## 3. Installing dependencies

From the repository root:

1. Install dependencies:

   ```bash
   yarn install
