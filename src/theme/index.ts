import { 
    extendTheme,
    theme as base,
    withDefaultColorScheme,
    withDefaultVariant
} from '@chakra-ui/react';

const theme = extendTheme({
    colors: {
        brand: {

        }
    },
    fonts: {
        heading: `Inter, ${base.fonts?.heading}`,
        body: `Inter, ${base.fonts?.body}`,
    },
    styles: {
        global: () => ({
            body: {
                bg: "#0f172a",
            }
        })
    },
    // withDefaultColorScheme({
    //     colorScheme: 'brand',
    //     components: [],
    // }),
    // withDefaultVariant({
    //     variant: 'filled',
    //     components: [],
    // })
})

export default theme