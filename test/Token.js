const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = n => ethers.utils.parseUnits(n.toString(), 'ether')


describe('Token', () => { 
    let token, accounts, deployer, user1, user2;
    const [ NAME, SYMBOL, TOTAL_SUPPLY ]  = [ "Dex Token", "DXT", 2000000 ]

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy(NAME, SYMBOL, TOTAL_SUPPLY)

        accounts = await ethers.getSigners();
        [ deployer, user1, user2 ] = accounts
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
        describe("From deployer to a user", () => {
            let transaction, result;
            
            beforeEach(async () => {
                transaction = await token.connect(deployer).transfer(user1.address, tokens(1))
                result = await transaction.wait()
            })
    
            it('transfers valid number of token/s', async () => {
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(TOTAL_SUPPLY - 1))
                expect(await token.balanceOf(user1.address)).to.equal(tokens(1))
            })
    
            it('emits a Transfer event', async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')
    
                const eventArgs = event.args
                expect(eventArgs.from).to.equal(deployer.address)
                expect(eventArgs.to).to.equal(user1.address)
                expect(eventArgs.value).to.equal(tokens(1))
            })

            it('rejects insufficient balance case', async () => {
                const transaction = token.connect(deployer).transfer(user1.address, tokens(TOTAL_SUPPLY + 1))
                await expect(transaction).to.be.reverted
            })

            it('rejects invalid recipient', async () => {
                const transaction = token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', tokens(1))
                await expect(transaction).to.be.reverted
            })
        })

        describe("From one user to another", () => {
            let transaction, result;
            
            beforeEach(async () => {
                const tx = await token.connect(deployer).transfer(user1.address, tokens(10))
                await tx.wait()
                
                transaction = await token.connect(deployer).transferFrom(user1.address, user2.address, tokens(1))
                result = await transaction.wait()
            })
    
            it('transfers valid number of token/s', async () => {
                expect(await token.balanceOf(user1.address)).to.equal(tokens(10 - 1))
                expect(await token.balanceOf(user2.address)).to.equal(tokens(1))
            })
    
            it('emits a Transfer event', async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')
    
                const eventArgs = event.args
                expect(eventArgs.from).to.equal(user1.address)
                expect(eventArgs.to).to.equal(user2.address)
                expect(eventArgs.value).to.equal(tokens(1))
            })

            it('rejects insufficient balance case', async () => {
                const transaction = token.connect(deployer).transferFrom(user1.address, user2.address, tokens(TOTAL_SUPPLY + 1))
                await expect(transaction).to.be.reverted
            })

            it('rejects invalid sender', async () => {
                const transaction = token.connect(deployer).transferFrom('0x0000000000000000000000000000000000000000', user2.address, tokens(1))
                await expect(transaction).to.be.reverted
            })

            it('rejects invalid recipient', async () => {
                const transaction = token.connect(deployer).transferFrom(user1.address, '0x0000000000000000000000000000000000000000', tokens(1))
                await expect(transaction).to.be.reverted
            })
        })

    })
})