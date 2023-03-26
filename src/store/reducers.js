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
    switch (action.type) {
        case 'CONTRACT_LOADED':
            let _state = { ...state }
            _state[`${action.contractName}`] = { ...action.contract, loaded: true }
            return { ..._state }

        default:
            return state
    }
}

export { provider, contracts }