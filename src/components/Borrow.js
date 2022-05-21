import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import * as Web3 from "web3/dist/web3.min.js";
import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Heading,
    FormErrorMessage,
    FormHelperText,
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
        //     toAddr,  
        // ).call();
    }

    async function repayHandler({ repayLiquidity }) {
        // TODO
    }

    return (
        <>
            <form onSubmit={handleSubmit(openPositionHandler)}>
                <FormControl boxShadow='lg'>
                    <Heading>Open</Heading>
                    <FormLabel htmlFor='token0'>{token0.symbol}</FormLabel>
                    <Input
                        placeholder='amount'
                        id='token0'
                        type='number'
                        {...register('token0Amt')}
                    />
                    <FormLabel mt={5} htmlFor='token1'>{token1.symbol}</FormLabel>
                    <Input
                        placeholder='amount'
                        id='token1'
                        type='number'
                        {...register('token1Amt')}
                    />
                    <FormLabel mt={5} htmlFor='liquidity'>Liquidity</FormLabel>
                    <Input
                        placeholder='amount'
                        id='liquidity'
                        type='number'
                        {...register('liquidity')}
                    />
                    <Button my={5} colorScheme='blue' type='submit'>Submit</Button>
                </FormControl>
            </form>
            <form onSubmit={handleSubmit2(repayHandler)}>
                <FormControl boxShadow='lg' mt={10}>
                    <Heading size='md'>Repay</Heading>
                    <FormLabel
                        mt={5}
                        htmlFor='repayLiquidity'
                    >
                        Liquidity
                    </FormLabel>
                        <Input
                            id='repayLiquidity'
                            type='number' 
                            {...register2('repayLiquidity')}
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
        </>
    );

}
export default Borrow;