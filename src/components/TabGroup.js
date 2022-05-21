import * as React from 'react';
import Borrow from './Borrow';
import Lend from './Lend';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

function TabGroup(props) {
    return (
        <Tabs variant='soft-rounded' colorScheme='green'>
            <TabList>
                <Tab>Lend</Tab>
                <Tab>Borrow</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Lend
                        depPool={props.depPool}
                        account={props.account}
                        token0={props.token0}
                        token1={props.token1} 
                    />
                </TabPanel>
                <TabPanel>
                    <Borrow
                        posManager={props.posManager}
                        account={props.account}
                        token0={props.token0}
                        token1={props.token1}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    )
}
export default TabGroup
