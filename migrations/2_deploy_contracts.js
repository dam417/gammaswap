const ethers = require('ethers');
const contract = require('@truffle/contract');
const { projectId } = require('../secrets.json');

const TestERC20 = artifacts.require('./TestERC20');
const DepositPool = artifacts.require('./DepositPool');
const PositionManager = artifacts.require('./PositionManager');

const json1 = require("@uniswap/v2-core/build/UniswapV2Factory.json");//.bytecode;
const UniswapV2Factory = contract(json1);
UniswapV2Factory.setProvider(this.web3._provider);

const json2 = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");//.bytecode;
const UniswapV2Router02 = contract(json2);
UniswapV2Router02.setProvider(this.web3._provider);

module.exports = async function(_deployer, network, accounts) {
    console.log(accounts[0]);
    if(network == "ropsten") {
        let tokenAaddr = "0x2C1c71651304Db63f53dc635D55E491B45647f6f";
        let tokenBaddr = "0xbed4729d8E0869f724Baab6bA045EB67d72eCb7c";
        let uniRouterAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
        let uniPairAddr = "0x0ea795cc5f3db9607feadfdf56a139264179ef1e";
        let uniFactoryAddr = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

        let isNewTokens = false;
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

        await _deployer.deploy(PositionManager, "Gammaswap PosMgr V0", "GAMPOS-VO", { from: accounts[0] });
        let positionManager = await PositionManager.deployed();

        await _deployer.deploy(DepositPool, uniRouterAddr, uniPairAddr, tokenAaddr, tokenBaddr, positionManager.address, { from: accounts[0] });
        let depositPool = await DepositPool.deployed();
        console.log("deployer::positionManager.address=" + positionManager.address);/**/
        console.log("deployer::depositPool.address=" + depositPool.address);/**/

        await positionManager.registerPool(tokenAaddr, tokenBaddr, depositPool.address, { from: accounts[0] });
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
    }
};