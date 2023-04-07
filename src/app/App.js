import { useDispatch } from "react-redux";
import { handleProvider, handleNetwork, handleContract, handleAccount } from "store/handlers"
import { Navbar } from "components"
import { useEffect, useState } from "react";
import Markets from "./Markets";


function App() {
  const dispatch = useDispatch()
  const [ tokens, setTokens ] = useState({ "DXT": false, "mETH": false, "mDAI": false })

  const loadBlockChainData = async () => {
    const provider = handleProvider(dispatch)
    const chainId = await handleNetwork(provider, dispatch)

    window.ethereum.on('chainChanged', () => window.location.reload())

    window.ethereum.on('accountsChanged', async () => {
      await handleAccount(provider, dispatch)
    })

    const exchange = await handleContract(chainId, "exchange", provider, dispatch)

    const tempTokens = { ...tokens }

    Object.keys(tokens).forEach(async token => {
      const loaded = await handleContract(chainId, token, provider, dispatch)
      if (loaded) {
        tempTokens[token] = true
        setTokens(tempTokens)
      }
    })
  }

  useEffect(() => {
    loadBlockChainData()
  }, [])

  console.log(tokens)

  return (
    <div>
      <Navbar />
      <main className='exchange grid'>
        <section className='exchange__section--left grid'>
          <Markets contractsLoaded={ Object.values(tokens).every(i => i) } />
        </section>
        <section className='exchange__section--right grid'>

        </section>
      </main>
    </div>
  );
}

export default App;