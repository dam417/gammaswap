import React, { useState, useEffect  } from 'react'
import { Link } from 'react-router-dom'

function Navbar(props) {
    return (
      <div class="nav-bar">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <h1 
            className="navbar-brand col-sm-3 col-md-2 mr-0"
          >
            GammaSwap V0
          </h1>
          
        </nav>
        <div class="wallet">
        {props.account}
        </div>
      </div>
    )
}
export default Navbar