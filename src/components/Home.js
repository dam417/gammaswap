import { Heading, Container, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function Home(props) {
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
        <Container>
            <Stack>
                <Heading>GammaSwap</Heading>
                <Text>
                Leveraging Uniswap for Better Pool Performance.
                </Text>
            </Stack>
        </Container>
    )

}
export default Home;