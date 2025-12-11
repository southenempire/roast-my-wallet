'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Flame, Search, RefreshCw, Zap, Share2 } from 'lucide-react';

// --- FAKE FEED FOR VISUALS ---
const LIVE_FEED = [
  { victim: "0x7a...89b1", roast: "Lost 5 ETH on a meme coin named after a vegetable." },
  { victim: "0x3d...22a4", roast: "This wallet has the trading volume of a dead hamster." },
  { victim: "0x9c...11f2", roast: "Gas fees paid: $5,000. Profit made: $3.50. Genius." },
  { victim: "0x1b...99c3", roast: "You are the liquidity the whales have been waiting for." },
  { victim: "0x5e...77d1", roast: "A savings account would have outperformed your portfolio." },
];

// --- CUSTOM BURNING WALLET LOGO ---
const CustomLogo = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#ffce96] mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,206,150,0.6)]">
    <path d="M20 12V8H6C3.79086 8 2 9.79086 2 12V16C2 18.2091 3.79086 20 6 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 12H20C21.1046 12 22 12.8954 22 14V16C22 17.1046 21.1046 18 20 18H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Flames */}
    <path d="M11 7.5C11 7.5 9 5.5 9 3.5C9 1.5 10.5 0.5 11.5 0.5C12.5 0.5 14 1.5 14 3.5C14 5.5 11 7.5 11 7.5Z" fill="currentColor"/>
    <path d="M15.5 8.5C15.5 8.5 17 7 17 5.5C17 4 16 3 15.5 3C15 3 14 4 14 5.5C14 7 15.5 8.5 15.5 8.5Z" fill="currentColor"/>
  </svg>
);

export default function Home() {
  const [address, setAddress] = useState('');
  const [roast, setRoast] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false); 

  const handleRoast = async () => {
    if (!address) return;
    setLoading(true);
    setRoast('');
    setShake(false);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      
      if (data.roast) {
        setRoast(data.roast);
        setShake(true); 
      } else {
        setRoast("You broke the AI. That's how bad your wallet is.");
      }
    } catch (err) {
      console.error(err);
      setRoast("Server overloaded. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAddress('');
    setRoast('');
    setShake(false);
  }

  // --- UPDATED SHARE LINK ---
  const shareOnTwitter = () => {
    const text = encodeURIComponent(`I just got roasted by AI on Scroll! 💀\n\n"${roast}"\n\nCheck your wallet vibe here: 👇\n`);
    // Your actual Vercel link:
    const url = encodeURIComponent("https://roast-my-wallet-rust.vercel.app/"); 
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <main className={`min-h-screen bg-black text-[#ffce96] font-mono relative overflow-hidden flex flex-col ${shake ? 'animate-shake' : ''}`}>
      <style jsx global>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake { animation: shake 0.5s; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#2a1b12_0%,_#000000_100%)] z-[-1]" />

      {/* TICKER */}
      <div className="w-full bg-[#ffce96] text-black overflow-hidden py-3 border-b-4 border-black z-20 relative">
         <div className="whitespace-nowrap flex gap-12 font-bold uppercase tracking-wider text-xs md:text-sm animate-marquee w-max">
           {[...LIVE_FEED, ...LIVE_FEED, ...LIVE_FEED].map((item, i) => (
             <span key={i} className="flex items-center gap-2">
               <span className="bg-black text-[#ffce96] px-2 py-0.5 rounded-sm">{item.victim}</span> 
               {item.roast} •
             </span>
           ))}
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full max-w-2xl mx-auto mt-10">
        
        {/* NEW LOGO & HEADER */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <CustomLogo />
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#ffce96] drop-shadow-[0_0_35px_rgba(255,206,150,0.4)] leading-[0.85]">
            Roast My<br/>Wallet
          </h1>
          <p className="text-zinc-500 mt-4 text-lg md:text-xl font-medium">Enter any address on Scroll. We judge it.</p>
        </motion.div>

        {/* MAIN CARD */}
        <motion.div layout className="w-full bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {!roast ? (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-5 top-5 text-[#ffce96] w-6 h-6" />
                <input
                  type="text"
                  placeholder="Paste Address (e.g. 0x123...)"
                  className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-5 pl-14 pr-4 text-white text-lg focus:outline-none focus:border-[#ffce96] focus:ring-4 focus:ring-[#ffce96]/10 transition-all placeholder:text-zinc-600 font-sans"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <button
                onClick={handleRoast}
                disabled={loading || !address}
                className={`w-full h-20 rounded-2xl font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all
                  ${loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-[#ffce96] hover:bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,206,150,0.3)]'}`}
              >
                {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <Flame className="w-8 h-8" />}
                {loading ? "SCANNING CHAIN..." : "ROAST IT"}
              </button>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ffce96] rounded-full mb-6 shadow-[0_0_40px_rgba(255,206,150,0.6)]">
                <Zap size={40} className="text-black fill-black" />
              </div>
              <div className="bg-black/50 border border-zinc-800 rounded-xl p-6 mb-8 relative">
                <span className="absolute -top-4 -left-2 text-6xl text-zinc-800 font-serif">“</span>
                <p className="text-2xl md:text-3xl font-bold text-white leading-tight font-sans relative z-10">{roast}</p>
                <span className="absolute -bottom-8 -right-2 text-6xl text-zinc-800 font-serif rotate-180">“</span>
              </div>
              
              {/* BUTTONS ROW */}
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-all"
                >
                  <RefreshCw size={16} /> Again
                </button>
                <button 
                  onClick={shareOnTwitter}
                  className="flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-all shadow-lg"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
        <p className="mt-8 text-zinc-700 text-xs uppercase tracking-widest">100% Privacy • No Wallet Connect Required</p>
      </div>
    </main>
  );
}