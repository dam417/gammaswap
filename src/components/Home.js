/**
 * Created by danielalcarraz on 5/20/22.
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import logo from '../logo.svg';

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
        <div id="content">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                Learn React
            </a>
        </div>
    )

}
export default Home;