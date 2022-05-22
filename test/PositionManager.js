/**
 * Created by danielalcarraz on 5/21/22.
 */
/*import { Contract, constants, BigNumber, utils, providers } from 'ethers';
 import { expandTo18Decimals, mineBlock, encodePrice, sqrt } from './shared/utilities';
 import { poolFixture, testPoolFixture } from './shared/fixtures';
 const Web3 = require("web3");
 const web3 = new Web3("ws://localhost:7545");
 const VegaswapV1Pool = artifacts.require('./VegaswapV1Pool.sol');

 require('chai').use(require('chai-as-promised')).should();

 const MINIMUM_LIQUIDITY = BigNumber.from(10).pow(3);

 const url = "http://localhost:7545";
 const provider = new providers.JsonRpcProvider(url);

 const _provider = new Web3.providers.HttpProvider("http://localhost:7545");
 //const web3Provider = new providers.Web3Provider(provider);

 contract('VegaswapV1Pool', (accounts) => {
 //let token;
 console.log(accounts[0]);

 let factory;
 let token0;
 let token1;
 let pool;
 let uniPair;
 let uniRouter;

 // 1/1/2020 @ 12:00 am UTC
 // cannot be 0 because that instructs ganache to set it to current timestamp
 // cannot be 86400 because then timestamp 0 is a valid historical observation
 //const startTime = 1577836800

 // must come before adding liquidity to pairs for correct cumulative price computations
 // cannot use 0 because that resets to current timestamp
 //beforeEach(`set start time to ${startTime}`, () => mineBlock(provider, startTime))
 beforeEach(async () => {
 const fixture = await testPoolFixture(provider, accounts[0]);
 factory = fixture.factory;
 token0 = fixture.token0;
 token1 = fixture.token1;
 pool = fixture.pool;
 uniPair = fixture.uniPair;
 uniRouter = fixture.uniRouter;
 });

 describe('VegaswapV1Pool', () => {
 async function setUp() {
 const token0Amount = expandTo18Decimals(1);
 const token1Amount = expandTo18Decimals(4);
 await addToUniLiquidity(token0Amount, token1Amount, accounts[1]);
 await addLiquidity(token0Amount, token1Amount, accounts[1]);
 await addLiquidity(token0Amount, token1Amount, accounts[0]);
 }

 async function addToUniLiquidity(token0Amount, token1Amount, acct) {
 await token0.transfer(uniPair.address, token0Amount);
 await token1.transfer(uniPair.address, token1Amount);
 const _tx = await uniPair.mint(acct, { gasPrice: 0, from: accounts[0]});
 const tx = await _tx.wait();
 }

 async function addLiquidity(token0Amount, token1Amount, acct) {
 await token0.transfer(pool.address, token0Amount);
 await token1.transfer(pool.address, token1Amount);
 const _tx = await pool.mint(acct, { gasPrice:0, from: accounts[0]});
 const tx = await _tx.wait();
 }

 it('sync', async () => {
 await setUp();
 const uniPairBal = await uniPair.balanceOf(pool.address);
 const totalUniLiquidity = await pool.totalUniLiquidity();

 assert.equal(totalUniLiquidity.toString(), uniPairBal.toString());

 const token0Amount = expandTo18Decimals(1);
 const token1Amount = expandTo18Decimals(4);

 await addToUniLiquidity(token0Amount, token1Amount, accounts[0]);

 const userUniPairBal = await uniPair.balanceOf(accounts[0]);

 await uniPair.transfer(pool.address, expandTo18Decimals(2));

 const userUniPairBal0 = await uniPair.balanceOf(accounts[0]);

 assert.equal(userUniPairBal0.toString(), userUniPairBal.sub(expandTo18Decimals(2)).toString());

 const uniPairBal0 = await uniPair.balanceOf(pool.address);
 const totalUniLiquidity0 = await pool.totalUniLiquidity();

 assert.notEqual(totalUniLiquidity0.toString(), uniPairBal0.toString());

 await pool.sync();

 const totalUniLiquidity1 = await pool.totalUniLiquidity();
 const uniPairBal1 = await uniPair.balanceOf(pool.address);

 assert.equal(totalUniLiquidity1.toString(), uniPairBal1.toString());
 });

 it('skim', async () => {
 await setUp();

 const token0Bal = await token0.balanceOf(pool.address);
 const token1Bal = await token1.balanceOf(pool.address);
 const uniPairBal = await uniPair.balanceOf(pool.address);

 assert.equal(token0Bal.toString(), 0);
 assert.equal(token1Bal.toString(), 0);
 assert.equal(uniPairBal.toString(), expandTo18Decimals(4).toString());

 const token0Amount = expandTo18Decimals(1);
 const token1Amount = expandTo18Decimals(4);

 await addToUniLiquidity(token0Amount, token1Amount, accounts[0]);
 await token0.transfer(pool.address, token0Amount);
 await token1.transfer(pool.address, token1Amount);
 await uniPair.transfer(pool.address, expandTo18Decimals(2));

 const userToken0Bal = await token0.balanceOf(accounts[0]);
 const userToken1Bal = await token1.balanceOf(accounts[0]);

 const token0Bal0 = await token0.balanceOf(pool.address);
 const token1Bal0 = await token1.balanceOf(pool.address);
 const uniPairBal0 = await uniPair.balanceOf(pool.address);

 assert.equal(token0Bal0.toString(), token0Amount.toString());
 assert.equal(token1Bal0.toString(), token1Amount.toString());
 assert.equal(uniPairBal0.toString(), expandTo18Decimals(6).toString());

 await pool.skim(accounts[0]);

 const token0Bal1 = await token0.balanceOf(pool.address);
 const token1Bal1 = await token1.balanceOf(pool.address);
 const uniPairBal1 = await uniPair.balanceOf(pool.address);

 assert.equal(token0Bal1.toString(), 0);
 assert.equal(token1Bal1.toString(), 0);
 assert.equal(uniPairBal1.toString(), expandTo18Decimals(4).toString());

 const userToken0Bal0 = await token0.balanceOf(accounts[0]);
 const userToken1Bal0 = await token1.balanceOf(accounts[0]);
 const userUniPairBal0 = await uniPair.balanceOf(accounts[0]);

 const ONE = expandTo18Decimals(1);

 assert.equal(userToken0Bal0.toString(), BigNumber.from(userToken0Bal.toString()).add(ONE).toString());
 assert.equal(userToken1Bal0.toString(), BigNumber.from(userToken1Bal.toString()).add(ONE.mul(4)).toString());
 assert.equal(userUniPairBal0.toString(), expandTo18Decimals(2).toString());
 });

 it('getAndUpdateLastFeeIndex', async () => {
 const ONE = expandTo18Decimals(1);

 await factory.setFeeTo(accounts[2]);
 const feeTo = await factory.feeTo();
 assert.equal(feeTo.toString(), accounts[2]);

 const feeToPoolBal = await pool.balanceOf(accounts[2]);
 assert.equal(feeToPoolBal.toString(), 0);

 const borrowedInvariant0 = await pool.BORROWED_INVARIANT();
 const accFeeIndex0 = await pool.accFeeIndex();
 const lastUniInvariant0 = await pool.lastUniInvariant();
 const lastUniTotalSupply0 = await pool.lastUniTotalSupply();
 const lastBlockNumber0 = await pool.LAST_BLOCK_NUMBER();
 const blockNum0 = await web3.eth.getBlockNumber();

 await setUp();

 const borrowedInvariant1 = await pool.BORROWED_INVARIANT();
 const accFeeIndex1 = await pool.accFeeIndex();
 const lastUniInvariant1 = await pool.lastUniInvariant();
 const lastUniTotalSupply1 = await pool.lastUniTotalSupply();
 const lastBlockNumber1 = await pool.LAST_BLOCK_NUMBER();
 const blockNum1 = await web3.eth.getBlockNumber();

 assert.equal(borrowedInvariant1.toString(), borrowedInvariant0.toString());
 assert.equal(accFeeIndex1.gt(accFeeIndex0), true);
 assert.equal(lastUniInvariant1.gt(lastUniInvariant0), true);
 assert.equal(lastUniTotalSupply1.gt(lastUniTotalSupply0), true);
 assert.equal(lastBlockNumber1.gt(lastBlockNumber0), true);
 assert.equal(blockNum1 > blockNum0, true);
 assert.equal(lastBlockNumber1.toString(), blockNum1.toString());

 const liquidity = expandTo18Decimals(2);

 const _tx0 = await pool.openPosition(liquidity);
 await _tx0.wait();

 const accFeeIndex2 = await pool.accFeeIndex();

 const token0Amount = expandTo18Decimals(1);
 const token1Amount = expandTo18Decimals(4);
 await addLiquidity(token0Amount, token1Amount, accounts[0]);

 const borrowedInvariant3 = await pool.BORROWED_INVARIANT();
 const accFeeIndex3 = await pool.accFeeIndex();

 const initBorrowedInvariant = expandTo18Decimals(2);
 const nextBorrowedInvariant = initBorrowedInvariant.mul(accFeeIndex3).div(accFeeIndex2);

 assert.equal(borrowedInvariant3.div(10).toString(), nextBorrowedInvariant.div(10));

 const lastFeeIndex2 = accFeeIndex3.mul(ONE).div(accFeeIndex2);
 const lastFeeIndex =  borrowedInvariant3.mul(ONE).div(initBorrowedInvariant);

 assert.equal(lastFeeIndex.div(10).toString(), lastFeeIndex2.div(10).toString());

 const devFee = await factory.fee();
 const reserves = await uniPair.getReserves();
 const uniInvariant = sqrt(reserves._reserve0.mul(reserves._reserve1));
 const poolUniPairBal = await uniPair.balanceOf(pool.address);
 const totalUniSupply = await uniPair.totalSupply();
 const uniShareInvariant = poolUniPairBal.mul(uniInvariant).div(totalUniSupply);
 const factor = lastFeeIndex.sub(ONE).mul(BigNumber.from(devFee.toString())).div(lastFeeIndex);
 const acctGrowth = factor.mul(borrowedInvariant3).div(borrowedInvariant3.add(uniShareInvariant));
 const totalPoolSharesSupply = await pool.totalSupply();
 const expNewDevShares = totalPoolSharesSupply.mul(acctGrowth).div(ONE.sub(acctGrowth));
 const feeToPoolBal0 = await pool.balanceOf(accounts[2]);

 assert.equal(feeToPoolBal0.div(10000).toString(), expNewDevShares.div(10000).toString());
 });

 it('getLastFeeIndex:hasUniTradesAndLoans', async () => {
 const ONE = expandTo18Decimals(1);

 await pool.setBaseRate(constants.Zero);//We already know BASE_RATE works

 await setUp();

 const expLastUniInvariant = expandTo18Decimals(36);
 const expLastUniTotalSupply = expandTo18Decimals(6);

 const liquidity = expandTo18Decimals(2);

 const _tx0 = await pool.openPosition(liquidity);
 await _tx0.wait();

 const YEAR_BLOCK_COUNT = 2252571;

 await mineBlock(web3, Math.floor(Date.now()/1000));

 const lastBlock = await pool.LAST_BLOCK_NUMBER();
 const blockNum = await web3.eth.getBlockNumber();
 const blockDiff = blockNum - lastBlock;
 const borrowRate = await pool.getBorrowRate();

 const expLastFeeIndex = ONE.add(BigNumber.from(borrowRate.toString()).mul(blockDiff).div(YEAR_BLOCK_COUNT));
 const expAccFeeIndex = expLastFeeIndex;

 const res0 = await pool.getLastFeeIndex();

 assert.equal(res0._accFeeIndex.toString(), expAccFeeIndex.toString());
 assert.equal(res0._lastUniInvariant.toString(), BigNumber.from(expLastUniInvariant.toString()).sub(expandTo18Decimals(20)));
 assert.equal(res0._lastUniTotalSupply.toString(), BigNumber.from(expLastUniTotalSupply.toString()).sub(expandTo18Decimals(2)));
 assert.equal(res0._lastFeeIndex.toString(), expLastFeeIndex.toString());

 const tokenAmt = expandTo18Decimals(1);
 await token0.transfer(pool.address, tokenAmt);

 await pool.swapExactTokens4Tokens(token0.address, token1.address, tokenAmt, 0, accounts[0]);

 await mineBlock(web3, Math.floor(Date.now()/1000));

 const lastUniInvariant = await pool.lastUniInvariant();
 const lastUniTotalSupply = await pool.lastUniTotalSupply();

 const res1 = await pool.getLastFeeIndex();

 const uniTotalSupply = await uniPair.totalSupply();
 const pairRes = await uniPair.getReserves();

 const uniRes1 = BigNumber.from(pairRes._reserve1.toString());
 const uniRes0 = BigNumber.from(pairRes._reserve0.toString());
 const _lastUniInvariant = uniRes0.mul(uniRes1).div(ONE);
 const numerator = sqrt(_lastUniInvariant.mul(ONE)).mul(BigNumber.from(lastUniTotalSupply.toString()));
 const denominator = sqrt(BigNumber.from(lastUniInvariant.toString()).mul(ONE)).mul(BigNumber.from(uniTotalSupply.toString()));
 const lastUniFeeIndex = numerator.mul(ONE).div(denominator);

 const lastBlock1 = await pool.LAST_BLOCK_NUMBER();
 const blockNum1 = await web3.eth.getBlockNumber();
 const blockDiff1 = blockNum1 - lastBlock1;
 const borrowRate1 = await pool.getBorrowRate();

 const expAdjBorrowRate = BigNumber.from(borrowRate1.toString()).mul(blockDiff1).div(YEAR_BLOCK_COUNT);
 const expLastFeeIndex1 = lastUniFeeIndex.add(expAdjBorrowRate);
 const expAccFeeIndex1 = expLastFeeIndex1;

 assert.equal(res1._accFeeIndex.toString(), expAccFeeIndex1.toString());
 assert.equal(res1._lastUniInvariant.toString(), _lastUniInvariant.toString());
 assert.equal(res1._lastUniTotalSupply.toString(), uniTotalSupply.toString());
 assert.equal(res1._lastFeeIndex.toString(), expLastFeeIndex1.toString());
 });

 it('getLastFeeIndex:hasUniTrades', async () => {
 const ONE = expandTo18Decimals(1);

 await pool.setBaseRate(constants.Zero);//We already know BASE_RATE works
 await pool.setSlope1(constants.Zero);//
 await pool.setSlope2(constants.Zero);//

 await setUp();

 const res = await pool.getLastFeeIndex();

 const expLastUniInvariant = expandTo18Decimals(36);
 const expLastUniTotalSupply = expandTo18Decimals(6);

 assert.equal(res._accFeeIndex.toString(), ONE.toString());
 assert.equal(res._lastUniInvariant.toString(), expLastUniInvariant.toString());
 assert.equal(res._lastUniTotalSupply.toString(), expLastUniTotalSupply.toString());
 assert.equal(res._lastFeeIndex.toString(), ONE.toString());

 const tokenAmt = expandTo18Decimals(1);
 await token0.transfer(pool.address, tokenAmt);

 await pool.swapExactTokens4Tokens(token0.address, token1.address, tokenAmt, 0, accounts[0]);

 await mineBlock(web3, Math.floor(Date.now()/1000));

 const lastUniInvariant = await pool.lastUniInvariant();
 const lastUniTotalSupply = await pool.lastUniTotalSupply();

 const res0 = await pool.getLastFeeIndex();

 const uniTotalSupply = await uniPair.totalSupply();
 const pairRes = await uniPair.getReserves();

 const uniRes1 = BigNumber.from(pairRes._reserve1.toString());
 const uniRes0 = BigNumber.from(pairRes._reserve0.toString());
 const _lastUniInvariant = uniRes0.mul(uniRes1).div(ONE);
 const numerator = sqrt(_lastUniInvariant.mul(ONE)).mul(BigNumber.from(lastUniTotalSupply.toString()));
 const denominator = sqrt(BigNumber.from(lastUniInvariant.toString()).mul(ONE)).mul(BigNumber.from(uniTotalSupply.toString()));
 const lastUniFeeIndex = numerator.mul(ONE).div(denominator);

 assert.equal(res0._accFeeIndex.toString(), lastUniFeeIndex.toString());
 assert.equal(res0._lastUniInvariant.toString(), _lastUniInvariant.toString());
 assert.equal(res0._lastUniTotalSupply.toString(), uniTotalSupply.toString());
 assert.equal(res0._lastFeeIndex.toString(), lastUniFeeIndex.toString());

 const token0Amount = expandTo18Decimals(1);
 const token1Amount = token0Amount.mul(uniRes1).div(uniRes0);
 await addLiquidity(token0Amount, token1Amount, accounts[0]);

 await mineBlock(web3, Math.floor(Date.now()/1000));

 const lastUniInvariant1 = await pool.lastUniInvariant();
 const lastUniTotalSupply1 = await pool.lastUniTotalSupply();

 const res1 = await pool.getLastFeeIndex();

 const uniTotalSupply1 = await uniPair.totalSupply();
 const pairRes1 = await uniPair.getReserves();

 const _uniRes1 = BigNumber.from(pairRes1._reserve1.toString());
 const _uniRes0 = BigNumber.from(pairRes1._reserve0.toString());
 const _lastUniInvariant1 = _uniRes0.mul(_uniRes1).div(ONE);
 const numerator1 = sqrt(_lastUniInvariant1.mul(ONE)).mul(BigNumber.from(lastUniTotalSupply1.toString()));
 const denominator1 = sqrt(BigNumber.from(lastUniInvariant1.toString()).mul(ONE)).mul(BigNumber.from(uniTotalSupply1.toString()));
 const lastUniFeeIndex1 = numerator1.mul(ONE).div(denominator1);

 const accFeeIndex = await pool.accFeeIndex();

 assert.equal(res1._accFeeIndex.toString(), lastUniFeeIndex1.mul(BigNumber.from(accFeeIndex.toString())).div(ONE).toString());
 assert.equal(res1._lastUniInvariant.toString(), _lastUniInvariant1.toString());
 assert.equal(res1._lastUniTotalSupply.toString(), uniTotalSupply1.toString());
 assert.equal(res1._lastFeeIndex.toString(), lastUniFeeIndex1.toString());
 });

 it('getLastFeeIndex:NoUniTrades', async () => {

 const ONE = expandTo18Decimals(1);

 const _res = await pool.getLastFeeIndex();

 assert.equal(_res._accFeeIndex.toString(), ONE.toString());
 assert.equal(_res._lastUniInvariant.toString(), 0);
 assert.equal(_res._lastUniTotalSupply.toString(), 0);
 assert.equal(_res._lastFeeIndex.toString(), ONE.toString());

 await pool.setBaseRate(constants.Zero);//We already know BASE_RATE works

 await setUp();

 const res = await pool.getLastFeeIndex();

 const expLastUniInvariant = expandTo18Decimals(36);
 const expLastUniTotalSupply = expandTo18Decimals(6);

 assert.equal(res._accFeeIndex.toString(), ONE.toString());
 assert.equal(res._lastUniInvariant.toString(), expLastUniInvariant.toString());
 assert.equal(res._lastUniTotalSupply.toString(), expLastUniTotalSupply.toString());
 assert.equal(res._lastFeeIndex.toString(), ONE.toString());

 const liquidity = expandTo18Decimals(2);

 const _tx0 = await pool.openPosition(liquidity);
 await _tx0.wait();

 const YEAR_BLOCK_COUNT = 2252571;

 await mineBlock(web3, Math.floor(Date.now()/1000));

 const lastBlock = await pool.LAST_BLOCK_NUMBER();
 const blockNum = await web3.eth.getBlockNumber();
 const blockDiff = blockNum - lastBlock;
 const borrowRate = await pool.getBorrowRate();

 const expLastFeeIndex = ONE.add(BigNumber.from(borrowRate.toString()).mul(blockDiff).div(YEAR_BLOCK_COUNT));
 const expAccFeeIndex = expLastFeeIndex;

 const res0 = await pool.getLastFeeIndex();

 assert.equal(res0._accFeeIndex.toString(), expAccFeeIndex.toString());
 assert.equal(res0._lastUniInvariant.toString(), BigNumber.from(expLastUniInvariant.toString()).sub(expandTo18Decimals(20)));
 assert.equal(res0._lastUniTotalSupply.toString(), BigNumber.from(expLastUniTotalSupply.toString()).sub(expandTo18Decimals(2)));
 assert.equal(res0._lastFeeIndex.toString(), expLastFeeIndex.toString());

 const token0Amount = expandTo18Decimals(1);
 const token1Amount = expandTo18Decimals(4);
 await addLiquidity(token0Amount, token1Amount, accounts[0]);

 await mineBlock(web3, Math.floor(Date.now()/1000));
 await mineBlock(web3, Math.floor(Date.now()/1000));
 await mineBlock(web3, Math.floor(Date.now()/1000));

 const lastBlock1 = await pool.LAST_BLOCK_NUMBER();
 const blockNum1 = await web3.eth.getBlockNumber();
 const blockDiff1 = blockNum1 - lastBlock1;
 const borrowRate1 = await pool.getBorrowRate();
 const accFeeIndex = await pool.accFeeIndex();

 const expLastFeeIndex1 = ONE.add(BigNumber.from(borrowRate1.toString()).mul(blockDiff1).div(YEAR_BLOCK_COUNT));
 const expAccFeeIndex1 = BigNumber.from(accFeeIndex.toString()).mul(expLastFeeIndex1).div(ONE);

 const res1 = await pool.getLastFeeIndex();

 assert.equal(res1._accFeeIndex.toString(), expAccFeeIndex1.toString());
 assert.equal(res1._lastUniInvariant.toString(), expLastUniInvariant.toString());
 assert.equal(res1._lastUniTotalSupply.toString(), expLastUniTotalSupply.toString());
 assert.equal(res1._lastFeeIndex.toString(), expLastFeeIndex1.toString());
 });

 it('getBorrowRate:MoreThanOptimal', async () => {
 await setUp();

 const optimalUtilRate = expandTo18Decimals(2).div(10);
 await pool.setOptimalUtilizationRate(optimalUtilRate);//normally 80%

 const borrowRate0 = await pool.getBorrowRate();
 const expBorrowRate0 = expandTo18Decimals(1).div(100);

 assert.equal(borrowRate0.toString(), expBorrowRate0.toString());

 const liquidity = expandTo18Decimals(2);

 const _tx0 = await pool.openPosition(liquidity);
 await _tx0.wait();

 const borrowRate = await pool.getBorrowRate();
 const expBorrowRate = expandTo18Decimals(1385).div(1000);

 assert.equal(borrowRate.toString(), expBorrowRate.toString());
 });

 it('getBorrowRate:Optimal', async () => {
 await setUp();

 const optimalUtilRate = expandTo18Decimals(5).div(10);
 await pool.setOptimalUtilizationRate(optimalUtilRate);//normally 80%

 const borrowRate0 = await pool.getBorrowRate();
 const expBorrowRate0 = expandTo18Decimals(1).div(100);

 assert.equal(borrowRate0.toString(), expBorrowRate0.toString());

 const liquidity = expandTo18Decimals(2);

 const _tx0 = await pool.openPosition(liquidity);
 await _tx0.wait();

 const borrowRate = await pool.getBorrowRate();
 const expBorrowRate = expandTo18Decimals(101).div(100);

 assert.equal(borrowRate.toString(), expBorrowRate.toString());
 });

 it('getBorrowRate:lessThanOptimal', async () => {
 await setUp();

 const borrowRate0 = await pool.getBorrowRate();
 const expBorrowRate0 = expandTo18Decimals(1).div(100);

 assert.equal(borrowRate0.toString(), expBorrowRate0.toString());

 const liquidity = expandTo18Decimals(2);

 const _tx0 = await pool.openPosition(liquidity);
 await _tx0.wait();

 const borrowRate = await pool.getBorrowRate();
 const expBorrowRate = expandTo18Decimals(635).div(1000);

 assert.equal(borrowRate.toString(), expBorrowRate.toString());
 });

 it('getUtilizationRate:uniHasLiquidity', async () => {
 await setUp();

 const start_UNI_LP_BORROWED = await pool.UNI_LP_BORROWED();
 const start_uniBal = await uniPair.balanceOf(pool.address);
 const start_utilizationRate = await pool.getUtilizationRate();

 const liquidity = expandTo18Decimals(2);

 const _tx0 = await pool.openPosition(liquidity);
 await _tx0.wait();

 const mid_UNI_LP_BORROWED = await pool.UNI_LP_BORROWED();
 const mid_uniBal = await uniPair.balanceOf(pool.address);
 const mid_utilizationRate = await pool.getUtilizationRate();

 const exp50pct = expandTo18Decimals(5).div(10);

 assert.equal(mid_UNI_LP_BORROWED.toString(), liquidity.toString());
 assert.equal(mid_uniBal.toString(), BigNumber.from(start_uniBal).sub(liquidity).toString());
 assert.equal(mid_utilizationRate.toString(), exp50pct.toString());

 const token0Amount = expandTo18Decimals(1);
 const token1Amount = expandTo18Decimals(4);
 await token0.transfer(pool.address, token0Amount);
 await token1.transfer(pool.address, token1Amount);

 const _tx1 = await pool.closePosition(liquidity);
 await _tx1.wait();

 const end_UNI_LP_BORROWED = await pool.UNI_LP_BORROWED();
 const end_uniBal = await uniPair.balanceOf(pool.address);
 const end_utilizationRate = await pool.getUtilizationRate();

 assert.equal(end_UNI_LP_BORROWED.toString(), start_UNI_LP_BORROWED.toString());
 assert.equal(end_uniBal.toString(), start_uniBal.toString());
 assert.equal(end_utilizationRate.toString(), start_utilizationRate.toString());
 });

 it('closePositionWithLiquidity:uniHasLiquidity', async () => {
 await setUp();

 const token0Amount = expandTo18Decimals(1);
 const token1Amount = expandTo18Decimals(4);
 await addToUniLiquidity(token0Amount, token1Amount, accounts[0]);

 await pool.setBaseRate(constants.Zero);
 await pool.setSlope1(constants.Zero);
 await pool.setSlope2(constants.Zero);

 const liquidity = expandTo18Decimals(2);

 const _tx0 = await pool.openPosition(liquidity);
 await _tx0.wait();

 await uniPair.transfer(pool.address, liquidity);

 const start_totalUniLiquidity = await pool.totalUniLiquidity();
 const start_UNI_LP_BORROWED = await pool.UNI_LP_BORROWED();
 const start_BORROWED_INVARIANT = await pool.BORROWED_INVARIANT();
 const start_token0Bal = await token0.balanceOf(uniPair.address);
 const start_token1Bal = await token1.balanceOf(uniPair.address);
 const start_userToken0Bal = await token0.balanceOf(accounts[0]);
 const start_userToken1Bal = await token1.balanceOf(accounts[0]);

 const _tx1 = await pool.closePositionWithLiquidity();
 await _tx1.wait();

 const end_totalUniLiquidity = await pool.totalUniLiquidity();
 const end_UNI_LP_BORROWED = await pool.UNI_LP_BORROWED();
 const end_BORROWED_INVARIANT = await pool.BORROWED_INVARIANT();
 const end_token0Bal = await token0.balanceOf(uniPair.address);
 const end_token1Bal = await token1.balanceOf(uniPair.address);
 const end_userToken0Bal = await token0.balanceOf(accounts[0]);
 const end_userToken1Bal = await token1.balanceOf(accounts[0]);

 assert.equal(end_userToken0Bal.toString(), BigNumber.from(start_userToken0Bal.toString()));
 assert.equal(end_userToken1Bal.toString(), BigNumber.from(start_userToken1Bal.toString()));
 assert.equal(end_token0Bal.toString(), BigNumber.from(start_token0Bal.toString()));
 assert.equal(end_token1Bal.toString(), BigNumber.from(start_token1Bal.toString()));

 assert.equal(end_totalUniLiquidity.toString(), BigNumber.from(start_totalUniLiquidity.toString()).add(liquidity).toString());
 assert.equal(end_UNI_LP_BORROWED.toString(), BigNumber.from(start_UNI_LP_BORROWED.toString()).sub(liquidity).toString());
 assert.equal(end_BORROWED_INVARIANT.toString(), BigNumber.from(start_BORROWED_INVARIANT.toString()).sub(liquidity).toString());
 });

 it('closePosition:uniHasLiquidity', async () => {
 await setUp();

 await pool.setBaseRate(constants.Zero);
 await pool.setSlope1(constants.Zero);
 await pool.setSlope2(constants.Zero);

 const liquidity = expandTo18Decimals(2);

 const _tx0 = await pool.openPosition(liquidity);
 await _tx0.wait();

 const token0Amount = expandTo18Decimals(2);
 const token1Amount = expandTo18Decimals(8);
 await token0.transfer(pool.address, token0Amount);
 await token1.transfer(pool.address, token1Amount);

 const start_totalUniLiquidity = await pool.totalUniLiquidity();
 const start_UNI_LP_BORROWED = await pool.UNI_LP_BORROWED();
 const start_BORROWED_INVARIANT = await pool.BORROWED_INVARIANT();
 const start_token0Bal = await token0.balanceOf(uniPair.address);
 const start_token1Bal = await token1.balanceOf(uniPair.address);
 const start_userToken0Bal = await token0.balanceOf(accounts[0]);
 const start_userToken1Bal = await token1.balanceOf(accounts[0]);

 const _tx1 = await pool.closePosition(liquidity);
 await _tx1.wait();

 const end_totalUniLiquidity = await pool.totalUniLiquidity();
 const end_UNI_LP_BORROWED = await pool.UNI_LP_BORROWED();
 const end_BORROWED_INVARIANT = await pool.BORROWED_INVARIANT();
 const end_token0Bal = await token0.balanceOf(uniPair.address);
 const end_token1Bal = await token1.balanceOf(uniPair.address);
 const end_userToken0Bal = await token0.balanceOf(accounts[0]);
 const end_userToken1Bal = await token1.balanceOf(accounts[0]);

 assert.equal(end_userToken0Bal.toString(), BigNumber.from(start_userToken0Bal.toString()).add(token0Amount.div(2)));
 assert.equal(end_userToken1Bal.toString(), BigNumber.from(start_userToken1Bal.toString()).add(token1Amount.div(2)));
 assert.equal(end_token0Bal.toString(), BigNumber.from(start_token0Bal.toString()).add(token0Amount.div(2)));
 assert.equal(end_token1Bal.toString(), BigNumber.from(start_token1Bal.toString()).add(token1Amount.div(2)));
 assert.equal(end_totalUniLiquidity.toString(), BigNumber.from(start_totalUniLiquidity.toString()).add(liquidity));
 assert.equal(end_UNI_LP_BORROWED.toString(), BigNumber.from(start_UNI_LP_BORROWED.toString()).sub(liquidity).toString());
 assert.equal(end_BORROWED_INVARIANT.toString(), BigNumber.from(start_BORROWED_INVARIANT.toString()).sub(liquidity).toString());
 });

 it('loseLiquidity:uniHasLiquidity', async () => {
 await setUp();

 await pool.setBaseRate(constants.Zero);
 await pool.setSlope1(constants.Zero);
 await pool.setSlope2(constants.Zero);

 const liquidity = expandTo18Decimals(2);

 const _tx0 = await pool.openPosition(liquidity);
 await _tx0.wait();

 const start_totalUniLiquidity = await pool.totalUniLiquidity();
 const start_UNI_LP_BORROWED = await pool.UNI_LP_BORROWED();
 const start_BORROWED_INVARIANT = await pool.BORROWED_INVARIANT();

 const uniTotalSupply = expandTo18Decimals(4);//await uniPair.totalSupply();
 const uniInvariant = expandTo18Decimals(4);

 const _tx1 = await pool.loseLiquidity(liquidity);
 await _tx1.wait();

 const uniLiquidity = liquidity.mul(BigNumber.from(uniTotalSupply)).div(uniInvariant);

 const end_totalUniLiquidity = await pool.totalUniLiquidity();
 const end_UNI_LP_BORROWED = await pool.UNI_LP_BORROWED();
 const end_BORROWED_INVARIANT = await pool.BORROWED_INVARIANT();

 assert.equal(end_totalUniLiquidity.toString(), start_totalUniLiquidity.toString());
 assert.equal(end_UNI_LP_BORROWED.toString(), BigNumber.from(start_UNI_LP_BORROWED.toString()).sub(uniLiquidity).toString());
 assert.equal(end_BORROWED_INVARIANT.toString(), BigNumber.from(start_BORROWED_INVARIANT.toString()).sub(liquidity).toString());
 });

 it('openPosition:uniHasLiquidity', async () => {
 await setUp();

 const startToken0Bal = await token0.balanceOf(accounts[0]);
 const startToken1Bal = await token1.balanceOf(accounts[0]);

 const start_totalUniLiquidity = await pool.totalUniLiquidity();
 const start_UNI_LP_BORROWED = await pool.UNI_LP_BORROWED();
 const start_BORROWED_INVARIANT = await pool.BORROWED_INVARIANT();

 const liquidity = expandTo18Decimals(2);
 const _tx = await pool.openPosition(liquidity);
 const tx = await _tx.wait();
 const event = tx.events[tx.events.length - 1];
 const expected0 = expandTo18Decimals(1);
 const expected1 = expandTo18Decimals(4);

 assert.equal(event.event.toString(), 'OpenPosition');
 assert.equal(event.args['tokensOwed0'].toString(), expected0.toString());
 assert.equal(event.args['tokensOwed1'].toString(), expected1.toString());

 const end_totalUniLiquidity = await pool.totalUniLiquidity();
 const end_UNI_LP_BORROWED = await pool.UNI_LP_BORROWED();
 const end_BORROWED_INVARIANT = await pool.BORROWED_INVARIANT();

 assert.equal(end_totalUniLiquidity.toString(), BigNumber.from(start_totalUniLiquidity.toString()).sub(liquidity).toString());
 assert.equal(end_UNI_LP_BORROWED.toString(), BigNumber.from(start_UNI_LP_BORROWED.toString()).add(liquidity).toString());
 assert.equal(end_BORROWED_INVARIANT.toString(), BigNumber.from(start_BORROWED_INVARIANT.toString()).add(liquidity).toString());

 const endToken0Bal = await token0.balanceOf(accounts[0]);
 const endToken1Bal = await token1.balanceOf(accounts[0]);

 assert.equal(endToken0Bal.toString(), BigNumber.from(startToken0Bal.toString()).add(expected0).toString());
 assert.equal(endToken1Bal.toString(), BigNumber.from(startToken1Bal.toString()).add(expected1).toString());
 });

 it('openPosition:fail', async () => {
 await setUp();
 const liquidity = expandTo18Decimals(4).add(1);
 await pool.openPosition(liquidity).should.be.rejectedWith('VegaswapV1: INSUFFICIENT_LIQUIDITY_IN_CPM');
 });

 it('burn:uniHasLiquidity', async () => {
 await setUp();

 const userBal = await pool.balanceOf(accounts[0]);
 const expectedUserBal = expandTo18Decimals(2);
 assert.equal(userBal.toString(), expectedUserBal.toString());

 const selfBal = await pool.balanceOf(pool.address);
 assert.equal(selfBal.toString(), 0);

 const poolBal = await uniPair.balanceOf(pool.address);
 const expectedPoolBal = expandTo18Decimals(4);
 assert.equal(poolBal.toString(), expectedPoolBal.toString());

 const totalPoolSupply = await pool.totalSupply();
 const expectedTotalPoolSuppy = expandTo18Decimals(4);
 assert.equal(totalPoolSupply.toString(), expectedTotalPoolSuppy.toString());

 await pool.transfer(pool.address, expectedUserBal);

 const selfBal1 = await pool.balanceOf(pool.address);
 assert.equal(selfBal1.toString(), expectedUserBal.toString());

 await pool.burn(accounts[0], false, { gasPrice: 0 });

 const userBal1 = await pool.balanceOf(accounts[0]);
 assert.equal(userBal1.toString(), 0);

 const poolBal1 = await uniPair.balanceOf(pool.address);
 const expectedPoolBal1 = expandTo18Decimals(2);
 assert.equal(poolBal1.toString(), expectedPoolBal1.toString());

 const totalPoolSupply1 = await pool.totalSupply();
 const expectedTotalPoolSuppy1 = expandTo18Decimals(2);
 assert.equal(totalPoolSupply1.toString(), expectedTotalPoolSuppy1.toString());
 });

 it('mint:uniHasLiquidity', async () => {
 const token0Amount = expandTo18Decimals(1);
 const token1Amount = expandTo18Decimals(4);
 await addToUniLiquidity(token0Amount, token1Amount, accounts[1]);
 await addLiquidity(token0Amount, token1Amount, accounts[1]);
 await addLiquidity(token0Amount, token1Amount, accounts[0]);

 const userBal = await pool.balanceOf(accounts[0]);
 const expectedUserBal = expandTo18Decimals(2);
 assert.equal(userBal.toString(), expectedUserBal.toString());

 const selfBal = await pool.balanceOf(pool.address);
 assert.equal(selfBal.toString(), 0);

 const poolBal = await uniPair.balanceOf(pool.address);
 const expectedPoolBal = expandTo18Decimals(4);
 assert.equal(poolBal.toString(), expectedPoolBal.toString());

 const totalPoolSupply = await pool.totalSupply();
 const expectedTotalPoolSuppy = expandTo18Decimals(4);
 assert.equal(totalPoolSupply.toString(), expectedTotalPoolSuppy.toString());
 });

 it('getBorrowedReserves:ZeroBorrowedInvariant:uniHasLiquidity', async () => {
 const token0Amount = expandTo18Decimals(1);
 const token1Amount = expandTo18Decimals(4);
 await addToUniLiquidity(token0Amount, token1Amount, accounts[1]);
 await addLiquidity(token0Amount, token1Amount, accounts[0]);

 const res = await uniPair.getReserves();

 const totalUniSupply = await uniPair.totalSupply();

 const totalPoolUniLiquidity  = await pool.totalUniLiquidity();

 const uniReserve0 = BigNumber.from(res._reserve0.toString());
 const uniReserve1 = BigNumber.from(res._reserve1.toString());

 const res0 = await pool.getBorrowedReserves(uniReserve0,uniReserve1);
 assert.equal(res0._reserve0.toString(), token0Amount);
 assert.equal(res0._reserve1.toString(), token1Amount);
 });

 it('getBorrowedReserves:NonZeroBorrowedInvariant', async () => {
 const ONE = expandTo18Decimals(1);

 await setUp();

 const liquidity = expandTo18Decimals(2);

 const _tx0 = await pool.openPosition(liquidity);
 await _tx0.wait();

 await pool.getAndUpdateLastFeeIndex();

 const borrowedInvariant = await pool.BORROWED_INVARIANT();
 const totalUniSupply = await uniPair.totalSupply();
 const totalPoolUniLiquidity  = await pool.totalUniLiquidity();

 const res = await uniPair.getReserves();

 const uniReserve0 = BigNumber.from(res._reserve0.toString());
 const uniReserve1 = BigNumber.from(res._reserve1.toString());

 const _reserve0 = uniReserve0.mul(BigNumber.from(totalPoolUniLiquidity.toString())).div(BigNumber.from(totalUniSupply.toString()));
 const _reserve1 = uniReserve1.mul(BigNumber.from(totalPoolUniLiquidity.toString())).div(BigNumber.from(totalUniSupply.toString()));

 const resRoot0 = sqrt(uniReserve0.mul(ONE));
 const resRoot1 = sqrt(uniReserve1.mul(ONE));

 const borrowedInvariantNum = BigNumber.from(borrowedInvariant.toString());

 const vegaReserve1 = borrowedInvariantNum.mul(resRoot1).div(resRoot0);
 const vegaReserve0 = borrowedInvariantNum.mul(resRoot0).div(resRoot1);

 const expVegaReserve0 = _reserve0.add(vegaReserve0);
 const expVegaReserve1 = _reserve1.add(vegaReserve1);

 const res0 = await pool.getBorrowedReserves(uniReserve0,uniReserve1);

 assert.equal(res0._reserve0.toString(), expVegaReserve0.toString());
 assert.equal(res0._reserve1.toString(), expVegaReserve1.toString());
 });

 it('getBorrowedReserves:ZeroBorrowedInvariant', async () => {
 const token0Amount = expandTo18Decimals(1);
 const token1Amount = expandTo18Decimals(4);
 await addLiquidity(token0Amount, token1Amount, accounts[1]);

 const res = await uniPair.getReserves();

 const uniReserve0 = BigNumber.from(res._reserve0.toString());
 const uniReserve1 = BigNumber.from(res._reserve1.toString());

 assert.equal(uniReserve0.toString(), token0Amount.toString());
 assert.equal(uniReserve1.toString(), token1Amount.toString());

 const totalUniSupply = await uniPair.totalSupply();
 assert.equal(totalUniSupply.toString(), expandTo18Decimals(2).toString());

 const totalPoolUniLiquidity  = await pool.totalUniLiquidity();
 assert.equal(totalPoolUniLiquidity.toString(), expandTo18Decimals(2).sub(1000).toString());

 const res0 = await pool.getBorrowedReserves(uniReserve0,uniReserve1);
 assert.equal(res0._reserve0.toString(), token0Amount.sub(500).toString());
 assert.equal(res0._reserve1.toString(), token1Amount.sub(2000).toString());
 });
 });
 });/**/