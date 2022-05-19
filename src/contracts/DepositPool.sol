// SPDX-License-Identifier: GNU GPL v3
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';

import './libraries/GammaswapLibrary.sol';

contract DepositPool is ERC20 {

    address public uniRouter;
    address public uniPair;
    address public token0;
    address public token1;

    constructor(address _uniRouter, address _uniPair, address _token0, address _token1) ERC20("Gammaswap V0", "GAMA-V0") {
        uniRouter = _uniRouter;
        uniPair = _uniPair;
        token0 = _token0;
        token1 = _token1;
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
        //TransferHelper.safeTransferFrom(tokenA, msg.sender, address(this), amountA);
        //TransferHelper.safeTransferFrom(tokenB, msg.sender, address(this), amountB);
        uint sf= 0;
        //liquidity = mint(to);
    }

    //Uniswap.
    function addLiquidity(uint amount0, uint amount1, uint amountAMin, uint amountBMin) internal returns(uint amountA, uint amountB, uint liquidity) {
        /*(uint reserveA, uint reserveB) = getCPMReserves(IVegaswapV1Pool(IVegaswapV1Factory(factory).getPool(_token0, _token1)).uniPair());

        address _uniRouter = IVegaswapV1Factory(factory).uniRouter();
        if(amount0 > IERC20(_token0).allowance(address(this), _uniRouter)) {
            IERC20(_token0).approve(_uniRouter, uint(-1));
        }
        if(amount1 > IERC20(_token1).allowance(address(this), _uniRouter)) {
            IERC20(_token1).approve(_uniRouter, uint(-1));
        }
        (amountA, amountB, liquidity) = IUniswapV2Router02(_uniRouter)
        .addLiquidity(_token0, _token1, amount0, amount1, amountAMin, amountBMin, address(this), uint(-1));//TODO: Should we use a lower deadline
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
