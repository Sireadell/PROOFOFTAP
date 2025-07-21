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
  const [showPopup, setShowPopup] = useState(false);
  const [hasClickedFollow, setHasClickedFollow] = useState(() => {
    return sessionStorage.getItem('hasClickedFollow') === 'true';
  });
  const [hasInteractedWithTweet, setHasInteractedWithTweet] = useState(() => {
    return sessionStorage.getItem('hasInteractedWithTweet') === 'true';
  });
  const [timer, setTimer] = useState(15); // 15-second verification timer
  const [checkStage, setCheckStage] = useState('follow'); // Stages: follow, tweet
  const [decoyDelay, setDecoyDelay] = useState(0); // Decoy delay for verification

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
    if (!hasClickedFollow || !hasInteractedWithTweet) {
      setShowPopup(true);
      setTimer(15);
      setCheckStage('follow');
      setDecoyDelay(5); // Initial decoy delay
      return;
    }
    const earned = await tap();
    if (earned) {
      toast.success(`Tap successful! You earned ${earned} STT`);
    }
  };

  const handleFollowClick = () => {
    setHasClickedFollow(true);
    sessionStorage.setItem('hasClickedFollow', 'true');
    window.open('https://x.com/sireadell', '_blank');
    toast.info('Please follow @sireadell to proceed!');
  };

  const handleTweetInteractionClick = () => {
    setHasInteractedWithTweet(true);
    sessionStorage.setItem('hasInteractedWithTweet', 'true');
    window.open('https://x.com/Sireadell/status/1947369821181530579', '_blank');
    toast.info('Please like/RT and comment on the Educative Tweet!');
  };

  const handleConfirmAction = () => {
    if (checkStage === 'follow' && hasClickedFollow) {
      setCheckStage('tweet');
      setTimer(15);
      toast.info('Now, please like and comment on the educative tweet!');
    } else if (checkStage === 'tweet' && hasInteractedWithTweet) {
      // Apply decoy delay to simulate verification
      setTimeout(() => {
        setShowPopup(false);
        toast.success('Follow, like, and comment verified! Start tapping!');
      }, decoyDelay * 1000);
    } else {
      // Increase decoy delay if user tries to bypass
      setDecoyDelay((prev) => prev + 5);
      toast.warn(`Please complete the ${checkStage} action first! Verification delayed.`);
    }
  };

  useEffect(() => {
    if (showPopup && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (showPopup && timer === 0) {
      if (checkStage === 'follow' && hasClickedFollow) {
        setCheckStage('tweet');
        setTimer(15);
        toast.info('Please like and comment on the educative tweet now!');
      } else if (checkStage === 'tweet' && hasInteractedWithTweet) {
        // Apply decoy delay before closing popup
        setTimeout(() => {
          setShowPopup(false);
          toast.success('Follow, like, and comment verified! Start tapping!');
        }, decoyDelay * 1000);
      } else {
        // Reset timer and increase decoy delay for incomplete actions
        setTimer(15);
        setDecoyDelay((prev) => prev + 5);
        toast.warn(`Please complete the ${checkStage} action! Verification delayed.`);
      }
    }
  }, [showPopup, timer, checkStage, hasClickedFollow, hasInteractedWithTweet, decoyDelay]);

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
          disabled={loading || userStats.tapsToday >= MAX_TAPS_PER_DAY || showPopup}
          aria-label="Tap the gem"
          className={`relative w-64 h-64 rounded-full shadow-2xl flex items-center justify-center transition-transform
            ${
              loading || userStats.tapsToday >= MAX_TAPS_PER_DAY || showPopup
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

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center max-w-sm">
            <h2 className="text-2xl font-bold mb-4">Join the Tap & Learn Party!</h2>
            <p className="mb-4">
              {checkStage === 'follow' ? (
                <>
                  To start tapping, follow{' '}
                  <a
                    href="https://x.com/sireadell"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 underline"
                    onClick={handleFollowClick}
                  >
                    @sireadell
                  </a>
                  .
                </>
              ) : (
                <>
                  Like and comment on the{' '}
                  <a
                    href="https://x.com/Sireadell/status/1947369821181530579"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 underline"
                    onClick={handleTweetInteractionClick}
                  >
                    educative tweet
                  </a>
                  {' '}to share your Web3 insights!
                </>
              )}
            </p>
            <div className="mb-4">
              <p>Verification in progress... {timer}s remaining</p>
              <div className="w-8 h-8 mx-auto animate-spin">
                <div className="w-full h-full rounded-full border-4 border-t-transparent border-gradient-to-r from-purple-700 to-pink-600"></div>
              </div>
            </div>
            <button
              onClick={handleConfirmAction}
              className="bg-purple-600 px-4 py-2 rounded-lg mr-2"
              disabled={timer > 0}
            >
              {checkStage === 'follow' ? 'I’ve Followed' : 'I’ve Liked & Commented'}
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-gray-600 px-4 py-2 rounded-lg"
              disabled={timer > 0 || decoyDelay > 0}
            >
              Close
            </button>
            {decoyDelay > 0 && (
              <p className="mt-2 text-sm text-yellow-400">
                Extended verification due to incomplete actions: {decoyDelay}s
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}