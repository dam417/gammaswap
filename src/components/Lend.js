import React, { useEffect, useState, useCallback } from 'react'
import { useForm, r} from 'react-hook-form';
import * as Web3 from 'web3/dist/web3.min.js'
import { constants } from 'ethers';
import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Heading,
    Box
} from '@chakra-ui/react';

const ZEROMIN = 0;

function Lend({ account, depPool, token0, token1}) {
    const [liquidityAmt, setLiquidityAmt] = useState(0);
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            token0Amt: '0',
            token1Amt: '0',
        }
    });
    const { register: register2, handleSubmit: handleSubmit2 } = useForm({
        defaultValues: {
            balance: '0', 
        }
    });

    async function deposit({ token0Amt, token1Amt}) {
        if (checkAllowance(account, token0) <= 0) {
            await approve(token0, depPool._address)
        }

        if (checkAllowance(account, token1) <= 0) {
            await approve(token1, depPool._address)
        }

        const addLiquidity = await depPool
        .methods
        .addLiquidity(
            Web3.utils.toWei(token0Amt, "ether"),
            Web3.utils.toWei(token1Amt, "ether"),
            ZEROMIN,
            ZEROMIN,
            account
        ).send({ from: account })
        .then(res => {
            alert("Liquidity has been Deposited.")
            
        })
        .catch(err => {
            console.error(err)
        })


    }

    async function withdraw({ balance }) {
        await approveWithdraw(depPool, depPool._address)

        const removeLiquidity = await depPool
        .methods
        .removeLiquidity(
            Web3.utils.toWei(balance, "ether"),
            ZEROMIN,
            ZEROMIN,
            account
        )
        .send({ from: account })
        .then((res) => {
            console.log(res)
            return res
        })
        .catch(err => {
            console.error(err)
        })
    }

    async function approve(fromToken, toAddr) {
        console.log(fromToken);
        const res = await fromToken.contract.methods.approve(toAddr, constants.MaxUint256).send({ from: account });
        console.log("res >>");
        console.log(res);
    }

    async function approveWithdraw(depPool, depPoolAddr) {
        console.log(depPool);
        const res = await depPool.methods.approve(depPoolAddr, constants.MaxUint256.toString()).send({ from: account });
        console.log("withdraw res >>");
        console.log(res);
    }

    async function checkAllowance(account, token) {
        console.log("checking allowance...")
        if (token.symbol) console.log(token.symbol)
        const allowedAmt = await token
        .contract
        .methods
        .allowance(account, depPool._address)
        .call()
        .then(res => {
            console.log(res)
            return res
        })
        .catch(err => {
            console.log("IM HERE")
            console.error(err)
        })
    }

    async function checkWithdrawAllowance(account, _depPool) {
        const allowedAmt = await _depPool
        .methods
        .allowance(account, depPool._address)
        .call()
        .then(res => {
            console.log(res)
            return res
        })
        .catch(err => {
            console.log("IM HERE")
            console.error(err)
        })
    }


    return (
        /*Lend LP Form */
        <>
            <Box borderRadius={'3xl'} bg={'#1d2c52'} boxShadow='dark-lg'>
                <form onSubmit={handleSubmit(deposit)}>
                    <FormControl p={14} boxShadow='lg'>
                        <Heading color={'#e2e8f0'}>Lend</Heading>
                        <Heading
                        color={'#e2e8f0'}
                        mt={3}
                        size='md'>Balance</Heading>
                        <FormLabel
                            color={'#e2e8f0'}
                            fontSize={'md'}
                            fontWeight={'semibold'}
                            htmlFor='token0'
                        >
                            {token0.symbol}
                        </FormLabel>
                        <Input
                            placeholder='amount'
                            color={'#e2e8f0'}
                            id='token0'
                            type='number'
                            {...register('token0Amt')}
                        />
                        <FormLabel
                            color={'#e2e8f0'}
                            fontSize={'md'}
                            fontWeight={'semibold'}
                            mt={5}
                            htmlFor='token1'
                        >
                            {token1.symbol}
                        </FormLabel>
                        <Input
                            placeholder='amount'
                            color={'#e2e8f0'}
                            id='token1'
                            type='number'
                            {...register('token1Amt')}
                        />
                        <Button type='submit' onClick={() => {
                            reset()
                        }}>Reset</Button>
                        <Button
                            my={5}
                            colorScheme='blue'
                            type='submit'
                        >
                            Submit
                        </Button>
                    </FormControl>
                </form>
                <form onSubmit={handleSubmit2(withdraw)}>
                    <FormControl p={14}>
                        <Heading color={'#e2e8f0'}>Withdraw</Heading>
                        <FormLabel
                            color={'#e2e8f0'}
                            fontSize={'md'}
                            fontWeight={'semibold'}                        
                            mt={5}
                            htmlFor='balance'
                        >
                            Balance
                        </FormLabel>
                            <Input
                                id='balance'
                                color={'#e2e8f0'}
                                type='number'
                                {...register2('balance')}
                            />
                        <Button
                            my={5}
                            colorScheme='blue'
                            type='submit'
                        >
                            Submit
                        </Button>
                    </FormControl>
                </form>
            </Box>
        </>
    )
}
export default Lend;