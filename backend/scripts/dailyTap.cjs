require('dotenv').config({ path: '../../.env' });

const { ethers } = require("ethers");

// Paste the ABI of your TapGem contract here
const abi = [
  "function tap() external",
  "event Tapped(address indexed user, uint256 timestamp)",
  "function getUserStats(address user) external view returns (uint256 tapsToday, uint256 currentStreak, uint256 points, uint256 totalRewardClaimed)"
];

// Helper sleep function
const sleep = ms => new Promise(res => setTimeout(res, ms));

async function main() {
  if (!process.env.SOMNIA_RPC_URL || !process.env.PRIVATE_KEY || !process.env.TAPGEM_CONTRACT_ADDRESS) {
    throw new Error("Missing required environment variables: SOMNIA_RPC_URL, PRIVATE_KEY, or TAPGEM_CONTRACT_ADDRESS");
  }

  const provider = new ethers.providers.JsonRpcProvider(process.env.SOMNIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const contract = new ethers.Contract(process.env.TAPGEM_CONTRACT_ADDRESS, abi, wallet);

  let tapsDone = 0;

  for (let i = 1; i <= 20; i++) {
    try {
      const tx = await contract.tap();
      await tx.wait();
      tapsDone++;
      console.log(`Tap ${i} succeeded.`);
      await sleep(500); // optional delay
    } catch (error) {
      // Attempt to find revert message
      const message = 
        error?.error?.message || 
        error?.data?.message || 
        error?.message || 
        "Unknown error";

      if (message.toLowerCase().includes("max taps reached")) {
        console.log(`Tap limit reached at tap number ${tapsDone}. Stopping.`);
        break;
      }

      console.error(`Error on tap ${i}:`, message);
      break;
    }
  }

  // Show summary of user stats
  const stats = await contract.getUserStats(wallet.address);
  console.log(`\nSummary for address ${wallet.address}:`);
  console.log(`Taps today: ${stats.tapsToday.toString()}`);
  console.log(`Current streak: ${stats.currentStreak.toString()}`);
  console.log(`Points: ${stats.points.toString()}`);
  console.log(`Total rewards claimed: ${ethers.utils.formatEther(stats.totalRewardClaimed)} native tokens`);

  console.log(`\nTotal taps done this run: ${tapsDone}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
