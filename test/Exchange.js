const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = n => ethers.utils.parseUnits(n.toString(), 'ether')


describe('Exchange', () => { 
    let exchange, accounts, deployer, user1, user2, feeAccount, token1, token2;
    const feePercent = 1;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        [ deployer, user1, user2, feeAccount ] = accounts
        
        const Exchange = await ethers.getContractFactory('Exchange')
        exchange = await Exchange.deploy(feeAccount.address, feePercent)
        
        const Token = await ethers.getContractFactory('Token')
        token1 = await Token.deploy('Dex Token', 'DXT', 100000)
        token2 = await Token.deploy('Wrapped Dai', 'mDAI', 100000)
        
        const tx1 = await token1.connect(deployer).transfer(user1.address, tokens(100))
        await tx1.wait()

        const tx2 = await token2.connect(deployer).transfer(user2.address, tokens(100))
        await tx2.wait()
    })

    describe("Deployment", () => {
        it('tracks the fee account', async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })

        it('declares fee percentage', async () => {
            expect(await exchange.feePercent()).to.equal(1)
        })
    })

    describe('Depositing Tokens', () => {
        let transaction, result;
        let amount = tokens(5);

        beforeEach(async () => {
            transaction = await token1.connect(user1).approve(exchange.address, amount)
            await transaction.wait()

            transaction = await exchange.connect(user1).depositToken(token1.address, amount)
            result = await transaction.wait()
        })

        it('tracks the token deposit', async () => {
            expect(await token1.balanceOf(exchange.address)).to.equal(amount)
            expect(await exchange.balanceOf(token1.address, user1.address)).to.be.equal(amount)
        })

        it('emits a Deposit event', async () => {
            const event = result.events[1]
            expect(event.event).to.equal('Deposit')

            const eventArgs = event.args
            expect(eventArgs.token).to.equal(token1.address)
            expect(eventArgs.user).to.equal(user1.address)
            expect(eventArgs.amount).to.equal(amount)
            expect(eventArgs.balance).to.equal(amount)
        })

        it('fails when no or inadequate tokens are approved', async () => {
            await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
        })
    })

    describe('Withdrawing Tokens', () => {
        let transaction, result;
        let amount = tokens(5);

        beforeEach(async () => {
            transaction = await token1.connect(user1).approve(exchange.address, amount)
            await transaction.wait()

            transaction = await exchange.connect(user1).depositToken(token1.address, amount)
            await transaction.wait()

            transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
            result = await transaction.wait()
        })

        it('tracks the token withdrawal', async () => {
            expect(await token1.balanceOf(exchange.address)).to.equal(0)
            expect(await exchange.balanceOf(token1.address, user1.address)).to.be.equal(0)
        })

        it('emits a Withdraw event', async () => {
            const event = result.events[1]
            expect(event.event).to.equal('Withdraw')

            const eventArgs = event.args
            expect(eventArgs.token).to.equal(token1.address)
            expect(eventArgs.user).to.equal(user1.address)
            expect(eventArgs.amount).to.equal(amount)
            expect(eventArgs.balance).to.equal(0)
        })

        it('fails when insufficient balance available', async () => {
            await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
        })
    })

    describe('Creating Order', () => {
        let transaction, result;
        let amount = tokens(5);

        beforeEach(async () => {
            transaction = await token2.connect(user2).approve(exchange.address, amount)
            await transaction.wait()

            transaction = await exchange.connect(user2).depositToken(token2.address, amount)
            await transaction.wait()

            transaction = await exchange.connect(user2).makeOrder(token2.address, tokens(1), token1.address, tokens(1))
            result = await transaction.wait()
        })

        it('tracks the orders count', async () => {
            expect(await exchange.ordersCount()).to.be.equal(1)
        })

        it('emits an Order event', async () => {
            const event = result.events[0]
            expect(event.event).to.equal('Order')

            const eventArgs = event.args
            expect(eventArgs.user).to.equal(user2.address)
            expect(eventArgs.oToken).to.equal(token2.address)
            expect(eventArgs.oAmount).to.equal(tokens(1))
            expect(eventArgs.iToken).to.equal(token1.address)
            expect(eventArgs.iAmount).to.equal(tokens(1))
            expect(eventArgs.timestamp).to.at.least(1)
        })

        it('fails when insufficient balance available', async () => {
            await expect(exchange.connect(user2).makeOrder(token2.address, tokens(10), token1.address, amount)).to.be.reverted
        })
    })

    describe('Cancelling Order', () => {
        let transaction, result;
        let amount = tokens(5);

        beforeEach(async () => {
            transaction = await token2.connect(user2).approve(exchange.address, amount)
            await transaction.wait()

            transaction = await exchange.connect(user2).depositToken(token2.address, amount)
            await transaction.wait()

            transaction = await exchange.connect(user2).makeOrder(token2.address, tokens(1), token1.address, tokens(1))
            await transaction.wait()
        
            transaction = await exchange.connect(user2).cancelOrder(1)
            result = await transaction.wait()
        })

        it('checks if order has been recorded as cancelled', async () => {
            expect(await exchange.connect(user2).cancelledOrders(1)).to.be.equal(true)
        })

        it('emits an CancelledOrder event', async () => {
            const event = result.events[0]
            expect(event.event).to.equal('CancelledOrder')

            const eventArgs = event.args
            expect(eventArgs.user).to.equal(user2.address)
            expect(eventArgs.oToken).to.equal(token2.address)
            expect(eventArgs.oAmount).to.equal(tokens(1))
            expect(eventArgs.iToken).to.equal(token1.address)
            expect(eventArgs.iAmount).to.equal(tokens(1))
            expect(eventArgs.timestamp).to.at.least(1)
        })

        it('rejects invalid order ids', async () => {
            await expect(exchange.connect(user2).cancelOrder(999)).to.be.reverted
        })

        it('rejects unauthorized users', async () => {
            await expect(exchange.connect(user1).cancelOrder(1)).to.be.reverted
        })
    })
})