'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BridgePage() {
  // SWITCHED TO JUMPER (LI.FI)
  // toChain=534352 (Scroll)
  // toToken=0x0000000000000000000000000000000000000000 (Native ETH)
  // theme=dark
  const BRIDGE_URL = "https://jumper.exchange/?toChain=534352&toToken=0x0000000000000000000000000000000000000000&theme=dark";

  return (
    <main className="min-h-screen bg-black text-[#ffce96] font-mono flex flex-col items-center p-4 relative overflow-hidden">
      
      {/* 1. Cyberpunk Background Noise */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#2a1b12_0%,_#000000_100%)] z-[-1]" />
      
      {/* 2. Header & Navigation */}
      <div className="z-10 w-full max-w-[480px] mb-6 flex items-center justify-between mt-8">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-[#ffce96] transition-colors uppercase text-xs font-bold tracking-widest group">
           <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Roast
        </Link>
        <div className="text-xs font-black uppercase tracking-tighter text-[#ffce96] opacity-50">
          Bridge of Shame
        </div>
      </div>

      {/* 3. The Jumper Iframe Container */}
      <div className="z-10 w-full max-w-[480px] h-[750px] bg-[#121212] border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,206,150,0.1)] relative">
        
        {/* Loading Spinner */}
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="animate-spin h-8 w-8 border-4 border-[#ffce96] border-t-transparent rounded-full"></div>
        </div>

        <iframe 
          src={BRIDGE_URL}
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
          title="Jumper Widget"
          allow="clipboard-write"
        />
      </div>

      {/* 4. Footer Trust Badge */}
      <p className="z-10 mt-6 text-zinc-600 text-[10px] uppercase tracking-widest text-center max-w-sm">
        Powered by <span className="text-white font-bold">Jumper (Li.Fi)</span>. <br/>
        Aggregating Orbiter, Across & Stargate.
      </p>
    </main>
  );
}