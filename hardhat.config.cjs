require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.28",
  networks: {
    somnia: {
      url: process.env.SOMNIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : []
    }
  }
};
