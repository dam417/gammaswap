import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Heading,
} from '@chakra-ui/react';
import { constants } from 'ethers';

function Lend({ account, depPool, token0, token1}) {
    const [token0Amt, setToken0Amt] = useState(0);
    const [token1Amt, setToken1Amt] = useState(0);
    const [liquidityAmt, setLiquidityAmt] = useState(0);
    const { register, handleSubmit } = useForm();
    const { register: register2, handleSubmit: handleSubmit2 } = useForm();

    async function deposit({ token0, token1 }) {
        // TODO
    }

    async function withdraw({ balance }) {
        // TODO
    }

    async function approve(_token) {
        console.log("approve() >> " + _token.symbol);
        const res = await _token.contract.methods.approve(depPool._address, constants.MaxUint256).send({ from: account});
        console.log("res >>");
        console.log(res);
    }


    return (
        /*Lend LP Form */
        <>
            <form onSubmit={handleSubmit(deposit)}>
                <Heading>Lend</Heading>
                <FormControl boxShadow='lg'>
                    <Heading size='md'>Balance</Heading>
                    <FormLabel htmlFor='token0'>{token0.symbol}</FormLabel>
                    <Input
                        placeholder='amount'
                        id='token0'
                        type='text'
                        {...register('token0')}
                    />
                    <FormLabel
                        mt={5}
                        htmlFor='token1'
                    >
                        {token1.symbol}
                    </FormLabel>
                    <Input
                        placeholder='amount'
                        id='token1'
                        type='text'
                        {...register('token1')}
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
            <form onSubmit={handleSubmit2(withdraw)}>
                <FormControl boxShadow='lg' mt={10}>
                    <Heading size='md'>Withdraw</Heading>
                    <FormLabel
                    mt={5}
                    htmlFor='balance'
                    >
                        Balance
                    </FormLabel>
                        <Input
                            id='balance'
                            type='text'
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
        </>
    )
}
export default Lend;