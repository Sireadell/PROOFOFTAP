import React, { useState, useEffect } from 'react';

export default function VerificationPopup({
  showPopup,
  stage,
  timer,
  captchaAnswer,
  captchaQuestion,
  decoyDelay,
  setCaptchaAnswer,
  handleFollowClick,
  handleNextStage,
  setShowPopup,
}) {
  if (!showPopup) return null;

  // State to track link clicks
  const [link1Clicked, setLink1Clicked] = useState(false);
  const [link2Clicked, setLink2Clicked] = useState(false);

  // Check session storage for follow completion on mount
  useEffect(() => {
    const hasFollowed = sessionStorage.getItem('hasFollowedSireadell');
    if (hasFollowed === 'true') {
      handleNextStage(); // Skip to captcha stage if already followed
    }
  }, [handleNextStage]);

  // Handle click for the first link (@sireadell)
  const handleLink1Click = (e) => {
    e.preventDefault(); // Prevent immediate navigation
    handleFollowClick(e); // Call the original follow click handler
    setLink1Clicked(true);
    window.open('https://x.com/sireadell', '_blank'); // Open in new tab
  };

  // Handle click for the second link (Somnia Network)
  const handleLink2Click = (e) => {
    e.preventDefault(); // Prevent immediate navigation
    setLink2Clicked(true);
    window.open('https://x.com/Sireadell/status/1947931149189230927', '_blank'); // Open in new tab
  };

  // Enable "I’ve Followed" button only when both links are clicked
  const isFollowComplete = link1Clicked && link2Clicked;
  const canProceed = stage === 'follow' ? isFollowComplete && timer === 0 : captchaAnswer.trim() !== '';

  // Save follow completion to session storage when proceeding
  const handleProceed = () => {
    if (stage === 'follow' && isFollowComplete) {
      sessionStorage.setItem('hasFollowedSireadell', 'true');
    }
    handleNextStage();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-white">Join the Tap & Learn Party!</h2>
        <div className="flex justify-between text-sm mb-4 text-gray-400">
          <span className={stage === 'follow' ? 'text-purple-400 font-bold' : 'text-gray-500'}>1. Follow</span>
          <span className={stage === 'captcha' ? 'text-purple-400 font-bold' : 'text-gray-500'}>2. Verify</span>
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
                onClick={handleLink1Click}
              >
                @sireadell
              </a>{' '}
              and Interact with{' '}
              <a
                href="https://x.com/Sireadell/status/1947931149189230927"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 underline hover:text-purple-300"
                onClick={handleLink2Click}
              >
                This Tweet
              </a>{' '}
              to unlock tapping.
            </p>
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
            onClick={handleProceed}
            disabled={!canProceed}
            className="bg-purple-600 px-4 py-2 rounded-lg text-white hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {stage === 'follow' ? 'I’ve Followed' : 'Verify Humanity'}
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
  );
}
