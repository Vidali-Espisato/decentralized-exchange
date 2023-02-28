const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = n => ethers.utils.parseUnits(n.toString(), 'ether')


describe('Exchange', () => { 
    let exchange, accounts, deployer, user1, user2, exchangeAccount, feeAccount;
    const feePercent = 1;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        [ deployer, user1, user2, exchangeAccount, feeAccount ] = accounts
        
        const Exchange = await ethers.getContractFactory('Exchange')
        exchange = await Exchange.deploy(exchangeAccount.address, feeAccount.address, feePercent)
    })

    describe("Deployment", () => {
        it('tracks the exchange account', async () => {
            expect(await exchange.account()).to.equal(exchangeAccount.address)
        })

        it('tracks the fee account', async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })

        it('declares fee percentage', async () => {
            expect(await exchange.feePercent()).to.equal(1)
        })
    })
})