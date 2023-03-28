import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { handleProvider, handleNetwork, handleContract, handleAccount } from "store/handlers"


function App() {
  const dispatch = useDispatch()

  const loadBlockChainData = async () => {
    const provider = handleProvider(dispatch)
    const chainId = await handleNetwork(provider, dispatch)

    const account = await handleAccount(provider, dispatch)
    console.log(account)

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