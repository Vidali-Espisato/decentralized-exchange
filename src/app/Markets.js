import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { handleMarket } from 'store/handlers'


function Markets({ contractsLoaded }) {
    const contracts = useSelector(state => state.contracts)
    const [ marketSelected, setMarketSelected ] = useState("0")
    const dispatch = useDispatch()

    const pairs = [
        ["DXT", "mETH"],
        ["DXT", "mDAI"]
    ]

    const marketHandler = async symbols => {
        const addresses = symbols.split(" / ").map(i => contracts[i]?.address).join(" | ")
        sessionStorage.setItem("marketSelected", symbols)
        await handleMarket({ symbols, addresses }, dispatch)
    }

    useEffect(() => {
        if (contractsLoaded) {
            const symbols = sessionStorage.getItem("marketSelected")
            if (symbols?.length) setMarketSelected(symbols)
        }
    }, [ contractsLoaded ])

    useEffect(() => {
        if (marketSelected !== "0") marketHandler(marketSelected)
    }, [ marketSelected ])


    return (
        <div className='component exchange__markets'>
            <select name="markets" id="markets" value={ marketSelected } onChange={e => setMarketSelected(e.target.value)}>
                <option value="0" disabled>Select Market</option>
                {
                    pairs.map(([a, b]) => (
                        <option value={ `${a} / ${b}` }>{ `${a} / ${b}` }</option>
                    ))
                }
            </select>

            <hr />
        </div>
    )
}

export default Markets