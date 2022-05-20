/**
 * Created by danielalcarraz on 5/20/22.
 */
const ethers = require('ethers');
const contract = require('@truffle/contract');

const PositionManager = artifacts.require('./PositionManager');

const json1 = require("@uniswap/v2-core/build/UniswapV2Factory.json");//.bytecode;
const UniswapV2Factory = contract(json1);
UniswapV2Factory.setProvider(this.web3._provider);

const json2 = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");//.bytecode;
const UniswapV2Router02 = contract(json2);
UniswapV2Router02.setProvider(this.web3._provider);

module.exports = async function(_deployer, network, accounts) {
    console.log(accounts[0]);

    if(network == "development") {
        console.log("to development");
        //constructor(address _uniRouter, address _uniPair, address _token0, address _token1)
        /*let tokenAaddr = "0x676C3a0c25b9cCF49bbd0A9669BFc570B1C12F2b";
        let tokenBaddr = "0x3983725DEE8BDFf75fB987ea323B8D39e9B49CD8";
        let uniRouter = "0x676C3a0c25b9cCF49bbd0A9669BFc570B1C12F2b";
        let uniPair = "0x7fa401995db2D405Ab2D4Ca4F3CE7839Ea59C775";/**/
        await _deployer.deploy(PositionManager, "Gammaswap PosMgr V0", "GAMPOS-VO", {from: accounts[0]});
        let positionManager = await PositionManager.deployed();
        console.log("deployer::positionManager.address=" + positionManager.address);
    } else if (network == "ropsten") {
        console.log("to ropsten");
        /*let tokenAaddr = "0x2C1c71651304Db63f53dc635D55E491B45647f6f";
        let tokenBaddr = "0xbed4729d8E0869f724Baab6bA045EB67d72eCb7c";
        let uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
        let uniPair = "0x0ea795cc5f3db9607feadfdf56a139264179ef1e";
        await _deployer.deploy(DepositPool, uniRouter, uniPair, tokenAaddr, tokenBaddr, {from: accounts[0]});
        let depositPool = await DepositPool.deployed();
        console.log("deployer::depositPool.address=" + depositPool.address);/**/
    }
};