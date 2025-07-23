import React from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import StreakProgress from '@/components/StreakProgress';
import LoreScroller from '@/components/LoreScroller';
import ClaimRewardButton from '@/components/ClaimRewardButton';
import SocialShare from '@/components/SocialShare';

export default function TapComponents({
  userStats,
  loading,
  claiming,
  handleTap,
  claimReward,
  getRank,
  MAX_TAPS_PER_DAY,
}) {
  return (
    <>
      <aside className="w-full md:w-72 bg-gray-900 rounded-lg p-6 flex flex-col gap-6 select-none shadow-md">
        <button className="text-sm text-gray-400 hover:text-white mb-4 self-start font-semibold">◄ Fold</button>
        <div>
          <h2 className="font-semibold text-2xl mb-4">Stats</h2>
          <p className="text-lg">Taps today: <span className="font-mono">{userStats.tapsToday}</span></p>
          <p className="text-lg">Current streak: <span className="font-mono">{userStats.currentStreak}</span></p>
          <p className="text-lg">Points: <span className="font-mono">{userStats.points}</span></p>
        </div>
        <StreakProgress currentStreak={userStats.currentStreak} />
        <CountdownTimer />
      </aside>

      <section className="flex flex-col items-center justify-center flex-1 space-y-6">
        <button
          onClick={handleTap}
          disabled={loading || userStats.tapsToday >= MAX_TAPS_PER_DAY}
          className={`relative w-64 h-64 rounded-full shadow-2xl flex items-center justify-center transition-transform
            ${loading || userStats.tapsToday >= MAX_TAPS_PER_DAY
              ? 'bg-gray-600 cursor-not-allowed opacity-50 shadow-inner'
              : 'bg-gradient-to-br from-purple-700 to-pink-600 hover:shadow-pink-600 hover:scale-110 animate-pulse'
            }`}
        >
          {loading ? (
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/80 flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold animate-pulse">Tapping...</span>
              </div>
            </div>
          ) : (
            <>
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
              <span className="absolute text-white text-2xl font-extrabold select-none">Tap</span>
            </>
          )}
        </button>
        <ClaimRewardButton
          onClick={claimReward}
          disabled={claiming || parseFloat(userStats.unclaimedRewards) === 0}
          amount={userStats.unclaimedRewards}
          className="mt-6 w-48"
        />
      </section>

      <aside className="w-full md:w-72 bg-gray-900 rounded-lg p-6 flex flex-col gap-6 shadow-md max-h-full overflow-y-auto">
        <h2 className="font-semibold text-2xl select-none mb-4">Lore</h2>
        <LoreScroller />
        <div className="mt-auto">
          <SocialShare badgeEmoji="🪙" badgeName={getRank(userStats.points)} walletAddress={userStats.address} />
        </div>
      </aside>
    </>
  );
}