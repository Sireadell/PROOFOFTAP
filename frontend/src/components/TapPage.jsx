import React, { useEffect, useState, useContext } from 'react';
import { useTapGem } from '@/hooks/useTapGem';
import WalletConnect from './WalletConnect';
import BadgeDisplay from './BadgeDisplay';
import CountdownTimer from './CountdownTimer';
import StreakProgress from './StreakProgress';
import LoreScroller from './LoreScroller';
import ClaimRewardButton from './ClaimRewardButton';
import { getBadgeTier } from '@/utils/getBadgeTier';
import { showBadgePopup } from './BadgePopup';
import { WalletContext } from '../contexts/WalletContext';
import { toast } from 'react-toastify';

export default function TapPage() {
  const { userStats, loading, claiming, tap: tapFunc, claimReward: claimRewardFunc } = useTapGem();
  const [showClaimButton, setShowClaimButton] = useState(false);
  const [previousBadge, setPreviousBadge] = useState(null);

  const { signer, chainId } = useContext(WalletContext);

  // Show claim button if tapsToday >= max taps
  const MAX_TAPS_PER_DAY = 20;
  useEffect(() => {
    setShowClaimButton(userStats.tapsToday >= MAX_TAPS_PER_DAY);
  }, [userStats.tapsToday]);

  // Badge tier & popup on tier change
  const currentBadge = getBadgeTier(userStats.points);
  useEffect(() => {
    if (previousBadge && previousBadge.name !== currentBadge.name) {
      showBadgePopup(currentBadge.name, currentBadge.emoji, import.meta.env.VITE_SOCIAL_X_HANDLE);
    }
    setPreviousBadge(currentBadge);
  }, [currentBadge, previousBadge]);

  // Guarded tap function
  const tap = async () => {
    if (!signer || chainId !== Number(import.meta.env.VITE_SOMNIA_CHAIN_ID_DEC)) {
      toast.error(`Please connect to ${import.meta.env.VITE_SOMNIA_CHAIN_NAME} network.`);
      return;
    }
    await tapFunc();
  };

  // Guarded claimReward function
  const claimReward = async () => {
    if (!signer || chainId !== Number(import.meta.env.VITE_SOMNIA_CHAIN_ID_DEC)) {
      toast.error(`Please connect to ${import.meta.env.VITE_SOMNIA_CHAIN_NAME} network.`);
      return;
    }
    await claimRewardFunc();
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
      {/* Left Stats Panel - foldable */}
      <aside className="w-full md:w-64 bg-gray-900 rounded-lg p-4 flex flex-col gap-6 select-none">
        <button className="text-sm text-gray-400 hover:text-white mb-2 self-start">
          ◀ Fold
        </button>
        <div>
          <h2 className="font-semibold text-xl mb-3 flex items-center gap-2">
            Stats <BadgeDisplay points={userStats.points} />
          </h2>
          <p>Taps today: {userStats.tapsToday}</p>
          <p>Current streak: {userStats.currentStreak}</p>
          <p>Points: {userStats.points}</p>
        </div>
        <StreakProgress currentStreak={userStats.currentStreak} />
        <CountdownTimer />
      </aside>

      {/* Middle Tap Button */}
      <section className="flex-1 flex flex-col items-center justify-center space-y-6">
        {showClaimButton ? (
          <ClaimRewardButton onClick={claimReward} disabled={claiming} />
        ) : (
          <button
            onClick={tap}
            disabled={loading}
            aria-label="Tap the gem"
            className="relative w-44 h-44 rounded-full bg-gradient-to-br from-purple-700 to-pink-600 shadow-lg hover:shadow-pink-500 hover:scale-105 transition-transform animate-breathing flex items-center justify-center"
          >
            {/* Gem SVG Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-24 h-24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2L6 8l6 14 6-14-6-6z"
              />
            </svg>
          </button>
        )}
      </section>

      {/* Right Lore and Social Share */}
      <aside className="w-full md:w-64 bg-gray-900 rounded-lg p-4 flex flex-col gap-6">
        <h2 className="font-semibold text-xl select-none">Lore</h2>
        <LoreScroller />
        <div className="mt-auto">
          <SocialShare
            badgeEmoji={currentBadge.emoji}
            badgeName={currentBadge.name}
            walletAddress={userStats.address}
          />
        </div>
      </aside>
    </div>
  );
}
