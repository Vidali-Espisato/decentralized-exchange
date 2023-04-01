import { useDispatch } from "react-redux";
import { handleProvider, handleNetwork, handleContract, handleAccount } from "store/handlers"
import { Navbar } from "components"
import { useEffect } from "react";


function App() {
  const dispatch = useDispatch()

  const loadBlockChainData = async () => {
    const provider = handleProvider(dispatch)
    const chainId = await handleNetwork(provider, dispatch)

    window.ethereum.on('chainChanged', () => window.location.reload())

    window.ethereum.on('accountsChanged', async () => {
      await handleAccount(provider, dispatch)
    })

    const exchange = await handleContract(chainId, "exchange", provider, dispatch)
    console.log(exchange.address)

    const feePercent = await exchange.feePercent()
    console.log(feePercent.toString())

    const dexToken = await handleContract(chainId, "DXT", provider, dispatch)
    console.log(dexToken.address)
  }

  useEffect(() => {
    loadBlockChainData()
  }, [])


  return (
    <div>
      <Navbar />
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