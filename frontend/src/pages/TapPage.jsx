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
  const [stage, setStage] = useState('follow'); // follow -> tweet -> captcha
  const [hasClickedFollow, setHasClickedFollow] = useState(() => sessionStorage.getItem('hasClickedFollow') === 'true');
  const [hasInteractedWithTweet, setHasInteractedWithTweet] = useState(() => sessionStorage.getItem('hasInteractedWithTweet') === 'true');
  const [isVerified, setIsVerified] = useState(() => sessionStorage.getItem('isVerified') === 'true'); // New state for verification
  const [tweetUrl, setTweetUrl] = useState('');
  const [timer, setTimer] = useState(10);
  const [decoyDelay, setDecoyDelay] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState(generateCaptcha());

  function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    return { question: `${num1} + ${num2} = ?`, answer: num1 + num2 };
  }

  const getRank = (points) => {
    if (points >= 501) return 'Master Tapper';
    if (points >= 101) return 'Pro Tapper';
    return 'Novice Tapper';
  };

  const handleTap = async () => {
    if (!account) {
      toast.error('Connect your wallet to start tapping!');
      try {
        await connectWallet();
      } catch (error) {
        console.error('Wallet connection failed:', error);
        toast.error('Wallet connection failed. Try again.');
      }
      return;
    }

    if (!isVerified) {
      setShowPopup(true);
      setStage('follow');
      setTimer(10);
      setDecoyDelay(3);
      return;
    }

    try {
      const earned = await tap();
      if (earned) {
        toast.success(`Tap successful! Earned ${earned} STT`);
      }
    } catch (error) {
      console.error('Tap error:', error);
      toast.error('Tap failed. Please try again.');
    }
  };

  const handleFollowClick = () => {
    setHasClickedFollow(true);
    sessionStorage.setItem('hasClickedFollow', 'true');
    window.open('https://x.com/sireadell', '_blank');
    toast.info('Followed @sireadell? Awesome, let’s keep going!');
  };

  const handleTweetInteractionClick = () => {
    setHasInteractedWithTweet(true);
    sessionStorage.setItem('hasInteractedWithTweet', 'true');
    window.open('https://x.com/Sireadell/status/1942579094937362539', '_blank');
    toast.info('Like & comment on the tweet, then paste your comment URL!');
  };

  const validateTweetUrl = (url) => {
    const regex = /^https:\/\/x\.com\/Sireadell\/status\/\/.*$/;
    return regex.test(url) || url === '';
  };

  const handleNextStage = () => {
    if (stage === 'follow' && hasClickedFollow) {
      setStage('tweet');
      setTimer(10);
      toast.info('Now like & comment on the tweet!');
    } else if (stage === 'tweet' && hasInteractedWithTweet) {
      if (!tweetUrl) {
        toast.warn('Please paste your tweet URL!');
        return;
      }
      setStage('captcha');
      setTimer(10);
      toast.info('Prove you’re not a bot with this quick math!');
    } else if (stage === 'captcha' && parseInt(captchaAnswer) === captchaQuestion.answer) {
      setTimeout(() => {
        setIsVerified(true);
        sessionStorage.setItem('isVerified', 'true');
        setShowPopup(false);
        toast.success('Verified! Start tapping!');
      }, decoyDelay * 1000);
    } else {
      setDecoyDelay((prev) => prev + 3);
      toast.warn(`Complete the ${stage} step first! Delayed by ${decoyDelay + 3}s.`);
    }
  };

  useEffect(() => {
    if (!showPopup || timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleNextStage();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPopup, timer, stage, hasClickedFollow, hasInteractedWithTweet, captchaAnswer, decoyDelay]);

  return (
    <div className="flex flex-grow gap-8 p-8 bg-black/60 backdrop-blur-md rounded-xl shadow-xl w-full">
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
          disabled={loading || userStats.tapsToday >= MAX_TAPS_PER_DAY || showPopup}
          className={`relative w-64 h-64 rounded-full shadow-2xl flex items-center justify-center transition-transform
            ${loading || userStats.tapsToday >= MAX_TAPS_PER_DAY || showPopup
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

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4 text-white">Join the Tap & Learn Party!</h2>
            <div className="flex justify-between text-sm mb-4 text-gray-400">
              <span className={stage === 'follow' ? 'text-purple-400 font-bold' : 'text-gray-500'}>1. Follow</span>
              <span className={stage === 'tweet' ? 'text-purple-400 font-bold' : 'text-gray-500'}>2.Like | RT | Comment</span>
              <span className={stage === 'captcha' ? 'text-purple-400 font-bold' : 'text-gray-500'}>3. Verify</span>
            </div>
            <div className="mb-4">
              {stage === 'follow' ? (
                <p className="text-gray-200">
                  Follow{' '}
                  <a
                    href="https://x.com/sireadell"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 underline hover:text-purple-300"
                    onClick={handleFollowClick}
                  >
                    @sireadell
                  </a>{' '}
                  to unlock tapping.
                </p>
              ) : stage === 'tweet' ? (
                <div>
                  <p className="text-gray-200 mb-2">
                    Like | RT & Comment on the{' '}
                    <a
                      href="https://x.com/Sireadell/status/1942579094937362539"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 underline hover:text-purple-300"
                      onClick={handleTweetInteractionClick}
                    >
                      Tweet
                    </a>{' '}
                    and paste your comment URL below.
                  </p>
                  <input
                    type="url"
                    placeholder="Paste your comment URL here"
                    value={tweetUrl}
                    onChange={(e) => setTweetUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-gray-200 mb-2">Prove you’re not a bot: {captchaQuestion.question}</p>
                  <input
                    type="number"
                    placeholder="Enter answer"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>
            <div className="mb-4">
              <p className="text-gray-400">Verification in {timer}s</p>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-1000"
                  style={{ width: `${(timer / 10) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={handleNextStage}
                disabled={timer > 0}
                className="bg-purple-600 px-4 py-2 rounded-lg text-white hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {stage === 'follow' ? 'I’ve Followed' : stage === 'tweet' ? 'I’ve Commented' : 'Verify Humanity'}
              </button>
              <button
                onClick={() => setShowPopup(false)}
                disabled={timer > 0 || decoyDelay > 0}
                className="bg-gray-600 px-4 py-2 rounded-lg text-white hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                Close
              </button>
            </div>
            {decoyDelay > 0 && (
              <p className="mt-2 text-sm text-yellow-400">Verification delayed by {decoyDelay}s due to incomplete steps.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}