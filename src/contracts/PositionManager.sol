// SPDX-License-Identifier: GNU GPL v3
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';

import './libraries/GammaswapPosLibrary.sol';
import './interfaces/IPositionManager.sol';

contract PositionManager is IPositionManager, ERC721 {

    uint256 MAX_SLIPPAGE = 10**17;//10%

    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));
    /// @dev IDs of pools assigned by this contract
    //mapping(address => uint80) private _poolIds;

    /// @dev Pool keys by pool ID, to save on SSTOREs for position data
    //mapping(uint80 => PoolAddress.PoolKey) private _poolIdToPoolKey;

    /// @dev The ID of the next token that will be minted. Skips 0
    uint176 private _nextId = 1;
    /// @dev The ID of the next pool that is used for the first time. Skips 0
    uint80 private _nextPoolId = 1;

    mapping(address => mapping(address => address)) public getPool;
    mapping(address => uint256[]) public positionsByOwner;
    mapping(address => uint256) public positionCountByOwner;

    address[] public  allPools;
    address owner;

    uint256 ONE = 10**18;//1

    /// @dev The token ID position data
    mapping(uint256 => Position) internal _positions;

    /// @dev The token ID position data
    mapping(address => uint256) internal _tokenBalances;

    /// @dev The ID of the next token that will be minted. Skips 0
    //uint176 private _nextId = 1;
    /// @dev The ID of the next pool that is used for the first time. Skips 0
    //uint80 private _nextPoolId = 1;

    modifier isAuthorizedForToken(uint256 tokenId) {
        require(_isApprovedOrOwner(msg.sender, tokenId), 'PositionManager: NOT_AUTHORIZED');
        _;
    }

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        owner = msg.sender;
    }

    function registerPool(address token0, address token1, address pool) external {
        require(msg.sender == owner, "PositionManager: FORBIDDEN");
        if(getPool[token0][token1] == address(0) || getPool[token1][token0] == address(0)) {
            getPool[token0][token1] = pool;
            getPool[token1][token0] = pool; // populate mapping in the reverse direction
            allPools.push(pool);
        }
    }

    function allPoolsLength() external view returns (uint) {
        return allPools.length;
    }

    function getDepositedAmounts(address token0, address token1) internal view returns(uint256 token0Amt, uint256 token1Amt) {
        token0Amt = IERC20(token0).balanceOf(address(this)) - _tokenBalances[token0];
        token1Amt = IERC20(token1).balanceOf(address(this)) - _tokenBalances[token1];
    }

    function updateTokenBalances(Position storage position) internal {
        (_tokenBalances[position.token0], _tokenBalances[position.token1]) = GammaswapPosLibrary.getTokenBalances(position.token0, position.token1, address(this));
        _tokenBalances[position.uniPair] = IERC20(position.uniPair).balanceOf(address(this));
    }

    function openPosition(address token0, address token1, uint256 amount0, uint256 amount1, uint256 liquidity, address to) external returns (uint256 tokenId) {
        TransferHelper.safeTransferFrom(token0, msg.sender, address(this), amount0);
        TransferHelper.safeTransferFrom(token1, msg.sender, address(this), amount1);
        tokenId = mint(token0, token1, liquidity, to);
    }

    function addPositionToOwnerList(address to, uint256 tokenId) internal {
        positionsByOwner[to].push(tokenId);
        positionCountByOwner[to] = positionsByOwner[to].length;
    }

    /*
     * TODO: Instead of portfolio value use invariant to measure liquidity. This will enable to also increase the position size based on liquidity
     * Also the liquidity desired should probably be measured in terms of an invariant.
     */
    //TODO: When we mint and increase positions we have to track the funds that we're holding for the pool
    /// inheritdoc IVegaswapV1Position
    //function mint(MintParams calldata params) internal returns (uint256 tokenId) {
    function mint(address token0, address token1, uint256 liquidity, address to) internal returns (uint256 tokenId) {
        //function mint(MintParams calldata params) external payable override checkDeadline(params.deadline) returns (uint256 tokenId) {
        //We transfer token0Amt and token1Amt at the same time
        //params.liquidity is the liquidity as LP shares of uni pool. In the GUI it will look like quantites of A and B. and a sum total in terms of B/A collateral
        //PositionParams memory posParams = getPositionParams(params);//your position will be in terms of A*B

        //(address _token0, address _token1) = GammaswapPosLibrary.sortTokens(params.token0, params.token1);
        (address _token0, address _token1) = GammaswapPosLibrary.sortTokens(token0, token1);
        address _poolId = getPool[_token0][_token1];
        require(_poolId != address(0), 'PositionManager: POOL_NOT_FOUND');

        address _uniPair = IDepositPool(_poolId).getUniPair();
        (uint256 _token0Amt, uint256 _token1Amt) = getDepositedAmounts(_token0, _token1);

        uint256 _accFeeIndex = IDepositPool(_poolId).getAndUpdateLastFeeIndex();

        //(uint256 _tokensOwed0, uint256 _tokensOwed1) = IDepositPool(_poolId).openPosition(params.liquidity);
        (uint256 _tokensOwed0, uint256 _tokensOwed1) = IDepositPool(_poolId).openPosition(liquidity);

        uint256 _liquidity = GammaswapPosLibrary.convertAmountsToLiquidity(_tokensOwed0,_tokensOwed1);//this liquidity

        //_mint(params.recipient, (tokenId = _nextId++));
        _mint(to, (tokenId = _nextId++));

        _positions[tokenId] = Position({
            nonce: 0,
            operator: address(0),
            poolId: _poolId,
            token0: _token0,
            token1: _token1,
            tokensHeld0: (_tokensOwed0 + _token0Amt),
            tokensHeld1: (_tokensOwed1 + _token1Amt),
            uniPair: _uniPair,
            //uniPairHeld: _uniPairAmt,
            liquidity: _liquidity,
            rateIndex: _accFeeIndex,
            blockNum: block.number
        });

        Position storage position = _positions[tokenId];

        GammaswapPosLibrary.checkCollateral(position, 750);

        updateTokenBalances(position);

        addPositionToOwnerList(to, tokenId);

        /**/


        /*
         * We don't have to do that whole thing up there with the token balances in saveTokenBalances.
         * We just update tokenBalances[params.token0] to whatever the current token balance is. There should never be any leftovers
         */
        /*
         * Reason why balancer is better for OTM options is because for the delta to approach 1 the price has to move much more. Which is
         * what happens with OTM options. With ATM options delta is 50 at the start. with ITM options delta is > 50 at the start.
         */
        //emit MintPosition(tokenId, _liquidity, position.tokensHeld0, position.tokensHeld1, position.uniPairHeld, _accFeeIndex);
    }


    /// inheritdoc IVegaswapV1Position
    function increaseCollateral(uint256 tokenId, uint256 amount0, uint256 amount1) external returns (uint256 token0Amt, uint256 token1Amt)
    {
        Position storage position = _positions[tokenId];

        TransferHelper.safeTransferFrom(position.token0, msg.sender, address(this), amount0);
        TransferHelper.safeTransferFrom(position.token1, msg.sender, address(this), amount1);

        (token0Amt, token1Amt) = getDepositedAmounts(position.token0, position.token1);

        position.tokensHeld0 = position.tokensHeld0 + token0Amt;
        position.tokensHeld1 = position.tokensHeld1 + token1Amt;

        updateTokenBalances(position);

        //emit IncreaseCollateral(tokenId, position.tokensHeld0, position.tokensHeld1, position.uniPairHeld);
    }

    /// inheritdoc IVegaswapV1Position
    function decreaseCollateral(uint256 tokenId, uint256 amount0, uint256 amount1, address to) external isAuthorizedForToken(tokenId) returns (uint256 tokensHeld0, uint256 tokensHeld1)
    {
        Position storage position = _positions[tokenId];

        position.tokensHeld0 = position.tokensHeld0 - amount0;
        position.tokensHeld1 = position.tokensHeld1 - amount1;

        (, uint256 liquidity) = GammaswapPosLibrary.getPositionLiquidity(position);//We store the interest charged as added liquidity. To do that we have to square the cumRate
        (uint256 owedBalance, uint256 heldBalance) = GammaswapPosLibrary.getPositionBalances(position.uniPair, liquidity, position.tokensHeld0, position.tokensHeld1);//, position.uniPairHeld);
        require((heldBalance * 750) / 1000 >= owedBalance, 'PositionManager: EXCESSIVE_COLLATERAL_REMOVAL');

        _safeTransferFn(position.token0, to, amount0);
        _safeTransferFn(position.token1, to, amount1);

        updateTokenBalances(position);

        //emit DecreaseCollateral(tokenId, position.tokensHeld0, position.tokensHeld1, position.uniPairHeld);
    }


    function _safeTransferFn(address token, address to, uint value) internal {//changed from private
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'DepositPool: TRANSFER_FAILED');
    }


    function updatePositionLiquidity(Position storage position) internal {
        (position.rateIndex, position.liquidity) = GammaswapPosLibrary.getPositionLiquidity(position);
    }

    /*
        Sent amounts necessary to close the position.
     */
    /// inheritdoc INonfungiblePositionManager
    function decreasePosition(uint256 tokenId, uint256 liquidity) external isAuthorizedForToken(tokenId) {
        Position storage position = _positions[tokenId];

        (uint256 token0Amt, uint256 token1Amt) = getDepositedAmounts(position.token0, position.token1);

        position.tokensHeld0 = position.tokensHeld0 + token0Amt;
        position.tokensHeld1 = position.tokensHeld1 + token1Amt;

        //TODO: (Urgent) Think need to fix this. This might not make sense. Because the tokensHeld might be enough to
        //pay the liquidity we want to pay but the geometric mean of them might be lower than the liquidity we want to pay
        uint256 totalLiquidityProvided = GammaswapPosLibrary.convertAmountsToLiquidity(position.tokensHeld0, position.tokensHeld1);
        require(liquidity <= totalLiquidityProvided, "PositionManager: NOT_ENOUGH_LIQUIDITY_PROVIDED");//In the UI we pass

        updatePositionLiquidity(position);
        (uint256 owedBalance, uint256 heldBalance) = GammaswapPosLibrary.getPositionBalances(position.uniPair, position.liquidity, position.tokensHeld0, position.tokensHeld1);//, position.uniPairHeld);
        require(heldBalance >= owedBalance, 'PositionManager: IS_UNDERWATER');
        //require(liquidity <= position.liquidity, "VegaswapV1: EXCESSIVE_LIQUIDITY_BURNED");//In the UI we pass

        uint256 liquidity = position.liquidity < liquidity ? position.liquidity : liquidity;

        //Transfer tokens held and all collateral available
        _safeTransferFn(position.token0, position.poolId, position.tokensHeld0);
        _safeTransferFn(position.token1, position.poolId, position.tokensHeld1);

        (position.tokensHeld0, position.tokensHeld1) = IDepositPool(position.poolId).closePosition(liquidity);

        position.liquidity = position.liquidity - liquidity;

        updateTokenBalances(position);
        //No need to check collateral because decreasing position always improves collateralization

        //emit DecreasePosition(tokenId, liquidity, position.tokensHeld0, position.tokensHeld1);
    }
    /*function PositionManager(){

    }/**/
}
