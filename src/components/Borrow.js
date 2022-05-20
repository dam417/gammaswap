/**
 * Created by danielalcarraz on 5/20/22.
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function Borrow(props) {
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
        <div>
            Borrow LPs Form
        </div>
    );

}
export default Borrow;