import React, { useState, useEffect } from 'react';

function getSecondsUntilMidnightUTC() {
  const now = new Date();
  const midnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return Math.floor((midnightUTC - now) / 1000);
}

export default function CountdownTimer() {
  const [secondsLeft, setSecondsLeft] = useState(getSecondsUntilMidnightUTC());

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(getSecondsUntilMidnightUTC());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="text-center text-sm text-gray-400 select-none">
      Next tap reset in {hours}h {minutes}m {seconds}s (UTC)
    </div>
  );
}
