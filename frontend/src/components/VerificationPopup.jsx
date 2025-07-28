import React, { useState, useEffect } from 'react';

export default function VerificationPopup({
  showPopup,
  stage: propStage,
  timer,
  captchaAnswer,
  captchaQuestion,
  decoyDelay,
  setCaptchaAnswer,
  handleFollowClick,
  handleNextStage = () => Promise.resolve(),
  setShowPopup,
}) {
  if (!showPopup) return null;

  // Define safeTimer to prevent undefined errors
  const safeTimer = Math.max(0, timer);

  // Use propStage directly, avoiding internal state for stage
  const linkClicked = sessionStorage.getItem('hasFollowedSireadell') === 'true';

  // State for countdown (48 hours from July 29, 2025, 01:28 AM CEST)
  const endDate = new Date('2025-07-31T01:28:00+02:00').getTime();
  const [giveawayActive, setGiveawayActive] = useState(true);
  const [countdown, setCountdown] = useState(Math.floor((endDate - Date.now()) / 1000));
  // State for error display
  const [errorMessage, setErrorMessage] = useState(null);
  // State for loading
  const [loading, setLoading] = useState(false);

  // Countdown timer logic (run once on mount, updated to current time)
  useEffect(() => {
    if (countdown > 0) {
      const timerId = setInterval(() => {
        setCountdown((prev) => {
          const newCountdown = Math.floor((endDate - Date.now()) / 1000);
          if (newCountdown <= 0) {
            setGiveawayActive(false);
            return 0;
          }
          return newCountdown;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, []); // Empty dependency array to run once on mount

  // Handle decoyDelay to show only once, simplified
  useEffect(() => {
    let timeoutId;
    if (decoyDelay > 0) {
      timeoutId = setTimeout(() => {
        // No toast visibility state needed; let TapPage handle toasts
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [decoyDelay]);

  const handleLinkClick = (e) => {
    e.preventDefault();
    handleFollowClick(e);
    window.open('https://x.com/sireadell', '_blank');
  };

  const canProceed = propStage === 'follow'
    ? linkClicked && safeTimer === 0
    : (giveawayActive || propStage === 'captcha') && captchaAnswer.trim() !== '' && safeTimer === 0;

  const handleProceed = async () => {
    if (canProceed) {
      setLoading(true);
      try {
        if (propStage === 'follow' && linkClicked) {
          // Stage update is handled by TapPage via handleNextStage
        } else {
          await handleNextStage();
          setShowPopup(false);
        }
      } catch (error) {
        setErrorMessage('An error occurred. Please try again or contact support.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Format countdown for display
  const days = Math.floor(countdown / 86400);
  const hours = Math.floor((countdown % 86400) / 3600);
  const minutes = Math.floor((countdown % 3600) / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-black/80 to-purple-900/60 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-gray-900/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl text-center max-w-sm w-full max-h-[80vh] overflow-auto border border-purple-400/20">
        {/* Header */}
        <h2 className="text-2xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          {giveawayActive ? '500K Taps Celebration!' : 'Verify to Tap!'}
        </h2>
        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-400 text-xs mb-2">{errorMessage}</div>
        )}
        {/* Giveaway Instructions (shown during countdown) */}
        {giveawayActive && (
          <div className="bg-purple-900/10 p-3 rounded-lg mb-4 text-gray-100 text-xs">
            {/* Prominent Win Text */}
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg mb-2">
              <p className="text-base font-bold text-white">
                🎁 Win <span className="text-lg text-yellow-300">10 STT!</span> 50 Winners!
              </p>
            </div>
            <ul className="text-left list-disc list-inside mt-1">
              <li>
                Follow{' '}
                <a
                  href="https://x.com/sireadell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-200 underline"
                  onClick={handleLinkClick}
                >
                  @Sireadell
                </a>
              </li>
              <li>
                Like & comment on{' '}
                <a
                  href="https://x.com/Sireadell/status/1949967282181914720"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-200 underline"
                >
                  this post
                </a>
              </li>
              <li>Share honest feedback about Proof of Tap</li>
              <li>Tag 2 friends in your comment</li>
            </ul>
            {/* Prominent Countdown */}
            <div className="mt-3 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <p className="text-base font-bold text-white">⏰ Giveaway Ends in</p>
              <p className="text-lg text-yellow-300">
                {days}d {hours}h {minutes}m {seconds}s
              </p>
              <p className="text-[10px] text-gray-300 mt-1">July 31, 2025, 01:28 AM CEST</p>
            </div>
          </div>
        )}
        {/* Progress Indicator (shown after giveaway ends) */}
        {!giveawayActive && (
          <div className="flex justify-between text-[10px] mb-3 text-gray-300 font-medium">
            <span className={propStage === 'follow' ? 'text-purple-300 font-semibold' : 'text-gray-500'}>
              1. Follow
            </span>
            <span className={propStage === 'captcha' ? 'text-purple-300 font-semibold' : 'text-gray-500'}>
              2. Verify
            </span>
          </div>
        )}
        {/* Verification Stages */}
        <div className="mb-4">
          {giveawayActive ? (
            <>
              <p className="text-gray-200 text-xs mb-2">{captchaQuestion.question}</p>
              <input
                type="number"
                placeholder="Enter answer"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-800/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              />
            </>
          ) : propStage === 'follow' ? (
            <p className="text-gray-200 text-xs">
              Follow{' '}
              <a
                href="https://x.com/sireadell"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-200 font-medium"
                onClick={handleLinkClick}
              >
                @sireadell
              </a>{' '}
              to proceed.
            </p>
          ) : (
            <>
              <p className="text-gray-200 text-xs mb-2">{captchaQuestion.question}</p>
              <input
                type="number"
                placeholder="Enter answer"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-800/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              />
            </>
          )}
        </div>
        {/* Timer Bar */}
        <div className="mb-4">
          <p className="text-gray-400 text-[10px] mb-1">Verification in {safeTimer}s</p>
          <div className="w-full h-1 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-1000"
              style={{ width: `${(safeTimer / 10) * 100}%` }}
            />
          </div>
        </div>
        {/* Buttons */}
        <div className="flex justify-center gap-2">
          <button
            onClick={handleProceed}
            disabled={!canProceed || loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1.5 rounded-lg text-white text-xs font-medium hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </>
            ) : giveawayActive || propStage === 'captcha' ? (
              'Verify Humanity'
            ) : (
              'I’ve Followed'
            )}
          </button>
          <button
            onClick={() => setShowPopup(false)}
            disabled={safeTimer > 0 || decoyDelay > 0}
            className="bg-gray-700/50 px-4 py-1.5 rounded-lg text-white text-xs font-medium hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
          >
            Close
          </button>
        </div>
        {/* Toast for decoyDelay */}
        {decoyDelay > 0 && (
          <div className="mt-2 text-[10px] text-yellow-300 bg-yellow-900/20 p-1.5 rounded-lg">
            Complete the {giveawayActive || propStage === 'captcha' ? 'captcha' : 'follow'} step first! Delayed by {Math.min(decoyDelay, 30)}s.
          </div>
        )}
        {/* Terms Link */}
        <a
          href="/giveaway-terms"
          className="mt-3 text-[10px] text-purple-300 hover:text-purple-200 underline"
        >
          {giveawayActive ? 'Giveaway Terms' : 'Terms'}
        </a>
      </div>
    </div>
  );
}