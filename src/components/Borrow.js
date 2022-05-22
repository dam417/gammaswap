import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import * as Web3 from "web3/dist/web3.min.js";
import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Heading,
    Box
} from '@chakra-ui/react'

function Borrow({ account, token0, token1, posManager }) {
    const { register, handleSubmit } = useForm();
    const { register: register2, handleSubmit: handleSubmit2 } = useForm();

    async function openPositionHandler({ token0Amt, token1Amt, liquidity }) {
        // TODO

        // const createPosition = await posManager.methods.openPosition(
        //     token0.address,
        //     token1.address,
        //     token0Amt,
        //     token1Amt,
        //     liquidity,
        //     account,  
        // ).call();
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
                            {token0.symbol} Collateral
                        </FormLabel>
                        <Input
                            color={'#e2e8f0'}
                            placeholder='amount'
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
                            {token1.symbol} Collateral
                        </FormLabel>
                        <Input
                            color={'#e2e8f0'}
                            placeholder='amount'
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
                            Liquidity
                        </FormLabel>
                        <Input
                            color={'#e2e8f0'}
                            placeholder='amount'
                            id='liquidity'
                            type='number'
                            {...register('liquidity')}
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
                            Liquidity
                        </FormLabel>
                            <Input
                                id='repayLiquidity'
                                placeholder='amount'
                                type='number' 
                                {...register2('repayLiquidity')}
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