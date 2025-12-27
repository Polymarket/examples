# polymarket-examples

Code examples for Polymarket

See [examples](./examples/) for more information

## Examples

Polymarket uses smart contract wallets internally. Every account created using the Polymarket website is a smart contract wallet.

There are two kinds of smart contract wallets used:

* Polymarket proxy wallets: Smart contract wallets developed internally at Polymarket, used with Magic/email accounts.
  Only the address associated with the email account can execute functions for the wallet.

* Polymarket Safes: A slightly modified Gnosis Safe, used with various browser wallets (including MetaMask, Rainbow, Coinbase Wallet, etc).
  It is a multisig with only one signer: the wallet used to sign into the website.

### Proxy wallet examples

Code examples for interacting with Polymarket proxy wallets are available [here](./examples/proxyWallet/README.md).

Magic accounts use proxy wallets on the backend.


### Safe wallet examples

Code examples for interacting with Safe wallets are available [here](./examples/safeWallet/README.md).

Browser wallets (MetaMask, Coinbase Wallet, etc) use Safes on the backend.


### Usage

Populate your `.env` file based on `.env.example`.

Run examples using ts-node:
```bash
ts-node examples/safeWallet/split.ts
```
