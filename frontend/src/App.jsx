import React, { useState, useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WalletProvider, WalletContext } from '@/contexts/WalletContext';
import TapPage from '@/pages/TapPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import RulesPage from '@/pages/RulesPage';
import WalletConnect from '@/components/WalletConnect';
import { Twitter, Orbit, Trophy, Circle, Book } from 'lucide-react';
import { toast } from 'react-toastify';

export default function App() {
  const [page, setPage] = useState('tap');
  const { account, connectWallet } = useContext(WalletContext);
  const [isButtonLoading, setIsButtonLoading] = useState(() => {
    return localStorage.getItem('isButtonLoading') === 'true';
  });

  const handleConnectWallet = async () => {
    if (connectWallet) {
      try {
        setIsButtonLoading(true);
        localStorage.setItem('isButtonLoading', 'true');
        await connectWallet();
        setIsButtonLoading(false);
        localStorage.setItem('isButtonLoading', 'false');
      } catch (error) {
        console.error('Wallet connection failed:', error);
                setIsButtonLoading(false);
        localStorage.setItem('isButtonLoading', 'false');
      }
    } else {
      toast.error('Proof Of Tap verification unavailable.');
    }
  };

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex flex-col items-center overflow-x-hidden">
        {!account ? (
          <WelcomeScreen onConnect={handleConnectWallet} isButtonLoading={isButtonLoading} />
        ) : (
          <>
            <Header page={page} setPage={setPage} />
            <main className="flex-grow w-full max-w-6xl px-4 py-6">
              {page === 'tap' && <TapPage />}
              {page === 'leaderboard' && <LeaderboardPage />}
              {page === 'rules' && <RulesPage />}
            </main>
            <Footer />
          </>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={6000} />
    </WalletProvider>
  );
}

function WelcomeScreen({ onConnect, isButtonLoading }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-black/30 backdrop-blur-md rounded-xl shadow-lg p-8 text-center max-w-lg border border-purple-700">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg mb-4">
          Welcome to Proof of Tap 🪙
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          Build your on-chain reputation by tapping daily on the Somnia Network. Join the community, climb the leaderboard, and show your dedication!
        </p>
        <button
          onClick={onConnect}
          disabled={isButtonLoading}
          className={`bg-gradient-to-br from-purple-700 to-pink-600 px-6 py-3 rounded-lg text-lg font-semibold hover:shadow-pink-600 hover:scale-105 transition-transform mb-4 ${
            isButtonLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isButtonLoading ? 'Syncing with Somnia...' : 'Enter Proof Of Tap'}
        </button>
        <p className="text-sm text-gray-400">
          Follow{' '}
          <a
            href="https://x.com/sireadell"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 underline inline-flex items-center gap-1"
          >
            <Twitter size={16} /> @sireadell
          </a>{' '}
          for updates, tips, and community news!
        </p>
      </div>
    </div>
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