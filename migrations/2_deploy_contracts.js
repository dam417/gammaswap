const ethers = require('ethers');
const contract = require('@truffle/contract');
const { projectId } = require('../secrets.json');

const TestERC20 = artifacts.require('./TestERC20');
const DepositPool = artifacts.require('./DepositPool');
const PositionManager = artifacts.require('./PositionManager');
const TestDepositPool = artifacts.require('./TestDepositPool');
const TestPositionManager = artifacts.require('./TestPositionManager');

const json1 = require("@uniswap/v2-core/build/UniswapV2Factory.json");//.bytecode;
const UniswapV2Factory = contract(json1);
UniswapV2Factory.setProvider(this.web3._provider);

const json2 = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");//.bytecode;
const UniswapV2Router02 = contract(json2);
UniswapV2Router02.setProvider(this.web3._provider);
const { mnemonic } = require('../secrets.json');

module.exports = async function(_deployer, network, accounts) {
    if(network == "ropsten") {
        let tokenAaddr = "0x2C1c71651304Db63f53dc635D55E491B45647f6f";
        let tokenBaddr = "0xbed4729d8E0869f724Baab6bA045EB67d72eCb7c";
        let uniRouterAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
        let uniPairAddr = "0x0ea795cc5f3db9607feadfdf56a139264179ef1e";
        let uniFactoryAddr = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
        let positionManagerAddr = '0x8d505e6Ec65c3DE1e6AC7F989D9e7d0c1edb42ab';

        let isNewTokens = false;
        let isNewPosManager = true;

        const url = `https://ropsten.infura.io/v3/${projectId}`;
        const provider = (isNewTokens || !isNewPosManager) ? new ethers.providers.JsonRpcProvider(url) : null;

        if(isNewTokens) {
            await _deployer.deploy(TestERC20, 'TokenA', 'TOKA',
                ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
            let tokenA = await TestERC20.deployed();
            await _deployer.deploy(TestERC20, 'TokenB', 'TOKB',
                ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
            let tokenB = await TestERC20.deployed();
            await _deployer.deploy(TestERC20, 'USDC', 'USDC',
                ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
            let USDC = await TestERC20.deployed();
            console.log("deployer::tokenA.address="+tokenA.address);
            console.log("deployer::tokenB.address="+tokenB.address);
            console.log("deployer::USDC.address="+USDC.address);/**/

            const url = `https://ropsten.infura.io/v3/${projectId}`;
            const provider = new ethers.providers.JsonRpcProvider(url);
            const _uniFactory = new ethers.Contract(uniFactoryAddr, JSON.stringify(UniswapV2Factory.abi), provider).connect(provider.getSigner(accounts[0]));
            await _uniFactory.createPair(tokenA.address, tokenB.address, { from: accounts[0] });
            uniPairAddr = await _uniFactory.getPair(tokenA.address, tokenB.address, { from: accounts[0] });
            console.log("uniPairAddr >> ");
            console.log(uniPairAddr);

            tokenAaddr = tokenA.address;
            tokenBaddr = tokenB.address;
        }

        let positionManager;

        if(isNewPosManager) {
            await _deployer.deploy(PositionManager, "Gammaswap PosMgr V0", "GAMPOS-VO", { from: accounts[0] });
            positionManager = await PositionManager.deployed();
        } else {
            positionManager = new ethers.Contract(positionManagerAddr, JSON.stringify(PositionManager.abi), provider).connect(provider.getSigner(accounts[0]));
        }

        await _deployer.deploy(DepositPool, uniRouterAddr, uniPairAddr, tokenAaddr, tokenBaddr, positionManager.address, { from: accounts[0] });
        let depositPool = await DepositPool.deployed();
        console.log("deployer::positionManager.address=" + positionManager.address);/**/
        console.log("deployer::depositPool.address=" + depositPool.address);/**/

        await positionManager.registerPool(tokenAaddr, tokenBaddr, depositPool.address, { from: accounts[0] });
        console.log("pool registered");
    } else if(network == "mumbai") {
            let tokenAaddr = "0xEBC9EfA60E49d18f5C0cC5b6717Ebc6CB1BB5daf"; 
            let tokenBaddr = "0x3fFCbB5bfA6eB28e4445589Bb94a1B834acfd3eF";
            let uniRouterAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
            let uniPairAddr = "0x0ea795cc5f3db9607feadfdf56a139264179ef1e";
            let uniFactoryAddr = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
            let positionManagerAddr = '0x8d505e6Ec65c3DE1e6AC7F989D9e7d0c1edb42ab';
    
            let isNewTokens = false;
            let isNewPair = true;
            let isNewPosManager = true;
            
            console.log('get provider')
            console.log('account: ' + accounts[0])
            const url = 'wss://matic-mumbai--ws.datahub.figment.io/apikey/8c1d9d4a4923d0548cdae8df46b64c25';
            // const url = 'https://matic-mumbai--jsonrpc.datahub.figment.io/apikey/8c1d9d4a4923d0548cdae8df46b64c25';
            const provider = (isNewTokens || isNewPair || !isNewPosManager) ? new ethers.providers.WebSocketProvider(url) : null;
            let tokenA = null;
            let tokenB = null;
            if(isNewTokens) {
                await _deployer.deploy(TestERC20, 'TokenA', 'TOKA',
                    ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
                tokenA = await TestERC20.deployed();
                tokenAaddr = tokenA.address;
                await _deployer.deploy(TestERC20, 'TokenB', 'TOKB',
                    ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
                tokenB = await TestERC20.deployed();
                tokenBaddr = tokenB.address;
                await _deployer.deploy(TestERC20, 'USDC', 'USDC',
                    ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
                let USDC = await TestERC20.deployed();
                console.log("deployer::tokenA.address="+tokenA.address);
                console.log("deployer::tokenB.address="+tokenB.address);
                console.log("deployer::USDC.address="+USDC.address);/**/
            }

            if (isNewPair) {
                console.log('account: ' + accounts[0])
                // const wallet = new ethers.Wallet('0xc31067d7a044a31ae927cfc8c8a7a2acbcd90c612d5992c609e14f3d5b24adcd', provider);
                // var signer = wallet.provider.getSigner(accounts[0]);
                var signer = provider.getSigner(accounts[0])
                const _uniFactory = new ethers.Contract(uniFactoryAddr, JSON.stringify(UniswapV2Factory.abi), provider).connect(signer);
                console.log('after connecting with account')
                console.log('tokena addr ' + tokenAaddr)
                console.log('tokenb addr ' + tokenBaddr)
                await _uniFactory.createPair(tokenAaddr, tokenBaddr, { from: accounts[0] });
                console.log('after createpair')
                uniPairAddr = await _uniFactory.getPair(tokenAaddr, tokenBaddr, { from: accounts[0] });
                console.log("uniPairAddr >> ");
                console.log(uniPairAddr);
            }

            let positionManager;
    
            if(isNewPosManager) {
                await _deployer.deploy(PositionManager, "Gammaswap PosMgr V0", "GAMPOS-VO", { from: accounts[0] });
                positionManager = await PositionManager.deployed();
            } else {
                positionManager = new ethers.Contract(positionManagerAddr, JSON.stringify(PositionManager.abi), provider).connect(provider.getSigner(accounts[0]));
            }
    
            await _deployer.deploy(DepositPool, uniRouterAddr, uniPairAddr, tokenAaddr, tokenBaddr, positionManager.address, { from: accounts[0] });
            let depositPool = await DepositPool.deployed();
            console.log("deployer::positionManager.address=" + positionManager.address);/**/
            console.log("deployer::depositPool.address=" + depositPool.address);/**/
    
            await positionManager.registerPool(tokenAaddr, tokenBaddr, depositPool.address, { from: accounts[0] });
            console.log("pool registered");
        } else if(network == "neartest") {
            let tokenAaddr = "0xEBC9EfA60E49d18f5C0cC5b6717Ebc6CB1BB5daf"; 
            let tokenBaddr = "0x3fFCbB5bfA6eB28e4445589Bb94a1B834acfd3eF";
            let uniRouterAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
            let uniPairAddr = "0x0ea795cc5f3db9607feadfdf56a139264179ef1e";
            let uniFactoryAddr = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
            let positionManagerAddr = '0x8d505e6Ec65c3DE1e6AC7F989D9e7d0c1edb42ab';
    
            let isNewTokens = true;
            let isNewPair = true;
            let isNewPosManager = true;
            
            console.log('get provider')
            console.log('account: ' + accounts[0])
            const url = 'https://near-testnet--rpc.datahub.figment.io/apikey/c1f66cde2abde949da194331ce9e28b1';
            const provider = (isNewTokens || isNewPair || !isNewPosManager) ? new ethers.providers.JsonRpcProvider(url) : null;
            let tokenA = null;
            let tokenB = null;
            if(isNewTokens) {
                await _deployer.deploy(TestERC20, 'TokenA', 'TOKA',
                    ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
                tokenA = await TestERC20.deployed();
                tokenAaddr = tokenA.address;
                await _deployer.deploy(TestERC20, 'TokenB', 'TOKB',
                    ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
                tokenB = await TestERC20.deployed();
                tokenBaddr = tokenB.address;
                await _deployer.deploy(TestERC20, 'USDC', 'USDC',
                    ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
                let USDC = await TestERC20.deployed();
                console.log("deployer::tokenA.address="+tokenA.address);
                console.log("deployer::tokenB.address="+tokenB.address);
                console.log("deployer::USDC.address="+USDC.address);/**/
            }

            if (isNewPair) {
                console.log('account: ' + accounts[0])
                var signer = provider.getSigner(accounts[0])
                const _uniFactory = new ethers.Contract(uniFactoryAddr, JSON.stringify(UniswapV2Factory.abi), provider).connect(signer);
                console.log('after connecting with account')
                console.log('tokena addr ' + tokenAaddr)
                console.log('tokenb addr ' + tokenBaddr)
                await _uniFactory.createPair(tokenAaddr, tokenBaddr, { from: accounts[0] });
                console.log('after createpair')
                uniPairAddr = await _uniFactory.getPair(tokenAaddr, tokenBaddr, { from: accounts[0] });
                console.log("uniPairAddr >> ");
                console.log(uniPairAddr);
            }

            let positionManager;
    
            if(isNewPosManager) {
                await _deployer.deploy(PositionManager, "Gammaswap PosMgr V0", "GAMPOS-VO", { from: accounts[0] });
                positionManager = await PositionManager.deployed();
            } else {
                positionManager = new ethers.Contract(positionManagerAddr, JSON.stringify(PositionManager.abi), provider).connect(provider.getSigner(accounts[0]));
            }
    
            await _deployer.deploy(DepositPool, uniRouterAddr, uniPairAddr, tokenAaddr, tokenBaddr, positionManager.address, { from: accounts[0] });
            let depositPool = await DepositPool.deployed();
            console.log("deployer::positionManager.address=" + positionManager.address);/**/
            console.log("deployer::depositPool.address=" + depositPool.address);/**/
    
            await positionManager.registerPool(tokenAaddr, tokenBaddr, depositPool.address, { from: accounts[0] });
            console.log("pool registered");
        } else if(network == "celotest") {
            let tokenAaddr = "0x91Cc47d320993977B3Ac74a49c49780Dd2d6c734"; 
            let tokenBaddr = "0xEd79633ab3BbcBC11ddC168967220993aB781C9F";
            let uniRouterAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
            let uniPairAddr = "0x0ea795cc5f3db9607feadfdf56a139264179ef1e";
            let uniFactoryAddr = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
            let positionManagerAddr = '0x8d505e6Ec65c3DE1e6AC7F989D9e7d0c1edb42ab';
    
            let isNewTokens = false;
            let isNewPair = true;
            let isNewPosManager = true;
            
            console.log('get provider')
            console.log('account: ' + accounts[0])
            const url = 'https://alfajores-forno.celo-testnet.org';
            const provider = (isNewTokens || isNewPair || !isNewPosManager) ? new ethers.providers.JsonRpcProvider(url) : null;
            let tokenA = null;
            let tokenB = null;
            if(isNewTokens) {
                await _deployer.deploy(TestERC20, 'TokenA', 'TOKA',
                    ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
                tokenA = await TestERC20.deployed();
                tokenAaddr = tokenA.address;
                await _deployer.deploy(TestERC20, 'TokenB', 'TOKB',
                    ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
                tokenB = await TestERC20.deployed();
                tokenBaddr = tokenB.address;
                await _deployer.deploy(TestERC20, 'USDC', 'USDC',
                    ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
                let USDC = await TestERC20.deployed();
                console.log("deployer::tokenA.address="+tokenA.address);
                console.log("deployer::tokenB.address="+tokenB.address);
                console.log("deployer::USDC.address="+USDC.address);/**/
            }

            if (isNewPair) {
                console.log('account: ' + accounts[0])
                var signer = provider.getSigner(accounts[0])
                const _uniFactory = new ethers.Contract(uniFactoryAddr, JSON.stringify(UniswapV2Factory.abi), provider).connect(signer);
                console.log('after connecting with account')
                console.log('tokena addr ' + tokenAaddr)
                console.log('tokenb addr ' + tokenBaddr)
                await _uniFactory.createPair(tokenAaddr, tokenBaddr, { from: accounts[0] });
                console.log('after createpair')
                uniPairAddr = await _uniFactory.getPair(tokenAaddr, tokenBaddr, { from: accounts[0] });
                console.log("uniPairAddr >> ");
                console.log(uniPairAddr);
            }

            let positionManager;
    
            if(isNewPosManager) {
                await _deployer.deploy(PositionManager, "Gammaswap PosMgr V0", "GAMPOS-VO", { from: accounts[0] });
                positionManager = await PositionManager.deployed();
            } else {
                positionManager = new ethers.Contract(positionManagerAddr, JSON.stringify(PositionManager.abi), provider).connect(provider.getSigner(accounts[0]));
            }
    
            await _deployer.deploy(DepositPool, uniRouterAddr, uniPairAddr, tokenAaddr, tokenBaddr, positionManager.address, { from: accounts[0] });
            let depositPool = await DepositPool.deployed();
            console.log("deployer::positionManager.address=" + positionManager.address);/**/
            console.log("deployer::depositPool.address=" + depositPool.address);/**/
    
            await positionManager.registerPool(tokenAaddr, tokenBaddr, depositPool.address, { from: accounts[0] });
            console.log("pool registered");
    } else if(network == "development") {
        console.log("deploy development");

        await _deployer.deploy(TestERC20, 'TokenA', 'TOKA',
            ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
        let tokenA = await TestERC20.deployed();
        await _deployer.deploy(TestERC20, 'TokenB', 'TOKB',
            ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
        let tokenB = await TestERC20.deployed();
        await _deployer.deploy(TestERC20, 'USDC', 'USDC',
            ethers.BigNumber.from(10000000000).mul(ethers.BigNumber.from(10).pow(18)), { from: accounts[0] });
        let USDC = await TestERC20.deployed();
        console.log("deployer::tokenA.address="+tokenA.address);
        console.log("deployer::tokenB.address="+tokenB.address);
        console.log("deployer::USDC.address="+USDC.address);/**/

        await _deployer.deploy(TestERC20,'WETH', 'WETH', ethers.BigNumber.from(10000).mul(ethers.BigNumber.from(10).pow(18)));
        let weth = await TestERC20.deployed();
        console.log("deployer::weth.address="+weth.address);

        await _deployer.deploy(UniswapV2Factory, accounts[0], { from: accounts[0] });
        let uniFactory = await UniswapV2Factory.deployed();
        console.log("deployer::uniFactory.address="+uniFactory.address);
        await _deployer.deploy(UniswapV2Router02, uniFactory.address, weth.address, { from: accounts[0] });
        let uniRouter = await UniswapV2Router02.deployed();
        console.log("deployer::uniRouter.address="+uniRouter.address);

        await uniFactory.createPair(tokenA.address, tokenB.address, { from: accounts[0] });
        let uniPair = await uniFactory.getPair(tokenA.address, tokenB.address, { from: accounts[0] });
        console.log("uniPair >> ");
        console.log(uniPair);

        //constructor(address _uniRouter, address _uniPair, address _token0, address _token1)
        await _deployer.deploy(PositionManager, "Gammaswap PosMgr V0", "GAMPOS-VO", { from: accounts[0] });
        let positionManager = await PositionManager.deployed();
        console.log("deployer::positionManager.address="+positionManager.address);

        //constructor(address _uniRouter, address _uniPair, address _token0, address _token1)
        await _deployer.deploy(DepositPool, uniRouter.address, uniPair, tokenA.address, tokenB.address, positionManager.address, { from: accounts[0] });
        let depositPool = await DepositPool.deployed();
        console.log("deployer::depositPool.address="+depositPool.address);

        await positionManager.registerPool(tokenA.address, tokenB.address, depositPool.address, { from: accounts[0] });

        await _deployer.deploy(TestDepositPool, uniRouter.address, uniPair, tokenA.address, tokenB.address, positionManager.address, { from: accounts[0] });
        let testDepositPool = await TestDepositPool.deployed();

        await _deployer.deploy(TestPositionManager, { from: accounts[0] });
        let testPositionManager = await TestPositionManager.deployed();
    }
};