import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

async function checkNetwork() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.SOMNIA_RPC_URL);

  try {
    const network = await provider.getNetwork();
    console.log("Connected network:", network);
  } catch (error) {
    console.error("Error getting network:", error);
  }
}

checkNetwork();

