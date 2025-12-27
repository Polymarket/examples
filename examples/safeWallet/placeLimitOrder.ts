import { ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

import { safeAbi } from "../../src/abis";
import {
  CLOB_API_URL,
  EXCHANGE_PROXY_ADDRESS,
  CHAIN_ID,
} from "../../src/constants";
import { buildLimitOrder } from "../../src/orders";
import { signAndExecuteSafeTransaction } from "../../src/safe-helpers";
import { SafeTransaction } from "../../src/types";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

async function main() {
  console.log("Starting safe limit order example...");

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_URL as string,
  );
  const eoa = new ethers.Wallet(process.env.PK as string, provider);

  console.log(`EOA: ${eoa.address}`);

  // =========== Replace the values below with your own ===========

  const safeAddress = ""; // Your Safe address
  const marketTokenId = ""; // Polymarket market token id
  const side = "BUY"; // or "SELL"
  const price = "0.10";
  const size = "1.0";
  const expiration = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

  // ===============================================================

  const safe = new ethers.Contract(safeAddress, safeAbi, eoa);

  const order = buildLimitOrder({
    maker: safeAddress,
    taker: ethers.constants.AddressZero,
    tokenId: marketTokenId,
    side,
    price,
    size,
    expiration,
    exchangeAddress: EXCHANGE_PROXY_ADDRESS,
    chainId: CHAIN_ID,
  });

  const tx: SafeTransaction = {
    to: EXCHANGE_PROXY_ADDRESS,
    value: 0,
    data: order.calldata,
    operation: 0,
  };

  console.log("Signing and executing Safe transaction...");

  await signAndExecuteSafeTransaction({
    safe,
    tx,
    apiUrl: CLOB_API_URL,
  });

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
