import * as React from 'react';

const CrossChain = () => {
    return (
        <Box borderRadius={'3xl'} bg={'#1d2c52'} boxShadow='dark-lg'>
            <FormControl p={14} boxShadow='lg'>
                <Heading color={'#e2e8f0'} marginBottom={'25px'}>Cross Chain Bridge</Heading>
                <FormLabel
                    color={'#e2e8f0'}
                    fontSize={'md'}
                    fontWeight={'semibold'}
                    htmlFor='token0'
                >
                    Source Bridge
                </FormLabel>
                <Input
                    placeholder='chain'
                    color={'#e2e8f0'}
                    id='token0'
                    type='text'
                />
                <FormLabel
                    color={'#e2e8f0'}
                    fontSize={'md'}
                    fontWeight={'semibold'}
                    mt={5}
                    htmlFor='token1'
                >
                    Destination Bridge
                </FormLabel>
                <Input
                    placeholder='chain'
                    color={'#e2e8f0'}
                    id='token1'
                    type='text'
                />
                <Button
                    my={5}
                    colorScheme='blue'
                    type='submit'
                >
                    Swap
                </Button>
            </FormControl>
        </Box>
    )
}

export default CrossChain