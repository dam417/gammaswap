/**
 * Created by danielalcarraz on 5/20/22.
 */
import React, { useState } from 'react'
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

function Lend(props) {
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

    function deposit() {
        console.log("deposit() >> ");
        console.log("token0Amt >>");
        console.log(token0Amt.value);
        console.log("token1Amt >>");
        console.log(token1Amt.value);
    }

    function withdraw() {
        console.log("withdraw() >> ");
        console.log("liquidityAmt >>");
        console.log(liquidityAmt.value);
    }

    return (
        /*Lend LP Form */
        <div>
          <Heading> Lend </Heading>
            <FormControl boxShadow='lg'>
                <Heading size='md'>Balance</Heading>
                <FormLabel htmlFor='token-0'>{props.token0.symbol}</FormLabel>
                <Input placeholder='amount' id='token-0' type='text'
                       ref={(input) => {
                           setToken0Amt(input)
                       }} />
                <FormLabel mt={5} htmlFor='token-1'>{props.token1.symbol}</FormLabel>
                <Input placeholder='amount' id='token-1' type='text'
                       ref={(input) => {
                           setToken1Amt(input)
                       }}  />
                <Button my={5} colorScheme='blue' onClick={deposit}>Submit</Button>
            </FormControl>

            <FormControl boxShadow='lg' mt={10}>
                <Heading size='md'>Withdraw</Heading>
                <FormLabel mt={5} htmlFor='withdraw'></FormLabel>
                    <Input id='withdraw' type='text'
                           ref={(input) => {
                               setLiquidityAmt(input)
                           }} />
                <Button my={5} colorScheme='blue' onClick={withdraw}>Submit</Button>
            </FormControl>
        </div>
    )

}
export default Lend;