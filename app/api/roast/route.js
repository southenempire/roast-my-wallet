import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// --- THE SECRET SAUCE: RANDOM PERSONALITIES ---
const ROAST_STYLES = [
  "A Gordon Ramsay-style Chef yelling about raw transaction data.",
  "A disappointed Asian parent wondering why you aren't a doctor yet.",
  "A cynical Gen Z TikToker using slang like 'mid', 'cringe', 'L + Ratio'.",
  "A Medieval King speaking in Shakespearean insults about your poverty.",
  "A Wall Street Bro who thinks anything under $1M is 'cute'.",
  "A Noir Detective narrating a crime scene (your wallet is the crime).",
  "A spiritual guru telling you your chakras and your portfolio are misaligned."
];

export async function POST(req) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { address } = await req.json();

    if (!address) return NextResponse.json({ error: "No address provided" }, { status: 400 });

    let chain = "Scroll";
    let txSummary = [];
    let promptContext = "";
    let bridgeContext = "";

    // 1. PICK A RANDOM PERSONALITY
    const randomPersonality = ROAST_STYLES[Math.floor(Math.random() * ROAST_STYLES.length)];

    // 2. CHECK DEBRIDGE HISTORY
    try {
      const deBridgeResponse = await axios.get(
        `https://deswap.debridge.finance/v1.0/dln/order/orders?giverAddress=${address}&limit=1`
      );
      const orders = deBridgeResponse.data.orders || [];
      
      if (orders.length > 0) {
        const lastDate = new Date(orders[0].createdTimestamp * 1000);
        const daysAgo = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        bridgeContext = `\n[CROSS-CHAIN]: Last bridge ${daysAgo} days ago via deBridge. Acknowledge this.`;
      } else {
        bridgeContext = `\n[CROSS-CHAIN]: ZERO. User is trapped on one chain. Mock them for this.`;
      }
    } catch (err) {
      bridgeContext = "";
    }

    // 3. FETCH CHAIN DATA
    if (address.startsWith('0x')) {
      // SCROLL / EVM
      const etherscanUrl = `https://api.etherscan.io/v2/api?chainid=534352&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.SCROLLSCAN_API_KEY}`;
      const scrollResponse = await axios.get(etherscanUrl);
      const transactions = scrollResponse.data.result;

      if (!transactions || typeof transactions === 'string' || transactions.length === 0) {
        return NextResponse.json({ roast: "Ghost wallet. 0 transactions. Tell them to wake up." });
      }

      txSummary = transactions.slice(0, 10).map(tx => ({
        type: "EVM",
        function: tx.functionName || "transfer",
        val: (parseInt(tx.value) / 10**18).toFixed(4) + " ETH",
        gas: tx.gasUsed
      }));

      promptContext = `User is on Scroll L2.
      - If "depositETH", they paid gas.
      - If generic transfers, they are boring.`;

    } else {
      // SOLANA
      chain = "Solana";
      try {
        const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
        const pubKey = new PublicKey(address);
        const balance = await connection.getBalance(pubKey);
        const solBalance = (balance / LAMPORTS_PER_SOL).toFixed(4);
        const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 15 });
        
        if (signatures.length === 0) return NextResponse.json({ roast: `Balance: ${solBalance} SOL. 0 Txs. Roast them.` });

        let failCount = 0;
        txSummary = signatures.map(sig => {
          if (sig.err) failCount++;
          return { status: sig.err ? "FAILED" : "Success" };
        });

        promptContext = `User is on Solana. Balance: ${solBalance} SOL. Failures: ${failCount}/15.`;

      } catch (solErr) {
        return NextResponse.json({ roast: "Solana RPC failed. Roast the network." });
      }
    }

    // 4. GENERATE THE UNIQUE ROAST
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a crypto roaster with a specific persona.
          
          CURRENT PERSONA: ${randomPersonality}
          (Adopt this personality completely. Use their slang/tone).
          
          CONTEXT:
          Chain: ${chain}
          ${promptContext}
          ${bridgeContext}
          
          GOAL: Roast the user's transaction history. 
          - If they haven't bridged, be harsh about it.
          - If they are on Solana, respect speed but mock isolation.
          
          Keep it under 240 chars. Unique and memorable.` 
        },
        { role: "user", content: `Data: ${JSON.stringify(txSummary)}` }
      ],
    });

    return NextResponse.json({ roast: completion.choices[0].message.content });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ roast: "System overloaded. Try again." });
  }
}