type NavItems = {
    label: string,
    href: string;
}

const NavItems: Array<NavItems> = [
    //{
    //    label: 'Logo',
    //    href: '#',
    //},
    //{
    //    label: 'About Us',
    //    href: '/aboutus'
    //}
    {
         label: 'Home',
         href: '/',
    },
    // {
    //     label: 'About',
    //     href: '/about',
    // },
    //{
    //     label: 'Launch',
    //     href: '/app',
    //},
    {
         label: 'Need crypto?',
         href: '/transak',
    },
    {
         label: 'Bridge',
         href: '/bridge',
    },
    {
        label: 'Blog',
        href: 'https://medium.com/gammaswap-labs',
    }
];

export default NavItems