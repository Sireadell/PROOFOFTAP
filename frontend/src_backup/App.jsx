import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { WalletProvider } from '@/contexts/WalletContext';
import TapPage from '@/pages/TapPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import RulesPage from '@/pages/RulesPage';  // Import Rules page

import WalletConnect from '@/components/WalletConnect';
import { Twitter, Orbit, Trophy, Circle, Book } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState('tap');

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex flex-col items-center overflow-x-hidden">
        <Header page={page} setPage={setPage} />

        <main className="flex-grow w-full max-w-6xl px-4 py-6">
          {page === 'tap' && <TapPage />}
          {page === 'leaderboard' && <LeaderboardPage />}
          {page === 'rules' && <RulesPage />}
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

      <nav className="mt-6 flex justify-center gap-6 flex-wrap">
        <NavButton
          active={page === 'tap'}
          onClick={() => setPage('tap')}
          icon={<Circle size={16} />}
          label="Tap"
        />
        <NavButton
          active={page === 'leaderboard'}
          onClick={() => setPage('leaderboard')}
          icon={<Trophy size={18} />}
          label="Leaderboard"
        />
        <NavButton
          active={page === 'rules'}
          onClick={() => setPage('rules')}
          icon={<Book size={18} />}
          label="Rules"
        />
      </nav>

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
