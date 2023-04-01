const fs = require('fs');
const config = require('src/config.json')

const writeToFile = (data, chainId) => {
  const result = { ...config }
  result[chainId] = {}

  data.forEach(item => {
    result[chainId][item[0]] = {"address": item[1]}
  })

  fs.writeFileSync('src/config.json', JSON.stringify(result));
}

async function main() {
  const [ deployer, feeAccount ] = await ethers.getSigners()

    const ExchangeC = await ethers.getContractFactory("Exchange")
    const TokenC = await ethers.getContractFactory("Token")

    const tokens = [
      ["Dex Token", "DXT", 2000000],
      ["Mocked DAI", "mDAI", 2000000],
      ["Mocked ETH", "mETH", 2000000]
    ]

    const data = []

    const ExchangeD = await ExchangeC.deploy(feeAccount.address, 10)
    await ExchangeD.deployed()
    console.log(`Exchange contract was deployed @ ${ ExchangeD.address }`)
    data.push(["exchange", ExchangeD.address])

    for await (let item of tokens) {
      const [ _name, _sym, _supply ] = item
      const TokenD = await TokenC.deploy(_name, _sym, _supply)
      await TokenD.deployed()
      console.log(`Token contract: ${ _name }(${ _sym }) was deployed @ ${ TokenD.address }`)
      data.push([_sym, TokenD.address])
    }

    const { chainId } = await ethers.provider.getNetwork()
    writeToFile(data, chainId);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});