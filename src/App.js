import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes, Switch, Route} from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './components/Home';
import TabGroup from './components/TabGroup';
import React, { useState, useEffect  } from 'react'
import Web3 from "web3/dist/web3.min.js";
import truncateEthAddress from 'truncate-eth-address'

function App() {
  const [account, setAccount] = useState("default account");

  useEffect(() => {
    loadWeb3()
  });

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
      var accounts = await web3.eth.getAccounts()
      setAccount(truncateEthAddress(accounts[0]))
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
                     element={<TabGroup/>}/>
            </Routes>
          </header>
        </div>
      </div>
    </Router>


  );
}

export default App;
