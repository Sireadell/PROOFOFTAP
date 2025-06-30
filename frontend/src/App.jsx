import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { WalletProvider } from '@/contexts/WalletContext';
import TapPage from '@/pages/TapPage';
import LeaderboardPage from '@/pages/LeaderboardPage';

import WalletConnect from '@/components/WalletConnect';
import { useTapGem } from '@/hooks/useTapGem';
import { Twitter, Orbit, Trophy, Circle, Book, BookCheck } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState('tap');

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex flex-col items-center overflow-x-hidden">
        <Header page={page} setPage={setPage} />

        <main className="flex-grow w-full max-w-6xl px-4 py-6">
          {page === 'tap' && <TapPage />}
          {page === 'leaderboard' && <LeaderboardPage />}
           {page === 'Rules' && <RulesPage />}
        </main>

        <Footer />
      </div>
      <ToastContainer position="bottom-right" autoClose={6000} />
    </WalletProvider>
  );
}

function Header({ page, setPage }) {
  return (
   <header className="w-full relative py-8 border-b border-gray-700 bg-black/30 backdrop-blur-md rounded-b-3xl shadow-lg select-none text-center">
  <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
    🪙 PROOF OF TAP
  </h1>
  <p className="mt-2 text-lg text-gray-300 max-w-md mx-auto">
    Build your on-chain reputation by showing up daily
  </p>
  {/* nav buttons */}
</header>

  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-xl text-lg font-semibold flex items-center gap-2 border transition-all duration-200 ${
        active
          ? 'bg-purple-700 border-purple-400 text-white shadow-lg'
          : 'bg-black/30 border-gray-600 hover:bg-purple-800/60'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
function Footer() {
  return (
    <footer className="w-full border-t border-purple-800 bg-black/30 backdrop-blur-md rounded-t-3xl shadow-inner py-6 text-center text-gray-400 text-sm md:text-base select-none">
      <div className="flex justify-center items-center gap-2 mb-1 text-gray-400">
        <Orbit size={16} />
        <span className="font-semibold">Powered by Somnia Network</span>
      </div>
      <div>
        © 2025 Proof of Tap v1.0.0 —{' '}
        <a
          href="https://x.com/sireadell"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline inline-flex items-center gap-1 text-purple-400"
        >
          <Twitter size={16} /> @sireadell
        </a>
      </div>
    </footer>
  );
}
