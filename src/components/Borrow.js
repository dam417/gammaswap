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
    const [ liqInTokB, setLiqInTokB] = useState("");
    const [value, setValue] = useState("");
    const { register, handleSubmit } = useForm();
    const { register: register2, handleSubmit: handleSubmit2 } = useForm();


    useEffect(() => {
        async function fetchData() {
            console.log("Borrow.fetchData() >>");
            if(posManager && posManager.methods) {
                const positionCount = await posManager.methods.positionCountByOwner(account).call();
                console.log("positionCount >>");
                console.log(positionCount);
                console.log(posManager);
                const positions = await posManager.methods.positionsByOwner(account).call();
                console.log("positions >>");
                console.log(positions);
            }

        }
        fetchData();
    }, [posManager]);

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

    function handleChng(evt) {
        console.log("handleChng() >>");
        console.log(evt);
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
                            Liquidity ({token1 ? token1.symbol : "" })
                        </FormLabel>
                        <Input
                            color={'#e2e8f0'}
                            placeholder='amount'
                            id='liquidity'
                            type='number'
                            onChange={e => handleChng(e.target.value)}
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
                <Heading  as='h5' fontFamily="body" size='md' color={'#e2e8f0'}>Balance: 0 {token1 ? token1.symbol : ""}</Heading>
                <Heading  as='h5' fontFamily="body" size='md' color={'#e2e8f0'}>Liquidity: 0 </Heading>
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