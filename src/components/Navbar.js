import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Blockies from 'react-blockies'
import { handleAccount } from 'store/handlers'
import ethLogo from 'assets/eth.svg'
import config from 'config.json'


function Navbar() {
    const dispatch = useDispatch()
    const [ address, setAddress ] = useState("0x")
    const [ balance, setBalance ] = useState(0)
    const account = useSelector(state => state.provider.account)
    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)

    useEffect(() => {
        if (account) {
            setAddress(account.address)
            setBalance(account.balance)
        }
    }, [ account ])

    const accountHandler = async () => await handleAccount(provider, dispatch)
    const networkHandler = event => window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: event.target.value }]
    })

    return(
        <div className='exchange__header grid'>
            <div className='exchange__header--brand flex'>
                <h1>DXT Token Exchange</h1>
            </div>

            <div className='exchange__header--networks flex' onChange={ networkHandler }>
                <img src={ ethLogo } />
                <select name="networks" id="networks" value={ config[chainId] ? `0x${ Number(chainId).toString(16) }` : "0" }>
                    <option value="0" disabled>Select Network</option>
                    {
                        Object.entries(config).map(([k, v]) => (
                            <option value={ `0x${ Number(k).toString(16) }` }>{ v.chainName }</option>
                        ))
                    }
                </select>
            </div>

            <div className='exchange__header--account flex'>
                <p><small>Balance: </small>{ balance.toFixed(4) } ETH</p>
                {
                    account ? (
                        <a href={ `https://${ config[chainId]?.chainName.toLowerCase() }.etherscan.io/address/${ address }` } target="_blank">
                            { `${address.slice(0, 6)}...${address.slice(-4)}` }
                            <Blockies
                                seed={ address }
                                size={ 10 }
                                scale={ 3 }
                                color="#2187D0"
                                bgColor="#F1F2F9"
                                spotColor="#767F92"
                                className="identicon"
                            />
                        </a>
                    ) : (
                        <button className="button" onClick={ accountHandler }>Connect</button>
                    )
                }
            </div>
        </div>
    )
}

export default Navbar