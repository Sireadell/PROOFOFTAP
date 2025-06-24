import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { WalletProvider } from '@/contexts/WalletContext';
import TapPage from '@/pages/TapPage';
import LeaderboardPage from '@/pages/LeaderboardPage';

import WalletConnect from '@/components/WalletConnect';
import { useTapGem } from '@/hooks/useTapGem';
import { Twitter, Orbit, Trophy, Circle } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState('tap');

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex flex-col items-center overflow-x-hidden">
        <Header page={page} setPage={setPage} />

        <main className="flex-grow w-full max-w-6xl px-4 py-6">
          {page === 'tap' && <TapPage />}
          {page === 'leaderboard' && <LeaderboardPage />}
        </main>

        <Footer />
      </div>
      <ToastContainer position="bottom-right" autoClose={6000} />
    </WalletProvider>
  );
}

function Header({ page, setPage }) {
  return (
    <header className="w-full relative text-center py-8 border-b border-gray-700 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-300 to-blue-400">
        🪙 PROOF OF TAP
      </h1>
      <p className="mt-2 text-lg md:text-xl text-gray-300">
        Build your on-chain reputation by showing up daily
      </p>

      <div className="mt-6 flex justify-center gap-6 flex-wrap">
        <NavButton
          active={page === 'tap'}
          onClick={() => setPage('tap')}
          icon={<Circle size={18} />}
          label="Tap"
        />
        <NavButton
          active={page === 'leaderboard'}
          onClick={() => setPage('leaderboard')}
          icon={<Trophy size={18} />}
          label="Leaderboard"
        />
      </div>

      {/* Wallet top-right only */}
      <div className="absolute top-6 right-6 flex items-center space-x-4">
        <WalletConnect />
      </div>
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
    <footer className="w-full border-t border-gray-700 py-6 text-center text-gray-400 text-sm md:text-base">
      <div>
        © 2025 Proof of Tap v1.0.0 —{' '}
        <a
          href="https://x.com/sireadell"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline inline-flex items-center gap-1"
        >
          <Twitter size={16} /> @sireadell
        </a>
      </div>
      <div className="mt-1 flex justify-center items-center gap-2 text-gray-500">
        <Orbit size={16} /> Powered by <span className="font-semibold">Somnia Network</span>
      </div>
    </footer>
  );
}
