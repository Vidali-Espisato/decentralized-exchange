const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = n => ethers.utils.parseUnits(n.toString(), 'ether')


describe('Token', () => { 
    let token, accounts, deployer;
    const [ NAME, SYMBOL, TOTAL_SUPPLY ]  = [ "Dex Token", "DXT", 2000000 ]

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy(NAME, SYMBOL, TOTAL_SUPPLY)

        accounts = await ethers.getSigners()
        deployer = accounts[0]
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

        it('assigns total supply to deployer', async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(tokens(TOTAL_SUPPLY))
        })
    })
})