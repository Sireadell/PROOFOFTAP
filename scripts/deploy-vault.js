const hre = require("hardhat");

async function main() {
  const sttTokenAddress = process.env.VITE_SOMNIA_STT_ADDRESS;
  if (!sttTokenAddress) throw new Error("❌ STT token address missing in .env");

  const Vault = await hre.ethers.getContractFactory("STTTokenVault");
  const vault = await Vault.deploy(sttTokenAddress);

  await vault.deployed();
  console.log("✅ STTTokenVault deployed to:", vault.address);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});

