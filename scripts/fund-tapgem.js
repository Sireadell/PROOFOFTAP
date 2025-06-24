import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.SOMNIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const sttTokenAddress = process.env.STT_TOKEN_ADDRESS;
  const tapGemAddress = process.env.TAPGEM_ADDRESS;
  const amountToSend = process.env.AMOUNT_TO_SEND; // e.g. "10" for 10 STT tokens

  if (!sttTokenAddress || !tapGemAddress || !amountToSend) {
    console.error("Missing STT_TOKEN_ADDRESS, TAPGEM_ADDRESS, or AMOUNT_TO_SEND in .env");
    return;
  }

  const sttToken = new ethers.Contract(sttTokenAddress, ERC20_ABI, wallet);

  const amount = ethers.utils.parseEther(amountToSend);

  const balance = await sttToken.balanceOf(wallet.address);
  console.log("Your STT balance:", ethers.utils.formatEther(balance));

  if (balance.lt(amount)) {
    console.error("Not enough STT tokens to fund the contract.");
    return;
  }

  const tx = await sttToken.transfer(tapGemAddress, amount);
  console.log("Transfer tx hash:", tx.hash);
  await tx.wait();
  console.log(`Successfully transferred ${amountToSend} STT to TapGem contract.`);
}

main().catch(console.error);
