import React from 'react';
import { getBadgeTier } from '@/utils/getBadgeTier';

export default function BadgeDisplay({ points }) {
  const { emoji, className, name } = getBadgeTier(points || 0);

  return (
    <span
      title={`Badge: ${name}`}
      className={`inline-block mr-1 select-none ${className}`}
      aria-label={`User badge: ${name}`}
    >
      {emoji}
    </span>
  );
}
