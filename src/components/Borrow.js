import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
//import * as Web3 from "web3/dist/web3.min.js";
//import truncateEthAddress from 'truncate-eth-address';
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
    // Declare a new state variable, which we'll call "count"
    // const [tokenA, setTokenA] = useState(0);
    // const [tokenB, setTokenB] = useState(0);

    // let navigate = useNavigate();

    // const routeChange = (id) =>{
    // console.log("routeChange >> " + id);
    // let path = `/pool/${id}`;
    // navigate(path);
    // }
    const { register, handleSubmit } = useForm();
    const { register: register2, handleSubmit: handleSubmit2 } = useForm();

    useEffect(() => {
        //loadAddresses()
    }, []);/**/

    /*async function loadAddresses() {
        if (window.web3) {
            const accounts = await web3.eth.getAccounts();
            setToAddr(truncateEthAddress(accounts[0]));
        }
    }/**/

    async function openPositionHandler({ token0Amt, token1Amt, liquidity }) {
        const createPosition = await posManager.methods.openPosition(
            token0.address,
            token1.address,
            token0Amt,
            token1Amt,
            liquidity,
            account,
        ).send({ from: account });
    }

    async function repayHandler({ repayLiquidity }) {
        // TODO
        console.log(repayLiquidity)
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