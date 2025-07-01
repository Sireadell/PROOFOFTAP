import React, { useContext, useState } from 'react';
import { WalletContext } from '@/contexts/WalletContext';
import { formatAddress } from '@/utils/formatAddress';

export default function WalletConnect() {
  const { account, connectWallet, disconnectWallet, error } = useContext(WalletContext);
  const [copySuccess, setCopySuccess] = useState(false);
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    console.log('Connect Wallet button clicked');
    setConnecting(true);
    try {
      await connectWallet();
    } catch (err) {
      console.error('connectWallet failed:', err);
    } finally {
      setConnecting(false);
    }
  }

  async function copyAddress() {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // silently fail or handle error if needed
    }
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={handleConnect}
          disabled={connecting}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
          type="button"
          aria-label="Connect Wallet"
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {error && <div className="text-red-500 text-sm max-w-xs text-center">{error}</div>}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 font-mono text-sm select-none">
      {/* BadgeDisplay removed to disable badge near wallet */}
      <span
        className="cursor-pointer hover:underline"
        title={account}
        onClick={copyAddress}
        aria-label="Copy wallet address"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') copyAddress();
        }}
      >
        {formatAddress(account)}
      </span>
      <button
        onClick={disconnectWallet}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        type="button"
        aria-label="Disconnect Wallet"
      >
        Disconnect
      </button>
      {copySuccess && <span className="text-green-400">Copied!</span>}
      {error && <div className="text-red-500 ml-4">{error}</div>}
    </div>
  );
}
