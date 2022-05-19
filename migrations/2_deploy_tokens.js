const ethers = require('ethers');

const TestERC20 = artifacts.require('./TestERC20');

module.exports = async function(_deployer, network, accounts) {
    console.log(accounts[0]);
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
};