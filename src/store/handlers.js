import { ethers } from "ethers"
import config from "config.json"
import abis from "abis"


const handleProvider = dispatch => {
    const connection = new ethers.providers.Web3Provider(window.ethereum)
    dispatch({ type: "PROVIDER_LOADED", connection })

    return connection
}


const handleNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork()
    dispatch({ type: "NETWORK_LOADED", chainId })

    return chainId
}


const handleAccount = async (provider, dispatch) => {
    const accounts = await window.ethereum.request({method: "eth_requestAccounts"})
    const address = ethers.utils.getAddress(accounts[0])

    let balance = await provider.getBalance(address)
    balance = parseFloat(ethers.utils.formatEther(balance))

    const account = { address, balance }
    dispatch({ type: "ACCOUNT_LOADED", account })

    return account
}


const handleContract = async (chainId, contractName, provider, dispatch) => {
    let _cname = contractName === "exchange"?  contractName : "token"
    const contract = new ethers.Contract(config[chainId][contractName].address, abis[_cname], provider)

    let symbol;
    if (contractName !== "exchange") symbol = await contract.symbol()

    dispatch({ type: "CONTRACT_LOADED", contract, contractName, symbol })

    return contract
}

export { handleProvider, handleNetwork, handleAccount, handleContract }