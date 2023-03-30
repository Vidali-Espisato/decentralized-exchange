import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Blockies from 'react-blockies'
import { handleAccount } from 'store/handlers'


function Navbar() {
    const dispatch = useDispatch()
    const [ address, setAddress ] = useState("0x")
    const [ balance, setBalance ] = useState(0)
    const account = useSelector(state => state.provider.account)
    const provider = useSelector(state => state.provider.connection)

    useEffect(() => {
        if (account) {
            setAddress(account.address)
            setBalance(account.balance)
        }
    }, [ account ])

    const accountHandler = async () => await handleAccount(provider, dispatch)

    return(
        <div className='exchange__header grid'>
            <div className='exchange__header--brand flex'>
                <h1>DXT Token Exchange</h1>
            </div>

            <div className='exchange__header--networks flex'>
            </div>

            <div className='exchange__header--account flex'>
                <p><small>Balance: </small>{ balance.toFixed(4) } ETH</p>
                {
                    account ? (
                        <a href="">{ `${address.slice(0, 6)}...${address.slice(-4)}` }
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