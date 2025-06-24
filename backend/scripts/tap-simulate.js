import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// === CONFIG ===
const TAPGEM_ADDRESS = process.env.TAPGEM_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.SOMNIA_RPC_URL;

if (!TAPGEM_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
  console.error("Missing TAPGEM_ADDRESS, PRIVATE_KEY, or SOMNIA_RPC_URL in .env");
  process.exit(1);
}

// === CONTRACT ABI (simplified, add more if needed) ===
const TAPGEM_ABI = [
  "function tap() external",
  "function claimRewards() external",
  "function getUserStats(address) external view returns (uint256 tapsToday, uint256 currentStreak, uint256 points, uint256 totalSTTClaimed)",
  "event Tapped(address indexed user, uint256 timestamp, uint256 tapsToday)",
  "event RewardsClaimed(address indexed user, uint256 amount)"
];

// Lore messages mapping
const loreMessages = [
  "A faint hum... the Gem stirs.",
  "Energy received. It remembers you.",
  "You echo through time.",
  "Its glow intensifies.",
  "Connection deepens. Taplight surging.",
  "Ancient protocols reactivate.",
  "The veil between realms flickers.",
  "The Gem speaks: 'Do not stop now.'",
  "Stars shift above as you persist.",
  "Streak maintained. The relic breathes.",
  "Your rhythm binds us.",
  "You've drawn the attention of something vast...",
  "It glows in sync with your intent.",
  "Dreamlight accumulates.",
  "The cosmos bends closer.",
  "A faint whisper: 'Almost ready.'",
  "The Awakening nears completion.",
  "Tethers to the old realm reconnect.",
  "You have almost filled the Gem’s hunger.",
  "Enough for today. Let the Gem rest... until dawn."
];

async function main() {
  console.log("Connecting to network...");
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const tapGem = new ethers.Contract(TAPGEM_ADDRESS, TAPGEM_ABI, wallet);

  console.log(`Using wallet address: ${wallet.address}`);
  console.log("Starting tap simulation for the first day...\n");

  // Tap up to 20 times (max daily taps)
  for (let i = 1; i <= 20; i++) {
    try {
      const tx = await tapGem.tap();
      await tx.wait();

      // Fetch user stats after tap
      const stats = await tapGem.getUserStats(wallet.address);
      const tapsToday = stats.tapsToday.toNumber ? stats.tapsToday.toNumber() : stats.tapsToday;
      const currentStreak = stats.currentStreak.toNumber ? stats.currentStreak.toNumber() : stats.currentStreak;
      const points = stats.points.toNumber ? stats.points.toNumber() : stats.points;
      const totalSTTClaimed = ethers.utils.formatEther(stats.totalSTTClaimed);

      // Lore message for this tap number (1-based)
      const lore = i <= loreMessages.length ? loreMessages[i - 1] : "";

      console.log(`Tap #${i}: "${lore}"`);
      console.log(`Taps today: ${tapsToday}/20`);
      console.log(`Current streak: ${currentStreak} day(s)`);
      console.log(`Points earned: ${points}`);
      console.log(`Total STT claimed so far: ${totalSTTClaimed} STT`);
      console.log("----");

    } catch (error) {
      // If revert, show reason
      let reason = "";
      if (error.error && error.error.message) {
        reason = error.error.message;
      } else if (error.reason) {
        reason = error.reason;
      } else {
        reason = error.message;
      }
      console.log(`Tap #${i} failed: ${reason}`);
      console.log("Stopping further taps.");
      break;
    }
  }

  // Attempt to claim rewards
  console.log("\nAttempting to claim rewards...");
  try {
    const txClaim = await tapGem.claimRewards();
    await txClaim.wait();

    // Fetch stats again after claim
    const statsAfterClaim = await tapGem.getUserStats(wallet.address);
    const totalSTTClaimedAfter = ethers.utils.formatEther(statsAfterClaim.totalSTTClaimed);

    console.log("Reward claimed successfully!");
    console.log(`Total STT claimed now: ${totalSTTClaimedAfter} STT`);
  } catch (error) {
    let reason = "";
    if (error.error && error.error.message) {
      reason = error.error.message;
    } else if (error.reason) {
      reason = error.reason;
    } else {
      reason = error.message;
    }
    console.log(`Claim reward failed: ${reason}`);
  }

  // Leaderboard simulation: since your contract does not expose leaderboard,
  // we can only show current user points and mention leaderboard is handled off-chain.
  const userStats = await tapGem.getUserStats(wallet.address);
  const points = userStats.points.toNumber ? userStats.points.toNumber() : userStats.points;
  console.log("\nLeaderboard info:");
  console.log(`Your points: ${points}`);
  console.log("Leaderboard feature is off-chain — integrate with backend or TheGraph for full rankings.");

  console.log("\nSimulation complete.");
}

main().catch(console.error);
