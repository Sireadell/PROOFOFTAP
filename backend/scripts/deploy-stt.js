const hre = require("hardhat");

async function main() {
  const STTTokenVault = await hre.ethers.getContractFactory("STTTokenVault");

  // Use the actual STT token address from Somnia here:
  const sttTokenAddress = "0x7f89af8b3c0A68F536Ff20433927F4573CF001A3";

  const vault = await STTTokenVault.deploy(sttTokenAddress);
  await vault.deployed();

  console.log("✅ STTTokenVault deployed to:", vault.address);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
