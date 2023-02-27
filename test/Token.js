const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = n => ethers.utils.parseUnits(n.toString(), 'ether')


describe('Token', () => { 
    let token, accounts, deployer, user1, user2, exchange;
    const [ NAME, SYMBOL, TOTAL_SUPPLY ]  = [ "Dex Token", "DXT", 2000000 ]

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy(NAME, SYMBOL, TOTAL_SUPPLY)

        accounts = await ethers.getSigners();
        [ deployer, user1, user2, exchange ] = accounts
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

    describe("Transfers", () => {
        describe("From signer to a recipient", () => {
            let transaction, result, amount;
            
            beforeEach(async () => {
                amount = tokens(5)
                transaction = await token.connect(deployer).transfer(user1.address, amount)
                result = await transaction.wait()
            })
    
            it('transfers valid number of token/s', async () => {
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(TOTAL_SUPPLY - 5))
                expect(await token.balanceOf(user1.address)).to.equal(amount)
            })
    
            it('emits a Transfer event', async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')
    
                const eventArgs = event.args
                expect(eventArgs.from).to.equal(deployer.address)
                expect(eventArgs.to).to.equal(user1.address)
                expect(eventArgs.value).to.equal(amount)
            })

            it('rejects insufficient balance case', async () => {
                const transaction = token.connect(deployer).transfer(user1.address, tokens(TOTAL_SUPPLY + 1))
                await expect(transaction).to.be.reverted
            })

            it('rejects invalid recipient', async () => {
                const transaction = token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)
                await expect(transaction).to.be.reverted
            })
        })

        describe("From one account to another after approval", () => {
            let transaction, result, amount;
            
            beforeEach(async () => {
                const tx = await token.connect(deployer).transfer(user1.address, tokens(100))
                await tx.wait()

                amount = tokens(5)
                transaction = await token.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()
            })

            it('allocates an allowance for delegated token spending', async () => {
                expect(await token.allowance(user1.address, exchange.address)).to.equal(amount)
            })

            it('emits an Approval event', async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Approval')
    
                const eventArgs = event.args
                expect(eventArgs.owner).to.equal(user1.address)
                expect(eventArgs.spender).to.equal(exchange.address)
                expect(eventArgs.value).to.equal(amount)
            })

            it('rejects insufficient balance case', async () => {
                const transaction = token.connect(user1).approve(exchange.address, tokens(TOTAL_SUPPLY + 10))
                await expect(transaction).to.be.reverted
            })

            it('rejects invalid spenders', async () => {
                const transaction = token.connect(user1).approve('0x0000000000000000000000000000000000000000', amount)
                await expect(transaction).to.be.reverted
            })
        })
    })
})