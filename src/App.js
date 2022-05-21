import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes, Switch, Route} from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './components/Home';
import TabGroup from './components/TabGroup';
import React, { useState, useEffect } from 'react'
import PosManager from './abis/PositionManager.json';
import DepPool from './abis/DepositPool.json';
import Web3 from "web3/dist/web3.min.js";
import truncateEthAddress from 'truncate-eth-address'

function App() {
  const [account, setAccount] = useState("...");
  const [posManager, setPosManager] = useState({});
  const [depPool, setDepPool] = useState({});

  useEffect(() => {
    loadWeb3()
  },[]);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
    if (window.web3) {
      var accounts = await web3.eth.getAccounts();
      setAccount(truncateEthAddress(accounts[0]));
      const networkId = await web3.eth.net.getId();

      console.log("networkId >> " + networkId);
      if(networkId == 3) {
          const _posManager = new web3.eth.Contract(PosManager.abi, "0x76A4AC02A1951FF3d0709DAa2818C5e5D8652573");
          setPosManager(_posManager);
          console.log("posManager >>");
          console.log(_posManager);

          const _depPool = new web3.eth.Contract(DepPool.abi, "0x2841Da8Ce0e19330f2f0E16Fa2129A36eDA5861E");
          setDepPool(_depPool);
          console.log("depPool >>");
          console.log(_depPool);
          const token1Addr = await _depPool.methods.token1().call();
          console.log("token1Addr >> " + token1Addr);
      } else {
          const posMgrNetworkData = PosManager.networks[networkId];
          if (posMgrNetworkData) {
              const _posManager = new web3.eth.Contract(PosManager.abi, posMgrNetworkData.address.toString());
              setPosManager(_posManager);
          }
          const depPoolNetworkData = DepPool.networks[networkId];
          if (depPoolNetworkData) {
              const _depPool = new web3.eth.Contract(DepPool.abi, depPoolNetworkData.address.toString());
              setDepPool(_depPool);
          }
      }
    }

  };

  return (
    <Router>
      <div>
        <Navbar account={account} />
        <div className="App">
          <header className="App-header">
            <Routes>
              <Route exact path={"/"}
                     element={<Home/>}/>
              <Route exact path={"/app"}
                     element={<TabGroup posManager={posManager} depPool={depPool}/>}/>
            </Routes>
          </header>
        </div>
      </div>
    </Router>


  );
}

export default App;
