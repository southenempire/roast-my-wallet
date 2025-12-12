import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// --- PERSONALITY LIST ---
const ROAST_STYLES = [
  "A Gordon Ramsay-style Chef yelling about raw transaction data.",
  "A disappointed Asian parent wondering why you aren't a doctor yet.",
  "A cynical Gen Z TikToker using slang like 'mid', 'cringe', 'L + Ratio'.",
  "A Medieval King speaking in Shakespearean insults about your poverty.",
  "A Wall Street Bro who thinks anything under $1M is 'cute'.",
  "A Noir Detective narrating a crime scene (your wallet is the crime)."
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
    
    // Pick Personality
    const randomPersonality = ROAST_STYLES[Math.floor(Math.random() * ROAST_STYLES.length)];

    // --- STEP 1: FETCH CHAIN DATA ---
    if (address.startsWith('0x')) {
      // SCROLL (Using Etherscan V2)
      const etherscanUrl = `https://api.etherscan.io/v2/api?chainid=534352&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.SCROLLSCAN_API_KEY}`;
      const scrollResponse = await axios.get(etherscanUrl);
      
      const transactions = scrollResponse.data.result;
      
      if (!transactions || typeof transactions === 'string' || transactions.length === 0) {
        return NextResponse.json({ roast: `(Persona: ${randomPersonality}) Ghost wallet. Zero history. You are literally nothing. Bridge some funds.` });
      }

      // --- LOGIC: DETECT BRIDGING ---
      // We look for "Deposit" functions or high value incoming transfers
      const hasBridged = transactions.some(tx => 
        tx.functionName && (tx.functionName.toLowerCase().includes('deposit') || tx.functionName.toLowerCase().includes('bridge'))
      );

      if (hasBridged) {
         bridgeContext = `[BRIDGE STATUS]: User HAS bridged. Acknowledge they are valid.`;
      } else {
         bridgeContext = `[BRIDGE STATUS]: ZERO bridge history detected. 
         - ROAST THEM: Accuse them of funding via CEX (Centralized Exchange) like a normie. 
         - COMMAND: Tell them to "use the Bridge" to be on-chain.`;
      }

      txSummary = transactions.slice(0, 10).map(tx => ({
        function: tx.functionName || "transfer",
        val: (parseInt(tx.value) / 10**18).toFixed(4) + " ETH",
      }));
      
      promptContext = "User is on Scroll L2. Check bridge status carefully.";

    } else {
      // SOLANA LOGIC
      chain = "Solana";
      try {
        const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
        const pubKey = new PublicKey(address);
        const balance = await connection.getBalance(pubKey);
        const solBalance = (balance / LAMPORTS_PER_SOL).toFixed(4);
        const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 10 });
        
        if (signatures.length === 0) return NextResponse.json({ roast: `(Persona: ${randomPersonality}) ${solBalance} SOL and 0 txs. You are dust.` });

        let failCount = 0;
        signatures.forEach(sig => { if (sig.err) failCount++; });
        
        txSummary = signatures.map(sig => ({ status: sig.err ? "FAILED" : "Success" }));
        
        // Solana users ALWAYS need to bridge to Scroll (that's the joke)
        bridgeContext = `[BRIDGE STATUS]: They are on Solana. 
        - ROAST: "You are stuck in the Solana cul-de-sac."
        - COMMAND: "Bridge to Scroll L2 immediately."`;
        
        promptContext = `Solana User. Balance: ${solBalance} SOL. Failures: ${failCount}/10.`;

      } catch (solErr) {
        return NextResponse.json({ roast: "Solana RPC failed. Classic Solana." });
      }
    }

    // --- STEP 3: AI ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `Persona: ${randomPersonality}
          Chain: ${chain}
          ${promptContext}
          ${bridgeContext}
          Keep it under 240 chars. Be mean but funny.` 
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