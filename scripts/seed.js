let configData = require('../src/config.json');

const wait = n => new Promise(resolve => setTimeout(resolve, n * 1000))
const tokens = n => ethers.utils.parseUnits(n.toString(), 'ether')

async function main() {
    console.log("Initialization started!!!")

    const { chainId } = await ethers.provider.getNetwork()
    const [ deployer, _, user1, user2, user3 ] = await ethers.getSigners()

    let { exchange, DXT, mETH, mDAI } = Object.fromEntries(
        Object.entries(configData[chainId]).map(([k, v]) => {
            const key = k === 'exchange' ? "Exchange" : "Token"
            const _contract = ethers.getContractAt(key, v.address)
            return [k, _contract]
        })
    )
    exchange = await exchange

    console.log("Fetched contracts!")

    const combinations = [
        {
            tokenC: await DXT,
            user: user1,
            initialTokens: tokens(1000),
            depositTokens: tokens(100),
            orderTokens: tokens(10),
            cancelTokens: tokens(5)
        }, {
            tokenC: await mETH,
            user: user2,
            initialTokens: tokens(500),
            depositTokens: tokens(250),
            orderTokens: tokens(5),
            cancelTokens: tokens(20)
        }, {
            tokenC: await mDAI,
            user: user3,
            initialTokens: tokens(1500),
            depositTokens: tokens(150),
            orderTokens: tokens(15),
            cancelTokens: tokens(12)
        }
    ]

    for await (let item of combinations) {
        let tx;
        const { tokenC, user, initialTokens, depositTokens, orderTokens, cancelTokens } = item

        tx = await tokenC.connect(deployer).transfer(user.address, initialTokens)
        await tx.wait()
        console.log(`Deployer: ${ deployer.address } transferred ${ initialTokens } tokens to user: ${ user.address }`)

        tx = await tokenC.connect(user).approve(exchange.address, depositTokens)
        await tx.wait()
        console.log(`User: ${ user.address } approved a deposit of ${ depositTokens } tokens.`)
        tx = await exchange.connect(user).depositToken(tokenC.address, depositTokens)
        await tx.wait()
        console.log(`${ depositTokens } tokens were deposited to the Exchange: ${ exchange.address }`)

        if (tokenC.address === (await DXT).address) continue;

        tx = await exchange.connect(user).makeOrder(tokenC.address, cancelTokens, (await DXT).address, cancelTokens)
        const result = await tx.wait()
        await wait(1)
        console.log(`User: ${ user.address } created an order of ${ cancelTokens } tokens for ${ await tokenC.symbol() }/DXT pair.`)

        const eventArgs = result.events[0].args
        const orderId = eventArgs._id
        console.log(`Order id: ${ orderId } was created for the above transaction.`)

        tx = await exchange.connect(user).cancelOrder(orderId)
        await wait(1)
        console.log(`User: ${ user.address } cancelled the order: ${ orderId }, of ${ cancelTokens } tokens for ${ await tokenC.symbol() }/DXT pair.`)


        tx = await exchange.connect(user).makeOrder(tokenC.address, orderTokens, (await DXT).address, orderTokens)
        await tx.wait()
        await wait(1)
        console.log(`User: ${ user.address } created an order of ${ orderTokens } tokens for ${ await tokenC.symbol() }/DXT pair.`)
    }

    const totalOrdersCount = await exchange.ordersCount()
    let currentOrderNo = 1

    while (currentOrderNo <= totalOrdersCount) {
        try {
            const transaction = await exchange.connect(user1).fillOrder(currentOrderNo)
            await transaction.wait()
            await wait(1)
            console.log(`User: ${ user1.address } filled the order: ${ currentOrderNo }`)
        } catch(err) {
            console.log("error while filling order no.: ", currentOrderNo)
        }
        currentOrderNo++;
    }

    combinations.forEach(async (i, idx) => {
        combinations.forEach(async (j, idy) => {
            if (idx === idy) return

            for(let z = 0; z < 10; z++) {
                tx = await exchange.connect(i.user).makeOrder(i.tokenC.address, tokens(Math.floor(Math.random() * 100)), j.tokenC.address, tokens(Math.floor(Math.random() * 100)))
                await tx.wait()
                await wait(1)
                console.log(`User: ${ i.user.address } created an order for ${ await j.tokenC.symbol() }/DXT pair.`)
            }
        })
    })
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

console.log("Initialization completed!!!")
