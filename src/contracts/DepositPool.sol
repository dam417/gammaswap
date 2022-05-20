// SPDX-License-Identifier: GNU GPL v3
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';

import './libraries/GammaswapLibrary.sol';
import "./interfaces/IDepositPool.sol";

contract DepositPool is IDepositPool, ERC20 {

    uint public constant ONE = 10**18;
    uint public constant MINIMUM_LIQUIDITY = 10**3;

    address public uniRouter;
    address public uniPair;
    address public token0;
    address public token1;
    address public positionManager;

    uint public lastUniInvariant;
    uint public lastUniTotalSupply;
    uint public accFeeIndex;
    uint public prevLastUniFeeIndex;
    uint public totalUniLiquidity;

    uint public BORROWED_INVARIANT;
    uint public UNI_LP_BORROWED;
    uint public LAST_BLOCK_NUMBER;
    uint public YEAR_BLOCK_COUNT = 2252571;

    uint public BASE_RATE = 10**16;
    uint public OPTIMAL_UTILIZATION_RATE = 8*(10**17);
    uint public SLOPE1 = 10**18;
    uint public SLOPE2 = 10**18;

    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    uint private unlocked = 1;

    modifier lock() {
        require(unlocked == 1, 'DepositPool: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor(address _uniRouter, address _uniPair, address _token0, address _token1, address _positionManager) ERC20("Gammaswap V0", "GAMA-V0") {
        uniRouter = _uniRouter;
        uniPair = _uniPair;
        (token0, token1) = GammaswapLibrary.sortTokens(_token0, _token1);
        positionManager = _positionManager;
    }

    function getUniPair() external virtual override view returns(address _uniPair) {
        _uniPair = uniPair;
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal virtual returns (uint amountA, uint amountB) {
        // create the pair if it doesn't exist ye
        (uint reserveA, uint reserveB) = GammaswapLibrary.getUniReserves(uniPair, token0, token1);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint amountBOptimal = GammaswapLibrary.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, 'DepositPool: INSUFFICIENT_B_AMOUNT');
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint amountAOptimal = GammaswapLibrary.quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, 'DepositPool: INSUFFICIENT_A_AMOUNT');
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }/**/

    //TODO: add liquidity =>
    /*
        -takes amounts from user
        -calls mint
            -sends amounts to uni
            -stores liquidity from uni
            -mints tokens to user
    */

    function addLiquidity(
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to
    ) external virtual returns (uint amountA, uint amountB, uint liquidity) {
        (amountA, amountB) = _addLiquidity(amountADesired, amountBDesired, amountAMin, amountBMin);
        TransferHelper.safeTransferFrom(token0, msg.sender, address(this), amountA);
        TransferHelper.safeTransferFrom(token1, msg.sender, address(this), amountB);
        liquidity = mint(to);
    }

    // **** REMOVE LIQUIDITY ****
    function removeLiquidity(
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to
    ) public virtual returns (uint amountA, uint amountB) {
        transferFrom(msg.sender, address(this), liquidity); // send liquidity to pair
        (uint amount0, uint amount1) = burn(to);
        require(amountA >= amountAMin, 'DepositPool: INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, 'DepositPool: INSUFFICIENT_B_AMOUNT');
    }

    function addBorrowedTokens(uint256 tokensOwed0, uint256 tokensOwed1, uint256 liquidity) internal {
        UNI_LP_BORROWED = UNI_LP_BORROWED + liquidity;
        uint256 borrowedLiquidity = GammaswapLibrary.convertAmountsToLiquidity(tokensOwed0, tokensOwed1);
        if(BORROWED_INVARIANT > 0) {
            BORROWED_INVARIANT = BORROWED_INVARIANT + borrowedLiquidity;
        } else {
            BORROWED_INVARIANT = borrowedLiquidity;
        }
    }

    function getUtilizationRate() external view returns(uint256 _utilizationRate) {
        uint256 totalLPShares = totalUniLiquidity + UNI_LP_BORROWED;
        _utilizationRate = (UNI_LP_BORROWED * ONE) / totalLPShares;
    }

    function getBorrowRate() external view returns(uint256 _borrowRate) {
        uint256 utilizationRate = this.getUtilizationRate();
        if(utilizationRate <= OPTIMAL_UTILIZATION_RATE) {
            uint256 variableRate = (utilizationRate * SLOPE1) / OPTIMAL_UTILIZATION_RATE;
            _borrowRate = BASE_RATE + variableRate;
        } else {
            uint256 utilizationRateDiff = utilizationRate - OPTIMAL_UTILIZATION_RATE;
            uint256 optimalUtilComplement = ONE - OPTIMAL_UTILIZATION_RATE;
            uint256 variableRate = (utilizationRateDiff * SLOPE2) / optimalUtilComplement;
            _borrowRate = (BASE_RATE + SLOPE1) + variableRate;
        }
    }

    //TODO: What happens if the pool becomes empty? lastFeeIndex becomes 1 but accFeeIndex shouldn't become 1. Will the uniInvariants and/or uniSupply become 0?
    function getLastFeeIndex() external override view returns(uint _accFeeIndex, uint _lastUniInvariant, uint _lastUniTotalSupply, uint _lastFeeIndex) {
        (uint256 reserve0, uint256 reserve1) = GammaswapLibrary.getUniReserves(uniPair, token0, token1);
        if(reserve0 > 0 && reserve1 > 0) {
            _lastUniInvariant = (reserve0 * reserve1) / (10**18);
            _lastUniTotalSupply = IERC20(uniPair).totalSupply();
        }
        if(lastUniInvariant > 0 && _lastUniInvariant > 0 && _lastUniTotalSupply > 0 && lastUniTotalSupply > 0) {
            uint256 numerator =  GammaswapLibrary.rootNumber(_lastUniInvariant) * lastUniTotalSupply;
            uint256 denominator =  GammaswapLibrary.rootNumber(lastUniInvariant) * _lastUniTotalSupply;
            uint256 lastUniFeeIndex = (numerator * (10**18)) / denominator;//TODO: The invariant can't get too big or it will overflow
            uint256 borrowRate = this.getBorrowRate();
            uint blockDiff = block.number - LAST_BLOCK_NUMBER;
            uint256 adjBorrowRate = (blockDiff * borrowRate) / YEAR_BLOCK_COUNT;
            _lastFeeIndex = lastUniFeeIndex + adjBorrowRate;
            _accFeeIndex = (accFeeIndex * _lastFeeIndex) / (10**18);
        } else {
            _accFeeIndex = 10**18;
            _lastFeeIndex = 10**18;
        }
    }

    function getAndUpdateLastFeeIndex() external override returns(uint256 _accFeeIndex) {
        uint256 _lastFeeIndex;
        (_accFeeIndex, lastUniInvariant, lastUniTotalSupply, _lastFeeIndex) = this.getLastFeeIndex();
        if(BORROWED_INVARIANT > 0) {
            uint256 nextBorrowedInvariant = (BORROWED_INVARIANT * _lastFeeIndex) / (10**18);
            //mintDevFee(nextBorrowedInvariant, _lastFeeIndex);
            BORROWED_INVARIANT = nextBorrowedInvariant;
        }
        accFeeIndex = _accFeeIndex;
        LAST_BLOCK_NUMBER = block.number;
    }

    //This is depositing coins into the pool
    /*
     *  This should be like depositing into uniswap. We are mapped 1 to 1 with uniswap
     */
    // this low-level function should be called from a contract which performs important safety checks
    function mint(address to) internal lock returns (uint256 liquidity) {
        (uint amount0, uint amount1) = GammaswapLibrary.getTokenBalances(token0, token1, address(this));

        this.getAndUpdateLastFeeIndex();

        uint256 _reserve0;
        uint256 _reserve1;
        (uint256 _uniReserve0, uint256 _uniReserve1) = GammaswapLibrary.getUniReserves(uniPair, token0, token1);

        uint256 _totalSupply = totalSupply();
        if(_totalSupply > 0) {
            //get reserves from uni
            (_reserve0, _reserve1) = GammaswapLibrary.getBorrowedReserves(uniPair, _uniReserve0, _uniReserve1, totalUniLiquidity, BORROWED_INVARIANT);//This is right because the liquidity has to
        }

        uint256 amountA;
        uint256 amountB;
        //TODO: Change all of this so that it is init to the invariant when there is no liquidity.
        if(amount0 > 0 && amount1 > 0) {
            (amountA, amountB, liquidity) = addLiquidity(amount0, amount1, 0, 0);
        }

        totalUniLiquidity = IERC20(uniPair).balanceOf(address(this));

        if (_totalSupply == 0) {
            liquidity = GammaswapLibrary.convertAmountsToLiquidity(amountA, amountB) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            liquidity = GammaswapLibrary.min2((amountA * _totalSupply) / _reserve0, (amountB * _totalSupply) / _reserve1);//match everything that is in uniswap
        }
        require(liquidity > 0, 'DepositPool: INSUFFICIENT_LIQUIDITY_MINTED');
        _mint(to, liquidity);

        //We do not update the reserves because in theory reserves should not change due to this
        //emit Mint(msg.sender, amountA, amountB);/**/
    }

    //Uniswap.
    function addLiquidity(uint amount0, uint amount1, uint amountAMin, uint amountBMin) internal returns(uint amountA, uint amountB, uint liquidity) {
        //(uint reserveA, uint reserveB) = getCPMReserves(IVegaswapV1Pool(IVegaswapV1Factory(factory).getPool(_token0, _token1)).uniPair());

        if(amount0 > IERC20(token0).allowance(address(this), uniRouter)) {
            IERC20(token0).approve(uniRouter, type(uint).max);
        }
        if(amount1 > IERC20(token1).allowance(address(this), uniRouter)) {
            IERC20(token1).approve(uniRouter, type(uint).max);
        }
        (amountA, amountB, liquidity) = IUniswapV2Router02(uniRouter)
        .addLiquidity(token0, token1, amount0, amount1, amountAMin, amountBMin, address(this), type(uint).max);//TODO: Should we use a lower deadline
        /**/
    }

    function calculateLiquidityAmounts(uint liquidity) internal returns(uint256 amount0, uint256 amount1) {
        (uint balance0, uint balance1) = GammaswapLibrary.getTokenBalances(token0, token1, uniPair);

        (uint256 _reserve0, uint256 _reserve1) = GammaswapLibrary.getBorrowedReserves(uniPair, balance0, balance1, totalUniLiquidity, BORROWED_INVARIANT);

        uint _totalSupply = totalSupply(); // gas savings, must be defined here since totalSupply can update in _mintFee
        require(_totalSupply > 0, 'DepositPool: INSUFFICIENT_UNI_LIQUIDITY_AVAILABLE');

        amount0 = (liquidity * _reserve0) / _totalSupply; // using balances ensures pro-rata distribution
        amount1 = (liquidity * _reserve1) / _totalSupply; // using balances ensures pro-rata distribution
    }

    function calculateUniLiquidity(uint amount0, uint amount1) internal returns(uint256 uniLiquidity) {
        //remove from uni LPs only
        (uint256 _uniReserve0, uint256 _uniReserve1) = GammaswapLibrary.getUniReserves(uniPair, token0, token1);
        uint256 uniTotalSupply = IERC20(uniPair).totalSupply();
        uniLiquidity = GammaswapLibrary.min2((amount0 * uniTotalSupply) / _uniReserve0, (amount1 * uniTotalSupply) / _uniReserve1);
    }

    //TODO: remove liquidity
    // this low-level function should be called from a contract which performs important safety checks
    function burn(address to) internal lock returns (uint _amount0, uint _amount1) {

        this.getAndUpdateLastFeeIndex();

        uint256 liquidity = balanceOf(address(this));
        (uint amount0, uint amount1) = calculateLiquidityAmounts(liquidity);
        require(amount0 > 0 && amount1 > 0, 'DepositPool: INSUFFICIENT_LIQUIDITY_BURNED');

        //remove from uni LPs only
        uint256 uniLiquidity = calculateUniLiquidity(amount0, amount1);
        require(uniLiquidity <= IERC20(uniPair).balanceOf(address(this)), 'DepositPool: INSUFFICIENT_UNI_LIQUIDITY_AVAILABLE');

        (_amount0, _amount1) = removeLiquidity(uniLiquidity, to);

        totalUniLiquidity = IERC20(uniPair).balanceOf(address(this));
        _burn(address(this), liquidity);

        //emit Burn(msg.sender, _amount0, _amount1, uniLiquidity, to);
    }

    //Uniswap.
    function removeLiquidity(uint liquidity, address to) internal returns(uint amount0, uint amount1) {
        if(liquidity > IERC20(uniPair).allowance(address(this), uniRouter)) {
            IERC20(uniPair).approve(uniRouter, type(uint).max);
        }
        (amount0, amount1) = IUniswapV2Router02(uniRouter).removeLiquidity(token0, token1, liquidity, 0, 0, to, type(uint).max);
    }/**/

    //TODO: openPosition
    /**
         * TODO: The attack is borrow large sum, depress the price of token0, then deposit token1 to use up all the pool liquidity
         * then trade back up to recover loaned out funds and make a profit in the IL
         * Come up with an equation to show that this can't be gamed with a flash loan. It can be gamed but the issue only affects the less steep
         * part of the uniswap curve. Issue could be resolved with a small fee. But the same issue could affect suppliers.
         * If that's the case the other solution is using a fee based on a TWAP. Say deposits are measured based on an UNI TWAP rather than the spot price.
         * Same for opening positions.
         * Come up with a math formula to explain this attack
         */
    //function openPosition(uint256 liquidity, uint256 swapAmt, bool isBuy) external onlyPositionManager lock override
    function openPosition(uint256 liquidity) external lock override returns (uint256 tokensOwed0, uint256 tokensOwed1) {
        require(msg.sender == positionManager, 'DepositPool: FORBIDDEN');
        require(liquidity <= totalUniLiquidity, 'DepositPool: INSUFFICIENT_LIQUIDITY_IN_CPM');

        this.getAndUpdateLastFeeIndex();

        //remove that liquidity
        (tokensOwed0, tokensOwed1) = removeLiquidity(liquidity, address(this));

        totalUniLiquidity = IERC20(uniPair).balanceOf(address(this));

        addBorrowedTokens(tokensOwed0, tokensOwed1, liquidity);

        //All amounts are transferred to positionManager
        _safeTransferFn(token0, msg.sender, tokensOwed0);
        _safeTransferFn(token1, msg.sender, tokensOwed1);

        //emit OpenPosition(tokensOwed0, tokensOwed1);/**/
    }

    function _safeTransferFn(address token, address to, uint value) internal {//changed from private
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'DepositPool: TRANSFER_FAILED');
    }

    //TODO: closePosition

    //TODO: updateYield (based on utilization ratio)


    /*function DepositPool(){

    }/**/
}
