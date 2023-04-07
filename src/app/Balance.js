import React from 'react'
import { useSelector } from 'react-redux'


function Balance() {
    const market = useSelector(state => state.contracts.market)

    return (
        <div className='component exchange__transfers'>
            <div className='component__header flex-between'>
                <h2>Balance</h2>
                <div className='tabs'>
                    <button className='tab tab--active'>Deposit</button>
                    <button className='tab'>Withdraw</button>
                </div>
            </div>

            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                    <p>
                        <small>Token</small><br />
                    </p>
                </div>

                <form>
                    <label htmlFor="token0"></label>
                    <input type="text" id='token0' placeholder='0.0000' />

                    <button className='button' type='submit'>
                        <span></span>
                    </button>
                </form>
            </div>

            <hr />

            <div className='exchange__transfers--form'>
                <div className='flex-between'>

                </div>

                <form>
                    <label htmlFor="token1"></label>
                    <input type="text" id='token1' placeholder='0.0000'/>

                    <button className='button' type='submit'>
                        <span></span>
                    </button>
                </form>
            </div>

            <hr />
      </div>
    )
}

export default Balance