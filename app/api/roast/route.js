import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import { Connection, PublicKey } from '@solana/web3.js';

export async function POST(req) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { address } = await req.json();

    if (!address) return NextResponse.json({ error: "No address provided" }, { status: 400 });

    let chain = "Scroll"; // Default
    let txSummary = [];
    let promptContext = "";

    // --- LOGIC A: IT IS A SCROLL (EVM) ADDRESS ---
    if (address.startsWith('0x')) {
      const scrollResponse = await axios.get(
        `https://api.scrollscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.SCROLLSCAN_API_KEY}`
      );
      
      const transactions = scrollResponse.data.result;
      if (!transactions || typeof transactions === 'string' || transactions.length === 0) {
        return NextResponse.json({ roast: "Ghost wallet on Scroll. 0 transactions. Boring." });
      }

      txSummary = transactions.slice(0, 10).map(tx => ({
        type: "EVM_TX",
        function: tx.functionName || "transfer",
        value: (parseInt(tx.value) / 10**18).toFixed(4) + " ETH",
        gas: tx.gasUsed
      }));

      promptContext = `Analyze this Scroll Layer 2 wallet.
      - If function includes "depositETH", mock them for paying Mainnet gas.
      - If "withdraw" or "bridge", ask if they are fleeing the ecosystem.
      - If high gas usage, laugh at their efficiency.`;

    } 
    // --- LOGIC B: IT IS A SOLANA ADDRESS ---
    else {
      chain = "Solana";
      try {
        // Use public RPC (Rate limits apply, but fine for hackathon demo)
        const connection = new Connection("https://api.mainnet-beta.solana.com");
        const pubKey = new PublicKey(address);
        
        // Get last 10 signatures
        const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 10 });
        
        if (signatures.length === 0) {
          return NextResponse.json({ roast: "This Solana wallet is empty. Did you get rugged before you even started?" });
        }

        // We can't easily decode function names on Solana without a huge indexer,
        // so we analyze the age and errors.
        txSummary = signatures.map(sig => ({
          type: "SOL_TX",
          signature: sig.signature.substring(0, 8) + "...",
          ago: Math.floor((Date.now() / 1000 - sig.blockTime) / 3600) + " hours ago",
          error: sig.err ? "FAILED TX" : "Success"
        }));

        promptContext = `Analyze this Solana wallet. 
        - Roast them for using a chain that "pauses" or "halts."
        - If you see "FAILED TX", mock them for Solana congestion.
        - Accuse them of trading memecoins (Jeet behavior).
        - If recent activity is high, ask if they are bridging assets to buy Ethereum/Scroll tokens.`;

      } catch (solErr) {
        console.error("Solana Error:", solErr);
        return NextResponse.json({ roast: "Invalid Solana address or the RPC node is tired (classic Solana)." });
      }
    }

    // --- STEP 3: SEND TO AI ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a rude crypto comedian. The user is on chain: ${chain}.
          ${promptContext}
          Keep it under 240 chars. Be brutal.`
        },
        {
          role: "user",
          content: `History: ${JSON.stringify(txSummary)}`
        }
      ],
    });

    return NextResponse.json({ roast: completion.choices[0].message.content });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ roast: "System overloaded. Try again." });
  }
}