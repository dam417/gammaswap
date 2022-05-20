// SPDX-License-Identifier: GNU GPL v3
pragma solidity ^0.8.0;

interface IPositionManager {
    // details about the uniswap position
    struct Position {
        // the nonce for permits
        uint96 nonce;
        address operator;
        address poolId;
        address token0;
        address token1;
        address uniPair;
        uint256 tokensHeld0;
        uint256 tokensHeld1;
        //uint256 uniPairHeld;
        uint256 liquidity;
        uint256 rateIndex;
        uint256 blockNum;
    }

    /*struct MintParams {
        address token0;
        address token1;
        uint256 liquidity;
        address recipient;
        uint256 deadline;
    }/**/
    /*function IPositionManager(){

    }/**/
}
