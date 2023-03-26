import { ethers } from "ethers"
import config from "../config.json"
import abis from "../abis"


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


const handleAccount = async dispatch => {
    const accounts = await window.ethereum.request({method: "eth_requestAccounts"})
    const account = ethers.utils.getAddress(accounts[0])
    dispatch({ type: "ACCOUNT_LOADED", account })

    return account
}


const handleContract = (chainId, contractName, provider, dispatch) => {
    const contract = new ethers.Contract(config[chainId][contractName].address, abis[contractName], provider)
    dispatch({ type: "CONTRACT_LOADED", contract, contractName })

    return contract
}

export { handleProvider, handleNetwork, handleAccount, handleContract }