import React, { useState, useEffect, useContext } from 'react';
import { useTapGem } from '@/hooks/useTapGem';
import { WalletContext } from '@/contexts/WalletContext';
import { toast } from 'react-toastify';
import TapComponents from '@/components/TapComponents.jsx';
import VerificationPopup from '@/components/VerificationPopup.jsx';

export default function TapPage() {
  const { userStats, loading, claiming, tap, claimReward } = useTapGem();
  const { account, connectWallet } = useContext(WalletContext);
  const MAX_TAPS_PER_DAY = 20;

  const [showPopup, setShowPopup] = useState(false);
  const [stage, setStage] = useState('follow'); // follow -> captcha
  const [hasClickedFollow, setHasClickedFollow] = useState(() => sessionStorage.getItem('hasClickedFollow') === 'true');
  const [isVerified, setIsVerified] = useState(() => sessionStorage.getItem('isVerified') === 'true');
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

  const handleNextStage = () => {
    if (stage === 'follow' && hasClickedFollow) {
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
  }, [showPopup, timer, stage, hasClickedFollow, captchaAnswer, decoyDelay]);

  return (
    <div className="flex flex-grow gap-8 p-8 bg-black/60 backdrop-blur-md rounded-xl shadow-xl w-full">
      <TapComponents
        userStats={userStats}
        loading={loading}
        claiming={claiming}
        handleTap={handleTap}
        claimReward={claimReward}
        getRank={getRank}
        MAX_TAPS_PER_DAY={MAX_TAPS_PER_DAY}
      />
      <VerificationPopup
        showPopup={showPopup}
        stage={stage}
        timer={timer}
        captchaAnswer={captchaAnswer}
        captchaQuestion={captchaQuestion}
        decoyDelay={decoyDelay}
        setCaptchaAnswer={setCaptchaAnswer}
        handleFollowClick={handleFollowClick}
        handleNextStage={handleNextStage}
        setShowPopup={setShowPopup}
      />
    </div>
  );
}