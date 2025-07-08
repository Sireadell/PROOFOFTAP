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
import SocialShare from './SocialShare';
import { toast } from 'react-toastify';

export default function TapPage() {
  const {
    userStats,
    loading,
    claiming,
    tap: tapFunc,
    claimReward: claimRewardFunc,
  } = useTapGem();

  const [previousBadge, setPreviousBadge] = useState(null);
  const { signer, chainId } = useContext(WalletContext);

  const MAX_MONTHLY_REWARD = 15;

  const currentBadge = getBadgeTier(userStats.points);

  const unclaimed = parseFloat(userStats.unclaimedRewards) || 0;
  const claimed = parseFloat(userStats.totalRewardClaimed) || 0;
  const total = unclaimed + claimed;
  const progressPercent = Math.min((total / MAX_MONTHLY_REWARD) * 100, 100);

  const tapsToday = userStats.tapsToday || 0;
  const estimatedPerTap = 0.05; // adjust this as needed

  useEffect(() => {
    if (previousBadge && previousBadge.name !== currentBadge.name) {
      showBadgePopup(currentBadge.name, currentBadge.emoji, import.meta.env.VITE_SOCIAL_X_HANDLE);
    }
    setPreviousBadge(currentBadge);
  }, [currentBadge, previousBadge]);

  const claimReward = async () => {
    if (!signer || chainId !== Number(import.meta.env.VITE_SOMNIA_CHAIN_ID_DEC)) {
      showToastOnce(toast.error, `Please connect to ${import.meta.env.VITE_SOMNIA_CHAIN_NAME} network.`);
      return;
    }
    if (unclaimed <= 0) {
      showToastOnce(toast.info, 'No rewards to claim or monthly limit reached.');
      return;
    }
    await claimRewardFunc(unclaimed.toString());
  };

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-10 max-w-2xl mx-auto">
      {/* Stats Panel */}
      <aside className="w-full bg-gray-900 rounded-lg p-4 flex flex-col gap-6 select-none">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl mb-2 flex items-center gap-2">
            Stats <BadgeDisplay points={userStats.points} />
          </h2>
          <button className="text-sm text-gray-400 hover:text-white">◀ Fold</button>
        </div>
        <p>Taps today: {tapsToday}</p>
        <p>Current streak: {userStats.currentStreak}</p>
        <p>Points: {userStats.points}</p>
        <p>Unclaimed STT: {unclaimed.toFixed(2)} STT</p>
        <p>Total Claimed: {claimed.toFixed(2)} STT</p>
        <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <StreakProgress currentStreak={userStats.currentStreak} />
        <CountdownTimer />
      </aside>

      {/* Tap & Claim Section */}
      <section className="w-full flex flex-col items-center">
        {/* Disabled Tap Button */}
        <div className="w-44 h-44 mb-4 rounded-full bg-gray-700 flex items-center justify-center opacity-40">
          <span className="text-white text-sm">Tap Disabled</span>
        </div>

        {/* Tap Feedback */}
        <p className="text-sm text-purple-300 mb-2">
          Tap {tapsToday} of 20 • +{estimatedPerTap.toFixed(2)} STT
        </p>

        {/* Claim Reward Button */}
        <ClaimRewardButton
          onClick={claimReward}
          disabled={claiming || unclaimed <= 0 || total >= MAX_MONTHLY_REWARD}
          className="w-40 mb-4"
        />

        {/* Reward Progress Info */}
        <div className="text-center text-sm text-gray-400 max-w-xs w-full space-y-1">
          <p>
            Unclaimed STT:{' '}
            <span className="text-white font-semibold">{unclaimed.toFixed(2)}</span>
          </p>
          <p>
            Total Claimed:{' '}
            <span className="text-white font-semibold">{claimed.toFixed(2)}</span> /{' '}
            {MAX_MONTHLY_REWARD} STT
          </p>
          <div className="w-full mt-2 bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Lore Panel */}
      <aside className="w-full bg-gray-900 rounded-lg p-4 flex flex-col gap-6">
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
