import React, { useState, useEffect  } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components';
const Button = styled.button`
            background-color: black;
            color: white;
            font-size: 20px;
            position: absolute;
            padding: 10px 60px;
            border-radius: 5px;
            margin: 10px 0px;
            margin-left: 500px;
            cursor: pointer;
            &:disabled {
            color: grey;
            opacity: 0.7;
            cursor: default;
        }
            `;
const homeLink = {
    cursor: 'pointer'
};

function Navbar(props) {


    let navigate = useNavigate();

    let loc = useLocation();
    console.log("location >> ");
    console.log(loc);

    useEffect(() => {
        console.log("location >> ");
        console.log(loc);
    },[]);

    const routeChange = (path) =>{
        //console.log("routeChange >> " + id);
        //let path = `/app/${id}`;
        //let path = `/app`;
        navigate(path);
    }

    return (
      <div className="nav-bar">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <h1 
            className="navbar-brand col-sm-3 col-md-2 mr-0"
          >
              <a style={homeLink} onClick={() => { routeChange('/')}}>
                GammaSwap V0
              </a>
          </h1>
        </nav>
          <div className="wallet">
              {props.account}
          </div>
          {loc.pathname == '/' ?
              <a onClick={() => {
                  routeChange('/app')
              }}>
                  <Button>
                      Launch App
                  </Button>
              </a> : <div></div>
          }
      </div>
    )
}
export default Navbar