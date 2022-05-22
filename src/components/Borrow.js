import React, { useState, useEffect } from 'react'
import { BigNumber, constants } from 'ethers'
import { useForm } from 'react-hook-form';
import * as Web3 from "web3/dist/web3.min.js";
import IUniswapV2Pair from '../abis/IUniswapV2Pair.json';
import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Heading,
    Box
} from '@chakra-ui/react'

function Borrow({ account, token0, token1, posManager, depPool }) {
    const [ liq1InTokB, setLiq1InTokB] = useState("0");
    const [ liq2InTokB, setLiq2InTokB] = useState("0");
    const [ balInTokB, setBalInTokB] = useState("0");
    const [ uniPrice, setUniPrice] = useState("0");
    const [ pos, setPos] = useState({});
    const { register, handleSubmit } = useForm();
    const { register: register2, handleSubmit: handleSubmit2 } = useForm();

    function pretty(num) {
        return Web3.utils.fromWei(num);
    }

    function sqrt(y){
        let z;
        if (y.gt(3)) {
            z = y;
            let x = (y.div(2)).add(1);
            while (x.lt(z)) {
                z = x;
                x = ((y.div(x)).add(x)).div(2);
            }
        } else if (!y.isZero()) {
            z = BigNumber.from(1);
        }
        return z;
    }

    useEffect(() => {
        async function fetchData() {
            console.log("Borrow.fetchData() >>");
            if(posManager && posManager.methods) {
                const positionCount = await posManager.methods.positionCountByOwner(account).call();
                console.log("positionCount >>");
                console.log(positionCount);
                console.log(posManager);
                const positions = await posManager.methods.getPositionsByOwner(account).call();
                console.log("positions >>");
                console.log(positions);
                if(positionCount > 0) {
                    const position = await posManager.methods.positions(positionCount).call();
                    setPos(position);
                }
            }
            if(depPool && depPool.methods) {
                const uniPair = await depPool.methods.getUniPair().call();
                console.log("uniPair >> ");
                console.log(uniPair);
                const uniPairContract = new web3.eth.Contract(IUniswapV2Pair.abi, uniPair);
                const reserves = await uniPairContract.methods.getReserves().call();
                console.log("reserves >>");
                console.log(reserves.reserve0);
                console.log(reserves.reserve1);
                const price = BigNumber.from(reserves.reserve1).mul(BigNumber.from(10).pow(18)).div(reserves.reserve0);
                console.log("price >>");
                console.log(price.toString());
                setUniPrice(price.toString());
                if(pos.liquidity) {
                    const _uniPrice = BigNumber.from(uniPrice.toString());
                    setLiq1InTokB(pretty((sqrt(_uniPrice.mul(BigNumber.from(10).pow(18))).mul(pos.liquidity)
                        .div(BigNumber.from(10).pow(10))).mul(2).toString()));
                } else {
                    setBalInTokB("0");
                }
            }

        }
        fetchData();
    }, [posManager, depPool]);

    async function openPositionHandler({ token0Amt, token1Amt, liquidity }) {
        console.log("openPositionHandler() >>");
        console.log(token0Amt);
        console.log(token1Amt);
        console.log(liquidity);
        // TODO
        /*const createPosition = await posManager.methods.openPosition(
            token0.address,
            token1.address,
            token0Amt,
            token1Amt,
            liquidity,
            account,  
        ).send({ from: account });
        console.log("createPosition");
        console.log(createPosition);/**/
    }

    function handleLiq1Chng(evt) {
        console.log("handleLiq1Chng() >>");
        console.log(evt);
        const _uniPrice = BigNumber.from(uniPrice.toString());
        if(evt.length > 0 && _uniPrice.gt(constants.Zero)){
            const liq = BigNumber.from(evt.toString());
            setLiq1InTokB(pretty(sqrt(_uniPrice.mul(BigNumber.from(10).pow(18))).mul(liq).mul(2).toString()));
        } else {
            setLiq1InTokB("0");
        }
        //evt.preventDefault();
        //console.log("changeNum() >>");
        //console.log(evt);
        //setLiqInTokB(num.value);
    }

    function handleLiq2Chng(evt) {
        console.log("handleLiq2Chng() >>");
        console.log(evt);
        const _uniPrice = BigNumber.from(uniPrice.toString());
        if(evt.length > 0 && _uniPrice.gt(constants.Zero)){
            const liq = BigNumber.from(evt.toString());
            setLiq2InTokB(pretty(sqrt(_uniPrice.mul(BigNumber.from(10).pow(18))).mul(liq).mul(2).toString()));
        } else {
            setLiq2InTokB("0");
        }
        //evt.preventDefault();
        //console.log("changeNum() >>");
        //console.log(evt);
        //setLiqInTokB(num.value);
    }

    async function repayHandler({ repayLiquidity }) {
        // TODO
    }

    return (
        <>
            <Box borderRadius={'3xl'} bg={'#1d2c52'} boxShadow='dark-lg'>
                <form onSubmit={handleSubmit(openPositionHandler)}>
                    <FormControl p={14}>
                        <Heading
                            color={'#e2e8f0'}
                        >
                            Open
                        </Heading>
                        <FormLabel
                        color={'#e2e8f0'}
                        fontSize={'md'}
                        fontWeight={'semibold'}
                        htmlFor='token0'
                        >
                            Collateral {token0.symbol}
                        </FormLabel>
                        <Input
                            color={'#e2e8f0'}
                            placeholder='amount'
                            color={'#e2e8f0'}
                            id='token0'
                            type='number'
                            {...register('token0Amt')}
                        />
                        <FormLabel
                        color={'#e2e8f0'}
                        mt={5}
                        fontSize={'md'}
                        fontWeight={'semibold'}
                        htmlFor='token1'
                        >
                            Collateral {token1.symbol}
                        </FormLabel>
                        <Input
                            color={'#e2e8f0'}
                            placeholder='amount'
                            color={'#e2e8f0'}
                            id='token1'
                            type='number'
                            {...register('token1Amt')}
                        />
                        <FormLabel
                            color={'#e2e8f0'}
                            fontSize={'md'}
                            fontWeight={'semibold'}
                            mt={5}
                            htmlFor='liquidity'
                        >
                            Liquidity ({liq1InTokB} {token1 ? token1.symbol : "" })
                        </FormLabel>
                        <Input
                            color={'#e2e8f0'}
                            placeholder='amount'
                            color={'#e2e8f0'}
                            id='liquidity'
                            type='number'
                            {...register('liquidity')}
                            onChange={e => handleLiq1Chng(e.target.value)}
                        />
                        <Button
                            mt={10}
                            bgColor='#2563eb'
                            color='#e2e8f0'
                            type='submit'
                        >
                            Submit
                        </Button>
                    </FormControl>
                </form>
                <Heading  as='h5' fontFamily="body" size='md' color={'#e2e8f0'}>Balance: {balInTokB} {token1 ? token1.symbol : ""}</Heading>
                <Heading  as='h5' fontFamily="body" size='md' color={'#e2e8f0'}>Liquidity: {pos.liquidity ? pos.liquidity : 0} </Heading>
                <form onSubmit={handleSubmit2(repayHandler)}>
                    <FormControl p={14} boxShadow='lg' mt={10}>
                        <Heading color={'#e2e8f0'}>Repay</Heading>
                        <FormLabel
                            color={'#e2e8f0'}
                            fontSize={'md'}
                            fontWeight={'semibold'}
                            mt={5}
                            htmlFor='repayLiquidity'
                        >
                            Liquidity ({liq2InTokB} {token1 ? token1.symbol : "" })
                        </FormLabel>
                            <Input
                                id='repayLiquidity'
                                placeholder='amount'
                                color={'#e2e8f0'}
                                type='number'
                                {...register2('repayLiquidity')}
                                onChange={e => handleLiq2Chng(e.target.value)}
                            />
                        <Button
                            my={5}
                            bgColor='#2563eb'
                            color='#e2e8f0'
                            type='submit'
                        >
                            Submit
                        </Button>
                    </FormControl>
                </form>
            </Box>
        </>
    );

}
export default Borrow;