import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Heading,
    FormErrorMessage,
    FormHelperText,
} from '@chakra-ui/react'

function Lend({ token0, token1}) {
    // Declare a new state variable, which we'll call "count"
    /*const [tokenA, setTokenA] = useState(0);
     const [tokenB, setTokenB] = useState(0);

     let navigate = useNavigate();

     const routeChange = (id) =>{
     console.log("routeChange >> " + id);
     let path = `/pool/${id}`;
     navigate(path);
     }/**/

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