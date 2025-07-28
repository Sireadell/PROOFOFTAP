/**
 * Returns the badge info (name, emoji, css class) for a given point value
 */
export const getBadgeTier = (points) => {
  const tiers = [
    { name: "Newbie", emoji: "🟢", min: 0, index: 0 },
    { name: "Tapper", emoji: "🔵", min: 30, index: 1 },
    { name: "Streaker", emoji: "🟣", min: 150, index: 2 },
    { name: "Grinder", emoji: "🟠", min: 450, index: 3 },
    { name: "Champion", emoji: "🟡", min: 900, index: 4 },
    { name: "Legend", emoji: "🔴", min: 1800, index: 5 },
    { name: "Icon", emoji: "🟣✨", min: 3000, index: 6 },
    { name: "Immortal", emoji: "🌟", min: 5000, index: 7 },
  ];

  return [...tiers].reverse().find(tier => points >= tier.min) || tiers[0];
};
