import { ethers } from "ethers";
import { useEffect, useState } from "react";
import config from "../config.json"
import exchangeAbi from "../abis/Exchange.json"


function App() {
  const [ accounts, setAccounts ] = useState([])

  const loadBlockChainData = async () => {
    const _accounts = await window.ethereum.request({method: "eth_requestAccounts"})
    setAccounts(_accounts)

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const { chainId } = await provider.getNetwork()

    const exchange = new ethers.Contract(config[chainId].exchange.address, exchangeAbi, provider)
    console.log(exchange.address)

    const feePercent = await exchange.feePercent()
    console.log(feePercent.toString())

  }

  useEffect(() => {
    loadBlockChainData()
  }, [])


  return (
    <div>
      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

        </section>
        <section className='exchange__section--right grid'>

        </section>
      </main>
    </div>
  );
}

export default App;