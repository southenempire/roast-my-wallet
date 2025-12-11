import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { address } = await req.json();

    // 1. Fetch Real History from Scroll
    const scrollResponse = await axios.get(
      `https://api.scrollscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.SCROLLSCAN_API_KEY}`
    );

    const transactions = scrollResponse.data.result;

    // Handle empty wallets
    if (!transactions || typeof transactions === 'string' || transactions.length === 0) {
      return NextResponse.json({ roast: "This wallet is a ghost town. 0 transactions? Are you hiding from the IRS or just boring?" });
    }

    // 2. Summarize Data (Save costs by sending only last 10 txs)
    const recentTx = transactions.slice(0, 10).map(tx => ({
      to: tx.to,
      value: (parseInt(tx.value) / 10**18).toFixed(4) + " ETH",
      gasUsed: tx.gasUsed
    }));

    // 3. Ask AI to Roast it
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast & Cheap
      messages: [
        {
          role: "system",
          content: "You are a rude, cynical crypto comedian. Roast this wallet based on their transaction history. Keep it under 200 characters. Mention specific mistakes if you see them."
        },
        {
          role: "user",
          content: `Here is the history: ${JSON.stringify(recentTx)}`
        }
      ],
    });

    const roast = completion.choices[0].message.content;
    return NextResponse.json({ roast });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ roast: "The blockchain is congested, but you still look like a noob. (API Error)" });
  }
}