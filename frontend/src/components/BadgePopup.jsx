import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

export function showBadgePopup(badgeName, emoji, socialXUrl) {
  toast.info(
    <div className="flex flex-col items-start space-y-2 p-2">
      <div className="text-lg font-bold flex items-center space-x-2">
        <span>{emoji}</span>
        <span>Congrats! You reached {badgeName}!</span>
      </div>
      <button
        onClick={() =>
          window.open(
            `https://x.com/intent/tweet?text=${encodeURIComponent(
              `I reached ${emoji} ${badgeName} on Proof of Tap 💎. Building my on-chain reputation one tap at a time. → ${socialXUrl}`
            )}`,
            '_blank'
          )
        }
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
      >
        Share on X
      </button>
    </div>,
    {
      autoClose: 8000,
      closeOnClick: true,
      pauseOnHover: true,
      position: 'bottom-right',
    }
  );
}
