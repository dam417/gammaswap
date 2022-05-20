// SPDX-License-Identifier: GNU GPL v3
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';

import './libraries/GammaswapLibrary.sol';

contract DepositPool is ERC20 {

    uint public constant ONE = 10**18;
    uint public constant MINIMUM_LIQUIDITY = 10**3;

    address public uniRouter;
    address public uniPair;
    address public token0;
    address public token1;

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

    uint private unlocked = 1;

    modifier lock() {
        require(unlocked == 1, 'DepositPool: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor(address _uniRouter, address _uniPair, address _token0, address _token1) ERC20("Gammaswap V0", "GAMA-V0") {
        uniRouter = _uniRouter;
        uniPair = _uniPair;
        (token0, token1) = GammaswapLibrary.sortTokens(_token0, _token1);
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal virtual returns (uint amountA, uint amountB) {
        // create the pair if it doesn't exist ye
        (uint reserveA, uint reserveB) = GammaswapLibrary.getUniReserves(uniPair, tokenA, tokenB);
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
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to
    ) external virtual returns (uint amountA, uint amountB, uint liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        TransferHelper.safeTransferFrom(tokenA, msg.sender, address(this), amountA);
        TransferHelper.safeTransferFrom(tokenB, msg.sender, address(this), amountB);
        liquidity = mint(to);
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
    function getLastFeeIndex() external view returns(uint _accFeeIndex, uint _lastUniInvariant, uint _lastUniTotalSupply, uint _lastFeeIndex) {
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

    function getAndUpdateLastFeeIndex() external returns(uint256 _accFeeIndex) {
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

    //Uniswap.
    /*function removeLiquidity(address _token0, address _token1, address _uniPair, uint liquidity, address to) internal returns(uint amount0, uint amount1) {
        address _uniRouter = IVegaswapV1Factory(factory).uniRouter();
        if(liquidity > IERC20(_uniPair).allowance(address(this), _uniRouter)) {
            IERC20(_uniPair).approve(_uniRouter, uint(-1));
        }
        (amount0, amount1) = IUniswapV2Router02(_uniRouter).removeLiquidity(_token0, _token1, liquidity, 0, 0, to, uint(-1));
    }/**/
    //TODO: remove liquidity

    //TODO: openPosition

    //TODO: closePosition

    //TODO: updateYield (based on utilization ratio)


    /*function DepositPool(){

    }/**/
}
