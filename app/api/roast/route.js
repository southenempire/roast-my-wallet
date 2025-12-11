import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function POST(req) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { address } = await req.json();

    if (!address) return NextResponse.json({ error: "No address provided" }, { status: 400 });

    let chain = "Scroll";
    let txSummary = [];
    let promptContext = "";
    let bridgeContext = "";
    
    // --- STEP 1: DEBRIDGE HISTORY (The "Truth" Check) ---
    try {
      const deBridgeResponse = await axios.get(
        `https://deswap.debridge.finance/v1.0/dln/order/orders?giverAddress=${address}&limit=1`
      );
      const orders = deBridgeResponse.data.orders || [];
      
      if (orders.length > 0) {
        const lastDate = new Date(orders[0].createdTimestamp * 1000);
        const daysAgo = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        bridgeContext = `\n[CROSS-CHAIN HISTORY]: User LAST bridged ${daysAgo} days ago.
        - INSTRUCTION: If > 30 days, shame them for letting their capital rot on one chain. "Liquidity has to move to grow."
        - If < 7 days, nod respectfully but tell them to keep the velocity up.`;
      } else {
        bridgeContext = `\n[CROSS-CHAIN HISTORY]: ZERO. NONE.
        - This user is a "Chain Isolationist." They have NEVER used deBridge.
        - INSTRUCTION: Attack this mindset. Ask them if they enjoy being trapped. Tell them real yield is cross-chain.`;
      }
    } catch (err) {
      bridgeContext = "";
    }

    // --- STEP 2: FETCH CHAIN DATA ---
    if (address.startsWith('0x')) {
      // SCROLL LOGIC
      const etherscanUrl = `https://api.etherscan.io/v2/api?chainid=534352&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.SCROLLSCAN_API_KEY}`;
      const scrollResponse = await axios.get(etherscanUrl);
      const transactions = scrollResponse.data.result;

      if (!transactions || typeof transactions === 'string' || transactions.length === 0) {
        return NextResponse.json({ roast: "Zero history? You're not a user, you're a database entry. Bridge some ETH and wake up." });
      }

      txSummary = transactions.slice(0, 10).map(tx => ({
        type: "EVM",
        function: tx.functionName || "transfer",
        val: (parseInt(tx.value) / 10**18).toFixed(4) + " ETH",
        gas: tx.gasUsed
      }));

      promptContext = `User is on Scroll L2.
      - If they only do simple transfers, tell them they are wasting the L2 potential.
      - Tell them to use their cheap gas to BRIDGE assets and arb opportunities on other chains.`;

    } else {
      // SOLANA LOGIC
      chain = "Solana";
      try {
        const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
        const pubKey = new PublicKey(address);
        const balance = await connection.getBalance(pubKey);
        const solBalance = (balance / LAMPORTS_PER_SOL).toFixed(4);
        const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 15 });
        
        if (signatures.length === 0) return NextResponse.json({ roast: `You have ${solBalance} SOL and 0 transactions. Your capital is stagnant. Bridge it to Scroll and put it to work.` });

        let failCount = 0;
        txSummary = signatures.map(sig => {
          if (sig.err) failCount++;
          return { status: sig.err ? "FAILED" : "Success" };
        });

        promptContext = `User is on Solana.
        - BALANCE: ${solBalance} SOL.
        - FAILURES: ${failCount}/15 failed.
        - INSTRUCTION: Use the failures as proof they need to leave. "Why stay on a chain that halts? Bridge to Scroll for uptime."`;

      } catch (solErr) {
        return NextResponse.json({ roast: "Solana RPC failed. See? If you were on Scroll, this wouldn't happen. Bridge now." });
      }
    }

    // --- STEP 3: THE "TOUGH LOVE" PROMPT ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are an aggressive DeFi Interoperability Coach. 
          Your philosophy: "Static capital is dead capital."
          
          Your Goal: Bully the user into bridging funds and becoming a cross-chain active user.
          
          TONE:
          - Do not be "funny" or "clownish." Be harsh, direct, and factual.
          - Use words like "Inefficient," "Stagnant," "Trapped," "Isolated."
          - Advocating for: Scroll Ecosystem and deBridge infrastructure.
          
          CONTEXT:
          Chain: ${chain}
          ${promptContext}
          ${bridgeContext}
          
          Keep it under 240 chars. Make it hurt, but make it true.` 
        },
        { role: "user", content: `Data: ${JSON.stringify(txSummary)}` }
      ],
    });

    return NextResponse.json({ roast: completion.choices[0].message.content });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ roast: "My analysis failed, but your lack of bridging is the real failure here." });
  }
}