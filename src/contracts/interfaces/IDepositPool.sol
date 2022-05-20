// SPDX-License-Identifier: GNU GPL v3
pragma solidity ^0.8.0;

interface IDepositPool {
    function getLastFeeIndex() external view returns(uint _accFeeIndex, uint _lastUniInvariant, uint _lastUniTotalSupply, uint _lastFeeIndex);
    function getAndUpdateLastFeeIndex() external returns(uint256 _accFeeIndex);
    function openPosition(uint256 liquidity) external returns (uint256 tokensOwed0, uint256 tokensOwed1);

}
