import React from 'react';

export default function StreakProgress({ currentStreak }) {
  return (
    <div className="w-full max-w-xs p-4 bg-gray-900 rounded-lg text-center select-none">
      <p className="mb-2 text-lg font-semibold">Current Streak</p>
      <div className="text-5xl font-bold text-yellow-400">{currentStreak}</div>
      <div className="h-3 bg-yellow-400 rounded-full mt-4">
        <div
          className="h-3 bg-yellow-600 rounded-full"
          style={{ width: `${Math.min(currentStreak / 50, 1) * 100}%` }}
        ></div>
      </div>
      <p className="mt-2 text-sm text-yellow-300">Keep going!</p>
    </div>
  );
}
