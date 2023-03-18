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
                const tx = await token.connect(deployer).transfer(user1.address, tokens(10))
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

            it('rejects invalid spender', async () => {
                const transaction = token.connect(user1).approve('0x0000000000000000000000000000000000000000', amount)
                await expect(transaction).to.be.reverted
            })

            describe("Delegation of transactions", () => {
                let tx, res, amt;

                beforeEach(async () => {
                    amt = tokens(1)
                    tx = await token.connect(exchange).transferFrom(user1.address, user2.address, amt)
                    res = await tx.wait()
                })

                it('processes the required transfer', async () => {
                    expect(await token.balanceOf(user1.address)).to.be.equal(tokens(9))
                    expect(await token.balanceOf(user2.address)).to.be.equal(amt)
                })

                it('emits a Transfer event', async () => {
                    const event = res.events[0]
                    expect(event.event).to.equal('Transfer')
        
                    const eventArgs = event.args
                    expect(eventArgs.from).to.equal(user1.address)
                    expect(eventArgs.to).to.equal(user2.address)
                    expect(eventArgs.value).to.equal(amt)
                })

                it('decreases the allowance by tokens spent', async () => {
                    expect(await token.allowance(user1.address, exchange.address)).to.be.equal(tokens(4))
                })

                it('rejects transfers more than the allowance', async () => {
                    tx = token.connect(exchange).transferFrom(user1.address, user2.address, tokens(6))
                    await expect(tx).to.be.reverted
                })

                it('rejects invalid receiver', async () => {
                    tx = token.connect(exchange).transferFrom(user1.address, '0x0000000000000000000000000000000000000000', amt)
                    await expect(tx).to.be.reverted
                })

                it('resets allowance if and when total allowed tokens spent', async () => {
                    tx = token.connect(exchange).transferFrom(user1.address, user2.address, tokens(4))
                    expect(await token.balanceOf(user1.address)).to.be.equal(tokens(5))
                    expect(await token.balanceOf(user2.address)).to.be.equal(tokens(5))

                    expect(await token.allowance(user1.address, exchange.address)).to.be.equal(0)
                })
            })
        })
    })
})