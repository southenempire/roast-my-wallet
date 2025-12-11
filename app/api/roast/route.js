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
    
    // --- STEP 1: DEBRIDGE HISTORY ---
    try {
      const deBridgeResponse = await axios.get(
        `https://deswap.debridge.finance/v1.0/dln/order/orders?giverAddress=${address}&limit=1`
      );
      const orders = deBridgeResponse.data.orders || [];
      
      if (orders.length > 0) {
        const lastDate = new Date(orders[0].createdTimestamp * 1000);
        const daysAgo = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        bridgeContext = `\n[CROSS-CHAIN HISTORY]: User LAST bridged ${daysAgo} days ago via deBridge.
        - INSTRUCTION: Praise them for being "Liquid" and "Omnichain." They get it.`;
      } else {
        bridgeContext = `\n[CROSS-CHAIN HISTORY]: ZERO.
        - INSTRUCTION: Roast them for being "Trapped." 
        - If on Solana: "You have speed, but you have no reach. Bridge out."
        - If on Scroll: "You are stuck in a local bubble. Touch grass on other chains."`;
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
        return NextResponse.json({ roast: "Ghost wallet. You are doing nothing. Go bridge some funds and wake up." });
      }

      txSummary = transactions.slice(0, 10).map(tx => ({
        type: "EVM",
        function: tx.functionName || "transfer",
        val: (parseInt(tx.value) / 10**18).toFixed(4) + " ETH",
        gas: tx.gasUsed
      }));

      promptContext = `User is on Scroll L2.
      - Acknowledge they are on a good L2.
      - BUT, if they haven't bridged (see Cross-Chain History), roast them for being a "Local Maxi."
      - "Imagine staying on one chain in 2025. Boring."`;

    } else {
      // SOLANA LOGIC
      chain = "Solana";
      try {
        const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
        const pubKey = new PublicKey(address);
        const balance = await connection.getBalance(pubKey);
        const solBalance = (balance / LAMPORTS_PER_SOL).toFixed(4);
        const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 15 });
        
        if (signatures.length === 0) return NextResponse.json({ roast: `You have ${solBalance} SOL and 0 transactions. Bridge that dust to Scroll and do something useful.` });

        let failCount = 0;
        txSummary = signatures.map(sig => {
          if (sig.err) failCount++;
          return { status: sig.err ? "FAILED" : "Success" };
        });

        promptContext = `User is on Solana.
        - BALANCE: ${solBalance} SOL.
        - FAILURES: ${failCount}/15 failed.
        - TONE: Respect the speed ("Solana is the Ferrari"), BUT mock the isolation if they don't bridge.
        - "You're driving a Ferrari in a cul-de-sac. Use deBridge to get on the highway."
        - If failed txs are high: "Fastest chain, but you still crashed? Unlucky."`;

      } catch (solErr) {
        return NextResponse.json({ roast: "Solana RPC failed. Even the fastest chain needs a break sometimes." });
      }
    }

    // --- STEP 3: THE "FUNNY INTEROPERABILITY" PROMPT ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a witty, pro-interoperability crypto roaster.
          
          PHILOSOPHY:
          - Solana = Speed/Ferrari. (Don't hate it, just mock the isolation).
          - Scroll = The reliable HQ.
          - Bridging (deBridge) = The ultimate goal.
          
          YOUR JOB:
          - Make the user laugh, but make them realize they need to bridge.
          - If they are only on one chain, call them a "Simp" for that chain.
          - Use crypto slang (WAGMI, NGMI, Jeet, Chad).
          
          CONTEXT:
          Chain: ${chain}
          ${promptContext}
          ${bridgeContext}
          
          Keep it under 240 chars. Funny but persuasive.` 
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