const provider = ( state={}, action ) => {
    const { connection, chainId, account } = action

    switch (action.type) {
        case 'PROVIDER_LOADED':
            return { ...state, connection}
        case 'NETWORK_LOADED':
            return { ...state, chainId }
        case 'ACCOUNT_LOADED':
            return { ...state, account }

        default:
            return state
    }
}

const contracts = ( state={}, action) => {
    const { contractName, contract, symbol, market } = action
    switch (action.type) {
        case 'CONTRACT_LOADED':
            let _state = { ...state }
            _state[contractName] = { ...contract, symbol, loaded: true }
            return { ..._state }
        case 'MARKET_SELECTED':
            return { ...state, market }

        default:
            return state
    }
}

export { provider, contracts }