import React, { useEffect } from 'react';
import { useTapGem } from '@/hooks/useTapGem';
// import BadgeDisplay from '@/components/BadgeDisplay'; // Removed import
import CountdownTimer from '@/components/CountdownTimer';
import StreakProgress from '@/components/StreakProgress';
import LoreScroller from '@/components/LoreScroller';
import ClaimRewardButton from '@/components/ClaimRewardButton';
// import { getBadgeTier } from '@/utils/getBadgeTier'; // Removed import
// import { showBadgePopup } from '@/components/BadgePopup'; // Removed import
import SocialShare from '@/components/SocialShare';

export default function TapPage() {
  const { userStats, loading, claiming, tap, claimReward } = useTapGem();
  const MAX_TAPS_PER_DAY = 20;
  const showClaimButton = userStats.tapsToday >= MAX_TAPS_PER_DAY;

  /*
  useEffect(() => {
    if (typeof window === 'undefined' || !userStats.address) return;

    const key = `highestBadge_${userStats.address}`;
    const saved = localStorage.getItem(key);
    const savedTierIndex = saved ? JSON.parse(saved)?.index ?? -1 : -1;
    const currentTierIndex = currentBadge.index;

    if (currentTierIndex > savedTierIndex) {
      showBadgePopup(currentBadge.name, currentBadge.emoji, import.meta.env.VITE_SOCIAL_X_HANDLE);
      localStorage.setItem(key, JSON.stringify(currentBadge));
    }
  }, [userStats.points, userStats.address]);
  */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-xl p-8 flex flex-col md:flex-row gap-8 shadow-xl">
        
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
        <section className="flex-1 flex flex-col items-center justify-center space-y-8">
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
        <aside className="w-full md:w-72 bg-gray-900 rounded-lg p-6 flex flex-col gap-6 shadow-md max-h-[500px] overflow-y-auto">
          <h2 className="font-semibold text-2xl select-none mb-4">Lore</h2>
          <LoreScroller />
          <div className="mt-auto">
            <SocialShare
              badgeEmoji=""
              badgeName=""
              walletAddress={userStats.address}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
