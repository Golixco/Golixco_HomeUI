import React from 'react';

export function NotFound() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-[#090909] border border-white/[0.06] rounded-[2rem] p-12 text-center max-w-md w-full">
        <h1 className="text-6xl font-bold mb-4 tracking-tighter">404</h1>
        <p className="text-white/60 mb-8 text-lg">This page doesn't exist.</p>
        <a 
          href="/" 
          className="inline-flex bg-white text-black font-medium px-8 py-3 rounded-xl hover:bg-[#EDEDED] transition-colors"
        >
          Return to Golixco
        </a>
      </div>
    </div>
  );
}
