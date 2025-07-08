import React from 'react';
import Button from './Button';

export default function ClaimRewardButton({ onClick, disabled, amount = '0.0' }) {
  const displayAmount = parseFloat(amount || '0').toFixed(3);

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full max-w-xs"
    >
      {`Claim ${displayAmount} STT`}
    </Button>
  );
}
