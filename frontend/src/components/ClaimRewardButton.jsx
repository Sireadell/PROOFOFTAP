import React from 'react';
import Button from './Button';

export default function ClaimRewardButton({ onClick, disabled }) {
  return (
    <Button onClick={onClick} disabled={disabled} className="w-full max-w-xs">
      Claim Reward
    </Button>
  );
}
