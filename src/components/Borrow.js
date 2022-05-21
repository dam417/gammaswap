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

function Borrow() {
    // Declare a new state variable, which we'll call "count"
    /*const [tokenA, setTokenA] = useState(0);
     const [tokenB, setTokenB] = useState(0);

     let navigate = useNavigate();

     const routeChange = (id) =>{
     console.log("routeChange >> " + id);
     let path = `/pool/${id}`;
     navigate(path);
     }/**/

    return (
        <>
            <FormControl boxShadow='lg'>
                <Heading size='md'>Open</Heading>
                <FormLabel htmlFor='token-0'>Token 0</FormLabel>
                <Input placeholder='amount' id='token-0' type='text' />
                <FormLabel mt={5} htmlFor='token-1'>Token 1</FormLabel>
                <Input placeholder='amount' id='token-1' type='text' />
                <FormLabel mt={5} htmlFor='liquidity'>Liquidity</FormLabel>
                <Input placeholder='amount' id='liquidity' type='text' />
                <Button my={5} colorScheme='blue'>Submit</Button>
            </FormControl>
            <FormControl boxShadow='lg' mt={10}>
                <Heading size='md'>Repay</Heading>
                <FormLabel mt={5} htmlFor='liquidity'>Liquidity</FormLabel>
                    <Input id='liquidity' type='text' />
                <Button my={5} colorScheme='blue'>Submit</Button>
            </FormControl>
        </>
    );

}
export default Borrow;