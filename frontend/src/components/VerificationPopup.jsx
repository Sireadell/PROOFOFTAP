import React, { useState, useEffect } from 'react';

export default function VerificationPopup({
  showPopup,
  stage: propStage,
  captchaAnswer,
  captchaQuestion,
  decoyDelay,
  setCaptchaAnswer,
  handleFollowClick,
  handleTweetClick,
  handleNextStage,
  setShowPopup,
}) {
  if (!showPopup) return null;

  // State for follow and interaction status
  const [followStatus, setFollowStatus] = useState('pending');
  const [interactionStatus, setInteractionStatus] = useState('pending');
  const [followLinkClicked, setFollowLinkClicked] = useState(false);
  const [tweetLinkClicked, setTweetLinkClicked] = useState(false);
  const [followStatusMessage, setFollowStatusMessage] = useState(null);
  const [interactionStatusMessage, setInteractionStatusMessage] = useState(null);
  const [checkingFollow, setCheckingFollow] = useState(false);
  const [checkingInteraction, setCheckingInteraction] = useState(false);
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

  // Simulated decoy verification for interaction (10 seconds)
  const verifyInteraction = async () => {
    setCheckingInteraction(true);
    setInteractionStatusMessage('Verifying Interaction...');
    try {
      const delay = 10000; // 10s
      await new Promise((resolve) => setTimeout(resolve, delay));
      setInteractionStatus('verified');
      setInteractionStatusMessage(null);
    } catch (error) {
      setInteractionStatus('failed');
      setInteractionStatusMessage('Failed to verify interaction. Please try again.');
    } finally {
      setCheckingInteraction(false);
    }
  };

  // Trigger verification when links are clicked
  useEffect(() => {
    if (propStage === 'follow' && followLinkClicked && !checkingFollow) {
      verifyFollow();
    }
  }, [propStage, followLinkClicked]);

  useEffect(() => {
    if (propStage === 'follow' && tweetLinkClicked && !checkingInteraction) {
      verifyInteraction();
    }
  }, [propStage, tweetLinkClicked]);

  const handleLinkClick = (e) => {
    e.preventDefault();
    handleFollowClick();
    window.open('https://x.com/sireadell', '_blank');
    setFollowLinkClicked(true);
  };

  const handleTweetLinkClick = (e) => {
    e.preventDefault();
    handleTweetClick();
    window.open('https://x.com/Sireadell/status/1953035343323607366', '_blank');
    setTweetLinkClicked(true);
  };

  // Check if follow stage is complete
  const isFollowStageComplete = followStatus === 'verified' && interactionStatus === 'verified' && followLinkClicked && tweetLinkClicked;

  const handleProceed = async () => {
    setErrorMessage(null);
    if (propStage === 'follow') {
      if (!followLinkClicked) {
        setErrorMessage('Please click the follow link to verify.');
        return;
      }
      if (!tweetLinkClicked) {
        setErrorMessage('Please click the tweet link to verify.');
        return;
      }
      if (followStatus !== 'verified' || interactionStatus !== 'verified') {
        setErrorMessage('Please wait for both verifications to complete.');
        return;
      }
      setLoading(true);
      try {
        await handleNextStage(true); // Signal follow stage completion
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
      <div className="bg-gray-900/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl text-center max-w-sm w-full max-h-[80vh] overflow-auto border border-purple-400/20">
        {/* Header */}
        <h2 className="text-2xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Verify to Tap!
        </h2>
        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-400 text-xs mb-2">{errorMessage}</div>
        )}
        {/* Status Messages (only shown in follow stage) */}
        {propStage === 'follow' && (followStatusMessage || interactionStatusMessage) && (
          <div className="text-yellow-300 text-xs mb-2 flex flex-col items-center justify-center">
            {followStatusMessage && (
              <div className="flex items-center">
                {checkingFollow && (
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-yellow-300"
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
                )}
                {followStatusMessage}
              </div>
            )}
            {interactionStatusMessage && (
              <div className="flex items-center mt-1">
                {checkingInteraction && (
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-yellow-300"
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
                )}
                {interactionStatusMessage}
              </div>
            )}
          </div>
        )}
        {/* Progress Indicator */}
        <div className="flex justify-between text-[10px] mb-3 text-gray-300 font-medium">
          <span className={propStage === 'follow' ? 'text-purple-300 font-semibold' : 'text-gray-500'}>
            1. Follow & Interact
          </span>
          <span className={propStage === 'captcha' ? 'text-purple-300 font-semibold' : 'text-gray-500'}>
            2. Verify
          </span>
        </div>
        {/* Verification Stages */}
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
                {followStatus === 'verified' ? (
                  <span className="text-green-400">✓ Verified</span>
                ) : followStatus === 'failed' ? (
                  <span className="text-red-400">✗ Failed</span>
                ) : (
                  <span className="text-yellow-300">⏳ Pending</span>
                )}
              </p>
              <p className="mt-1">
                Interact with{' '}
                <a
                  href="https://x.com/Sireadell/status/1953035343323607366"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-200 underline"
                  onClick={handleTweetLinkClick}
                >
                  this tweet
                </a>{' '}
                {interactionStatus === 'verified' ? (
                  <span className="text-green-400">✓ Verified</span>
                ) : interactionStatus === 'failed' ? (
                  <span className="text-red-400">✗ Failed</span>
                ) : (
                  <span className="text-yellow-300">⏳ Pending</span>
                )}
              </p>
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
            disabled={propStage === 'follow' ? !isFollowStageComplete : (captchaAnswer.trim() === '' || loading || checkingFollow || checkingInteraction)}
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
            ) : propStage === 'follow' ? (
              'I’ve Followed & Interacted'
            ) : (
              'Verify Humanity'
            )}
          </button>
          <button
            onClick={() => setShowPopup(false)}
            disabled={decoyDelay > 0 || checkingFollow || checkingInteraction}
            className="bg-gray-700/50 px-4 py-1.5 rounded-lg text-white text-xs font-medium hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
          >
            Close
          </button>
        </div>
        {/* Toast for decoyDelay */}
        {decoyDelay > 0 && (
          <div className="mt-2 text-[10px] text-yellow-300 bg-yellow-900/20 p-1.5 rounded-lg">
            Complete the {propStage === 'follow' ? 'follow & interact' : 'captcha'} step first! Delayed by {Math.min(decoyDelay, 30)}s.
          </div>
        )}
        {/* Terms Link */}
        <a
          href="/giveaway-terms"
          className="mt-3 text-[10px] text-purple-300 hover:text-purple-200 underline"
        >
          
        </a>
      </div>
    </div>
  );
}