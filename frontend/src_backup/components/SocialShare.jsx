import React from 'react';

export default function SocialShare({ badgeEmoji, badgeName, walletAddress }) {
  const shareText = `I reached ${badgeEmoji} ${badgeName} on Proof of Tap 💎. Building my on-chain reputation one tap at a time. → https://dapp.link/${walletAddress}`;

  const handleShare = () => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 text-sm font-semibold"
    >
      Share on X
    </button>
  );
}
