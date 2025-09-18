import React, { useState, useEffect } from 'react';

export default function VerificationPopup({
  showPopup,
  stage: propStage,
  captchaAnswer,
  captchaQuestion,
  decoyDelay,
  setCaptchaAnswer,
  handleFollowClick,
  handleNextStage,
  setShowPopup,
}) {
  if (!showPopup) return null;

  const [followStatus, setFollowStatus] = useState('pending');
  const [followLinkClicked, setFollowLinkClicked] = useState(false);
  const [followStatusMessage, setFollowStatusMessage] = useState(null);
  const [checkingFollow, setCheckingFollow] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simulated decoy verification for follow (12–15 seconds)
  const verifyFollow = async () => {
    setCheckingFollow(true);
    setFollowStatusMessage('Verifying Follow...');
    try {
      const delay = Math.floor(Math.random() * (15000 - 12000 + 1)) + 12000; // 12–15s
      await new Promise((resolve) => setTimeout(resolve, delay));
      setFollowStatus('verified');
      setFollowStatusMessage(null);
    } catch (error) {
      setFollowStatus('failed');
      setFollowStatusMessage('Failed to verify follow. Please try again.');
    } finally {
      setCheckingFollow(false);
    }
  };

  useEffect(() => {
    if (propStage === 'follow' && followLinkClicked && !checkingFollow) {
      verifyFollow();
    }
  }, [propStage, followLinkClicked]);

  const handleLinkClick = (e) => {
    e.preventDefault();
    handleFollowClick();
    window.open('https://x.com/sireadell', '_blank');
    setFollowLinkClicked(true);
  };

  const handleProceed = async () => {
    setErrorMessage(null);

    if (propStage === 'follow') {
      // Skip check — following is optional
      setLoading(true);
      try {
        await handleNextStage(true);
      } catch (error) {
        setErrorMessage('An error occurred. Please try again or contact support.');
      } finally {
        setLoading(false);
      }
    } else if (propStage === 'captcha') {
      if (captchaAnswer.trim() === '') {
        setErrorMessage('Please enter the captcha answer.');
        return;
      }
      setLoading(true);
      try {
        await handleNextStage(false);
      } catch (error) {
        setErrorMessage('An error occurred. Please try again or contact support.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-black/80 to-purple-900/60 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-gray-900/90 p-6 rounded-2xl shadow-xl text-center max-w-sm w-full border border-purple-400/20">
        <h2 className="text-2xl font-bold text-white mb-3">Verify to Tap!</h2>

        {errorMessage && <div className="text-red-400 text-xs mb-2">{errorMessage}</div>}

        {/* Progress Indicator */}
        <div className="flex justify-between text-[10px] mb-3 text-gray-300 font-medium">
          <span className={propStage === 'follow' ? 'text-purple-300 font-semibold' : 'text-gray-500'}>
            1. Follow (Optional)
          </span>
          <span className={propStage === 'captcha' ? 'text-purple-300 font-semibold' : 'text-gray-500'}>
            2. Verify
          </span>
        </div>

        {/* Stages */}
        <div className="mb-4">
          {propStage === 'follow' ? (
            <div className="text-gray-200 text-xs">
              <p>
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
                {followStatus === 'verified' && <span className="text-green-400">✓ Verified</span>}
              </p>
              <p className="mt-2 text-gray-400 text-xs">(Optional — you can skip this step)</p>
            </div>
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

        {/* Buttons */}
        <div className="flex justify-center gap-2">
          <button
            onClick={handleProceed}
            disabled={loading || checkingFollow}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1.5 rounded-lg text-white text-xs font-medium hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Verifying...' : propStage === 'follow' ? 'Continue' : 'Verify Humanity'}
          </button>
          <button
            onClick={() => {
              setShowPopup(false);
            }}
            className="bg-gray-700/50 px-4 py-1.5 rounded-lg text-white text-xs font-medium hover:bg-gray-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
