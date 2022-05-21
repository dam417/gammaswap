/**
 * Created by danielalcarraz on 5/20/22.
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import Borrow from './Borrow';
import Lend from './Lend';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

// const Tab = styled.button`
//   font-size: 20px;
//   padding: 10px 60px;
//   cursor: pointer;
//   opacity: 0.6;
//   background: white;
//   border: 0;
//   outline: 0;
//   ${({ active }) =>
// active &&
// `
//     border-bottom: 2px solid black;
//     opacity: 1;
//   `}
// `;
// const ButtonGroup = styled.div`
//   display: flex;
// `;
// const types = ['Lend', 'Borrow'];

function TabGroup(props) {
    // const [active, setActive] = useState(types[0]);
    return (
        <Tabs variant='soft-rounded' colorScheme='green'>
            <TabList>
                <Tab>Lend</Tab>
                <Tab>Borrow</Tab>
            </TabList>
            <TabPanel>
                <Lend depPool={props.depPool} account={props.account} token0={props.token0} token1={props.token1} />
            </TabPanel>
            <TabPanel>
                <Borrow posManager={props.posManager} account={props.account} token0={props.token0} token1={props.token1}/>
            </TabPanel>
        </Tabs>
        // <>
        // <ButtonGroup>
        //     {types.map(type => (
        //         <Tab
        //             key={type}
        //             active={active === type}
        //             onClick={() => setActive(type)}
        //         >
        //             {type}
        //         </Tab>
        //     ))}
        // </ButtonGroup>
        // <p />
        // {active == 'Lend' ? <Lend/> : <Borrow/>}
        // </>
    );
}
export default TabGroup
// Usage
//<TabGroup/>