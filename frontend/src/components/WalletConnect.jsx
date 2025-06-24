import React, { useContext, useState } from 'react';
import { WalletContext } from '@/contexts/WalletContext';
import { formatAddress } from '@/utils/formatAddress';

export default function WalletConnect() {
  const { account, connectWallet, disconnectWallet, error } = useContext(WalletContext);
  const [copySuccess, setCopySuccess] = useState(false);

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
      <button
        onClick={connectWallet}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-3 font-mono text-sm select-none">
      {/* BadgeDisplay removed to disable badge near wallet */}
      <span
        className="cursor-pointer hover:underline"
        title={account}
        onClick={copyAddress}
      >
        {formatAddress(account)}
      </span>
      <button
        onClick={disconnectWallet}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      >
        Disconnect
      </button>
      {copySuccess && <span className="text-green-400">Copied!</span>}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
