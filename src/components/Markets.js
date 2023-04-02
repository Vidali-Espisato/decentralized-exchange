import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { handleMarket } from 'store/handlers'


function Markets() {
    const contracts = useSelector(state => state.contracts)
    const market = useSelector(state => state.contracts.market)
    const dispatch = useDispatch()

    const pairs = [
        ["DXT", "mETH"],
        ["DXT", "mDAI"]
    ]

    const marketHandler = async event => {
        await handleMarket({ symbols: event.target.selectedOptions?.[0].text, addresses: event.target.value }, dispatch)
    }


    return (
        <div className='component exchange__markets'>
            <div className='component__header'>
                <h2>Select Market</h2>
            </div>

            <select name="markets" id="markets" value={ market?.symbols } onChange={ marketHandler }>
                {
                    pairs.map(([a, b]) => (
                        <option value={ `${ contracts[a]?.address } | ${ contracts[b]?.address }` }>{ `${a} / ${b}` }</option>
                    ))
                }
            </select>

            <hr />
        </div>
    )
}

export default Markets