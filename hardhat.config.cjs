require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.28",
  paths: {
    sources: "./backend/contracts",
    artifacts: "./backend/artifacts",
    cache: "./backend/cache"
  },
  networks: {
    somnia: {
      url: process.env.SOMNIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : []
    }
  }
};
