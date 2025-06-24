require("dotenv").config();
const { ethers } = require("ethers");

// Paste the ABI of your TapGem contract here
const abi = [
  "function tap() external",
  "event Tapped(address indexed user, uint256 timestamp)",
  "function getUserStats(address user) external view returns (uint256 tapsToday, uint256 currentStreak, uint256 points, uint256 totalRewardClaimed)"
];

async function main() {
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
    } catch (error) {
      // If revert due to max taps reached, stop and notify
      if (error.error && error.error.message.includes("max taps reached")) {
        console.log(`Tap limit reached at tap number ${tapsDone}. Stopping.`);
        break;
      }
      // Other errors
      console.error(`Error on tap ${i}:`, error.message || error);
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
