import React, { useState, useEffect, useContext } from 'react';
import { useTapGem } from '@/hooks/useTapGem';
import { WalletContext } from '@/contexts/WalletContext';
import { toast } from 'react-toastify';
import CountdownTimer from '@/components/CountdownTimer';
import StreakProgress from '@/components/StreakProgress';
import LoreScroller from '@/components/LoreScroller';
import ClaimRewardButton from '@/components/ClaimRewardButton';
import SocialShare from '@/components/SocialShare';

export default function TapPage() {
  const { userStats, loading, claiming, tap, claimReward } = useTapGem();
  const { account, connectWallet } = useContext(WalletContext);
  const MAX_TAPS_PER_DAY = 20;
  const [showFollowPopup, setShowFollowPopup] = useState(false);
  const [hasClickedFollow, setHasClickedFollow] = useState(() => {
    return sessionStorage.getItem('hasClickedFollow') === 'true';
  });
  const [timer, setTimer] = useState(15); // 15-second verification timer
  const [checkStage, setCheckStage] = useState('initial');

  const getRank = (points) => {
    if (points >= 501) return 'Master Tapper';
    if (points >= 101) return 'Pro Tapper';
    return 'Novice Tapper';
  };

  const handleTap = async () => {
    if (!account) {
      toast.error('Please connect your wallet first.');
      if (connectWallet) {
        try {
          await connectWallet();
        } catch (error) {
          console.error('Wallet connection failed:', error);
          toast.error('Failed to connect wallet.');
        }
      }
      return;
    }
    if (!hasClickedFollow) {
      setShowFollowPopup(true);
      setTimer(15);
      setCheckStage('initial');
      return;
    }
    const earned = await tap();
    if (earned) {
      toast.success(`Tap successful! You earned ${earned} STT`);
    }
  };

  const handleFollowClick = () => {
    setHasClickedFollow(true);
    sessionStorage.setItem('hasClickedFollow', 'true'); // Store in sessionStorage
    window.open('https://x.com/sireadell', '_blank');
  };

  const handleConfirmFollow = () => {
    setShowFollowPopup(false);
    toast.success('Follow verified! You can now tap.');
  };

  useEffect(() => {
    if (showFollowPopup && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (showFollowPopup && timer === 0) {
      if (checkStage === 'initial' && hasClickedFollow) {
        setCheckStage('decoy');
        setTimer(15); // 15-second decoy timer
        toast.info('Please confirm you followed @sireadell!');
      } else if (checkStage === 'decoy' && hasClickedFollow) {
        setShowFollowPopup(false);
        toast.success('Follow verified! You can now tap.');
      }
    }
  }, [showFollowPopup, timer, checkStage, hasClickedFollow]);

  return (
    <div className="flex flex-grow gap-8 p-8 bg-black bg-opacity-60 backdrop-blur-md rounded-xl shadow-xl w-full">
      <aside className="w-full md:w-72 bg-gray-900 rounded-lg p-6 flex flex-col gap-6 select-none shadow-md">
        <button className="text-sm text-gray-400 hover:text-white mb-4 self-start font-semibold">
          ◄ Fold
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

      <section className="flex flex-col items-center justify-center flex-1 space-y-6">
        <button
          onClick={handleTap}
          disabled={loading || userStats.tapsToday >= MAX_TAPS_PER_DAY || showFollowPopup}
          aria-label="Tap the gem"
          className={`relative w-64 h-64 rounded-full shadow-2xl flex items-center justify-center transition-transform
            ${
              loading || userStats.tapsToday >= MAX_TAPS_PER_DAY || showFollowPopup
                ? 'bg-gray-600 cursor-not-allowed opacity-50 shadow-inner'
                : 'bg-gradient-to-br from-purple-700 to-pink-600 hover:shadow-pink-600 hover:scale-110 animate-breathing'
            }
          `}
        >
          {loading ? (
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-purple-400 opacity-30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500 opacity-80 flex items-center justify-center shadow-lg">
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
              <span className="absolute text-white text-2xl font-extrabold select-none pointer-events-none">
                Tap
              </span>
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

      {showFollowPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center max-w-sm">
            <h2 className="text-2xl font-bold mb-4">Follow to Play</h2>
            <p className="mb-4">
              {hasClickedFollow ? (
                <>Confirming your follow of @sireadell...</>
              ) : (
                <>
                  Follow{' '}
                  <a
                    href="https://x.com/sireadell"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 underline"
                    onClick={handleFollowClick}
                  >
                    @sireadell
                  </a>{' '}
                  on X to Tap!
                </>
              )}
            </p>
            {hasClickedFollow && (
              <div className="mb-4 w-8 h-8 mx-auto animate-spin">
                <div className="w-full h-full rounded-full border-4 border-t-transparent border-gradient-to-r from-purple-700 to-pink-600"></div>
              </div>
            )}
            {checkStage === 'decoy' && (
              <button
                onClick={handleConfirmFollow}
                className="bg-purple-600 px-4 py-2 rounded-lg mr-2"
              >
                I’ve Followed
              </button>
            )}
            <button
              onClick={() => setShowFollowPopup(false)}
              className="bg-gray-600 px-4 py-2 rounded-lg"
              disabled={timer > 0 && checkStage !== 'decoy'}
            >
              {timer > 0 && checkStage === 'decoy' ? 'Wait' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}