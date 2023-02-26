const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = n => ethers.utils.parseUnits(n.toString(), 'ether')


describe('Token', () => { 
    let token;
    const NAME = "Dex Token"
    const SYMBOL = "DXT"
    const TOTAL_SUPPLY = 2000000

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy(NAME, SYMBOL, TOTAL_SUPPLY)
    })

    describe("Deployment", () => {
        it('has correct name', async () => {
            expect(await token.name()).to.equal(NAME)
        })

        it('has correct symbol', async () => {
            expect(await token.symbol()).to.equal(SYMBOL)
        })

        it('has correct decimals', async () => {
            expect(await token.decimals()).to.equal(18)
        })

        it('has correct total supply', async () => {
            expect(await token.totalSupply()).to.equal(tokens(TOTAL_SUPPLY))
        })
    })
})