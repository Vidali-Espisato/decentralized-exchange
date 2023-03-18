const { ethers } = require("hardhat");

async function main() {
    const TokenC = await ethers.getContractFactory("Token")
    const TokenD = await TokenC.deploy()

    await TokenD.deployed()
    console.log("Token contract was deployed @ ", TokenD.address)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});