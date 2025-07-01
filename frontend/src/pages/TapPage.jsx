import React from 'react';
import { useTapGem } from '@/hooks/useTapGem';
import CountdownTimer from '@/components/CountdownTimer';
import StreakProgress from '@/components/StreakProgress';
import LoreScroller from '@/components/LoreScroller';
import ClaimRewardButton from '@/components/ClaimRewardButton';
import SocialShare from '@/components/SocialShare';

export default function TapPage() {
  const { userStats, loading, claiming, tap, claimReward } = useTapGem();
  const MAX_TAPS_PER_DAY = 20;
  const showClaimButton = userStats.tapsToday >= MAX_TAPS_PER_DAY;

  return (
    <div className="flex flex-grow gap-8 p-8 bg-black bg-opacity-60 backdrop-blur-md rounded-xl shadow-xl w-full">
      {/* Left Stats Panel */}
      <aside className="w-full md:w-72 bg-gray-900 rounded-lg p-6 flex flex-col gap-6 select-none shadow-md">
        <button className="text-sm text-gray-400 hover:text-white mb-4 self-start font-semibold">
          ◀ Fold
        </button>
        <div>
          <h2 className="font-semibold text-2xl mb-4">Stats</h2>
          <p className="text-lg">
            Taps today: <span className="font-mono">{userStats.tapsToday}</span>
          </p>
          <p className="text-lg">
            Current streak: <span className="font-mono">{userStats.currentStreak}</span>
          </p>
          <p className="text-lg">
            Points: <span className="font-mono">{userStats.points}</span>
          </p>
        </div>
        <StreakProgress currentStreak={userStats.currentStreak} />
        <CountdownTimer />
      </aside>

      {/* Middle Tap Button */}
      <section className="flex flex-col items-center justify-center flex-1 space-y-8">
        {showClaimButton ? (
          <ClaimRewardButton onClick={claimReward} disabled={claiming} />
        ) : (
          <button
            onClick={tap}
            disabled={loading}
            aria-label="Tap the gem"
            className="relative w-64 h-64 rounded-full bg-gradient-to-br from-purple-700 to-pink-600 shadow-2xl hover:shadow-pink-600 hover:scale-110 transition-transform animate-breathing flex items-center justify-center"
          >
            {/* Bigger Gem SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-56 h-56 opacity-70"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L6 8l6 14 6-14-6-6z" />
            </svg>

            {/* "Tap" text centered inside the gem */}
            <span className="absolute text-white text-2xl font-extrabold select-none pointer-events-none">
              Tap
            </span>
          </button>
        )}
      </section>

      {/* Right Lore and Social Share */}
      <aside className="w-full md:w-72 bg-gray-900 rounded-lg p-6 flex flex-col gap-6 shadow-md max-h-full overflow-y-auto">
        <h2 className="font-semibold text-2xl select-none mb-4">Lore</h2>
        <LoreScroller />
        <div className="mt-auto">
          <SocialShare badgeEmoji="" badgeName="" walletAddress={userStats.address} />
        </div>
      </aside>
    </div>
  );
}
