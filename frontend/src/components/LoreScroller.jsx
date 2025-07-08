import React from 'react';

const loreText = `
Proof of Tap is your daily on-chain reputation builder.
Each tap is recorded on the blockchain,
reflecting your dedication, streaks, and earned rewards.

Stay consistent, earn badges, and share your achievements with the world.
Your journey starts with a single tap — let’s make every tap count!
`;

export default function LoreScroller() {
  return (
    <div className="max-h-48 overflow-y-auto p-3 bg-gray-900 rounded-lg text-gray-300 text-sm select-text whitespace-pre-line">
      {loreText}
    </div>
  );
}
