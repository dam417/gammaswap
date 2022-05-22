import * as React from 'react';
import {
    Container,
    Stack,
    Heading,
    Text
} from '@chakra-ui/react';

function About() {
    return (
        <Container>
            <Heading
                    as="h1"
                    fontFamily="body"
                    color="#e2e8f0"
                    fontSize="6xl"
                >
                    What makes GammaSwap so Great?
            </Heading>
            <Stack>
                <Text
                    as="p"
                    fontFamily="body"
                    color="#94a3b8"
                    fontSize="2xl"
                >
                Apparently we had reached a great height in the atmosphere, for the
                sky was a dead black, and the stars had ceased to twinkle. By the same
                illusion which lifts the horizon of the sea to the level of the
                spectator on a hillside, the sable cloud beneath was dished out, and
                the car seemed to float in the middle of an immense dark sphere, whose
                upper half was strewn with silver. Looking down into the dark gulf
                below, I could see a ruddy light streaming through a rift in the
                clouds.
                </Text>
            </Stack>
        </Container>
    )
}

export default About