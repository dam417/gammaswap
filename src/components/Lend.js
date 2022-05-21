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

    return (

        /*Lend LP Form */
        <div>
          <Heading> Lend </Heading>  



<>
            <FormControl boxShadow='lg'>
                <Heading size='md'>Balance</Heading>
                <FormLabel htmlFor='token-0'>Token 0</FormLabel>
                <Input placeholder='amount' id='token-0' type='text' />
                <FormLabel mt={5} htmlFor='token-1'>Token 1</FormLabel>
                <Input placeholder='amount' id='token-1' type='text' />
                <Button my={5} colorScheme='blue'>Submit</Button>
            </FormControl>

            <FormControl boxShadow='lg' mt={10}>
                <Heading size='md'>Withdraw</Heading>
                <FormLabel mt={5} htmlFor='withdraw'></FormLabel>
                    <Input id='withdraw' type='text' />
                <Button my={5} colorScheme='blue'>Submit</Button>
            </FormControl>
</>





            
        </div>
    )

}
export default Lend;