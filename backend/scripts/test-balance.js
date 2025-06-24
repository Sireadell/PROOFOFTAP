import { ethers } from "ethers";
import { getAddress } from "ethers/lib/utils.js";
import dotenv from "dotenv";
dotenv.config();

async function testBalance() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.SOMNIA_RPC_URL, {
    name: "somnia",
    chainId: 50312,
    ensAddress: undefined,
  });

  if (!process.env.STT_TOKEN_ADDRESS) {
    console.error("STT_TOKEN_ADDRESS not set");
    return;
  }
  if (!process.env.TEST_WALLET_ADDRESS) {
    console.error("TEST_WALLET_ADDRESS not set");
    return;
  }

  const sttTokenAddress = getAddress(process.env.STT_TOKEN_ADDRESS);
  const walletAddress = getAddress(process.env.TEST_WALLET_ADDRESS);

  console.log("Using STT Token Address:", sttTokenAddress);
  console.log("Using Wallet Address:", walletAddress);

  const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];
  const sttToken = new ethers.Contract(sttTokenAddress, ERC20_ABI, provider);

  try {
    const balance = await sttToken.balanceOf(walletAddress);
    console.log("Balance:", ethers.utils.formatEther(balance));
  } catch (error) {
    console.error("Error calling balanceOf:", error);
  }
}

testBalance();
