import * as React from 'react'
import {
    Box,
    Flex,
    Button,
    Stack,
    Link as ChakraLink,
    Popover,
    PopoverTrigger,
    PopoverContent,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react';
  
function Navbar(props) {
    const { isOpen, onToggle } = useDisclosure();

    return (
        <Box>
            <Flex
                bg={useColorModeValue('', 'gray.800')}
                color={useColorModeValue('gray.600', 'white')}
                minH={'60px'}
                py={{ base: 2 }}
                px={{ base: 4 }}
                align={'center'}>
                <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
                    <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
                        <DesktopNav />
                    </Flex>
                </Flex>
                <Stack
                    flex={{ base: 1, md: 0 }}
                    justify={'flex-end'}
                    direction={'row'}
                    spacing={6}>
                    <Button
                        display={{ base: 'none', md: 'inline-flex' }}
                        fontSize={'lg'}
                        fontWeight={600}
                        color={'white'}
                        bg={'pink.400'}
                        href={'#'}
                        _hover={{
                        bg: 'pink.300',
                        }}>
                        {props.account !== props.account ? "Connect Wallet" : props.account}
                    </Button>
                </Stack>
            </Flex>
        </Box>
    );
}

const DesktopNav = () => {
    const linkColor = useColorModeValue('gray.600', 'gray.200');
    const linkHoverColor = useColorModeValue('gray.800', 'white');
    const popoverContentBgColor = useColorModeValue('white', 'gray.800');

    return (
        <Stack direction={'row'} spacing={4}>
        {NAV_ITEMS.map((navItem) => (
            <Box key={navItem.label}>
            <Popover trigger={'hover'} placement={'bottom-start'}>
                <PopoverTrigger>
                <ChakraLink
                    p={2}
                    href={navItem.href ?? '#'}
                    fontSize={'lg'}
                    fontWeight={500}
                    color={linkColor}
                    _hover={{
                    textDecoration: 'none',
                    color: linkHoverColor,
                    }}>
                    {navItem.label}
                </ChakraLink>
                </PopoverTrigger>
                {navItem.children && (
                <PopoverContent
                    border={0}
                    boxShadow={'xl'}
                    bg={popoverContentBgColor}
                    p={4}
                    rounded={'xl'}
                    minW={'sm'}>
                    <Stack>
                    {navItem.children.map((child) => (
                        <DesktopSubNav key={child.label} {...child} />
                    ))}
                    </Stack>
                </PopoverContent>
                )}
            </Popover>
            </Box>
        ))}
        </Stack>
    );
};

const NAV_ITEMS = [
    {
        label: 'Home',
        href: '/',
    },
    {
        label: 'About',
        href: '/about',
    },
    {
        label: 'Launch',
        href: '/app',
    },
];

export default Navbar