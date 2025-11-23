import fetch from 'node-fetch'; // Note: In a real repo, might need to install this or use native fetch in Node 18+

// --- Configuration ---
const EVENT_SLUG = "russia-x-ukraine-ceasefire-in-2025"; // Change this to test other markets
const INVESTMENT_AMOUNT = 1000; // USD

// --- Interfaces ---
interface Order {
    price: string;
    size: string;
}

interface OrderBook {
    bids: Order[];
    asks: Order[];
}

interface Market {
    question: string;
    clobTokenIds: string; // JSON string
    outcomes: string;     // JSON string
    clobRewards: { rewardsDailyRate: number }[];
}

// --- Main Logic ---
async function calculateRewards() {
    console.log(`\n--- Polymarket Reward Calculator Example ---`);
    console.log(`Target Event: ${EVENT_SLUG}`);
    console.log(`Investment: $${INVESTMENT_AMOUNT}\n`);

    try {
        // 1. Fetch Event/Market Data
        const eventUrl = `https://gamma-api.polymarket.com/events?slug=${EVENT_SLUG}`;
        const eventResp = await fetch(eventUrl);
        const eventData = await eventResp.json();

        if (!eventData || eventData.length === 0) {
            throw new Error("Event not found. Check the slug.");
        }

        const market = eventData[0].markets[0] as Market;
        const dailyRewardPool = market.clobRewards?.[0]?.rewardsDailyRate || 0;

        console.log(`Market Question: ${market.question}`);
        console.log(`Daily Reward Pool: $${dailyRewardPool.toFixed(2)}\n`);

        const tokenIds: string[] = JSON.parse(market.clobTokenIds);
        const outcomes: string[] = JSON.parse(market.outcomes);

        // 2. Process each outcome
        for (let i = 0; i < tokenIds.length; i++) {
            const tokenId = tokenIds[i];
            const outcome = outcomes[i];

            // 3. Fetch Order Book
            const bookUrl = `https://clob.polymarket.com/book?token_id=${tokenId}`;
            const bookResp = await fetch(bookUrl);
            const orderBook = (await bookResp.json()) as OrderBook;

            // 4. Sort Order Book (CRITICAL STEP)
            // Bids: Descending (Highest price first)
            // Asks: Ascending (Lowest price first)
            const bids = (orderBook.bids || []).map(b => ({ price: parseFloat(b.price), size: parseFloat(b.size) }))
                .sort((a, b) => b.price - a.price);
            const asks = (orderBook.asks || []).map(a => ({ price: parseFloat(a.price), size: parseFloat(a.size) }))
                .sort((a, b) => a.price - b.price);

            // Determine Mid Price
            const bestBid = bids.length > 0 ? bids[0].price : undefined;
            const bestAsk = asks.length > 0 ? asks[0].price : undefined;

            if (bestBid === undefined || bestAsk === undefined) {
                console.log(`Outcome: ${outcome} - Skipping (One-sided or empty order book)`);
                continue;
            }

            const midPrice = (bestBid + bestAsk) / 2;

            console.log(`Outcome: ${outcome} (Mid Price: ${midPrice.toFixed(4)})`);

            // 5. Calculate Depth and Rewards for different spreads
            const spreads = [
                { label: "1 cent", val: 0.01 },
                { label: "2 cents", val: 0.02 },
                { label: "3 cents", val: 0.03 }
            ];

            // Calculate total probability (sum of mid prices) for normalization
            // Note: In a real scenario, we should sum mid prices of ALL outcomes first.
            // For this simple script, we'll assume the user runs it for all outcomes and manually checks.
            // But to be more accurate per outcome, we can just use the midPrice as a proxy for probability.
            // A better approach for the script is to fetch ALL outcomes first, sum their midPrices, then loop.

            for (const spread of spreads) {
                // Use Additive Spread (e.g. +/- 1 cent) for accurate low-price handling
                const minBid = Math.max(0, midPrice - spread.val); // Clamp to 0 to avoid negative price filter
                const maxAsk = midPrice + spread.val;

                const validBids = bids.filter(b => b.price >= minBid);
                const validAsks = asks.filter(a => a.price <= maxAsk);

                // Calculate Depth in USD (Price * Size)
                const bidDepth = validBids.reduce((sum, b) => sum + (b.price * b.size), 0);
                const askDepth = validAsks.reduce((sum, a) => sum + (a.price * a.size), 0);
                const totalDepth = bidDepth + askDepth;

                // Estimate Reward
                // Formula: DailyPool * (UserInv / (TotalDepth + UserInv))
                // We allocate the daily pool based on the outcome's probability (approx. midPrice)
                // To be strictly correct, we should normalize if sum(midPrices) != 1.
                // For this example, we'll use midPrice directly as the probability estimate.
                const outcomeRewardPool = dailyRewardPool * midPrice;
                const estReward = outcomeRewardPool * (INVESTMENT_AMOUNT / (totalDepth + INVESTMENT_AMOUNT));

                console.log(`  Spread +/- ${spread.label} ($${minBid.toFixed(3)} - $${maxAsk.toFixed(3)}):`);
                console.log(`    Depth: $${totalDepth.toFixed(2)} (Bids: $${bidDepth.toFixed(0)}, Asks: $${askDepth.toFixed(0)})`);
                console.log(`    Est. Daily Reward: $${estReward.toFixed(2)}`);
            }
            console.log("");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

calculateRewards();
