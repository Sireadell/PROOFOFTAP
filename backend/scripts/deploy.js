async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const TapGem = await ethers.getContractFactory("TapGem");
  const tapGem = await TapGem.deploy();

  await tapGem.deployed();
  console.log("TapGem deployed to:", tapGem.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
