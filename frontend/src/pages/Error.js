import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../css/css.css';
import Header from "./includes/header"; // Ensure the CSS file is imported

const Error = () => {


    return (<div>
<Header/>
        <h1>404 Error: Page Doesn't Exist</h1>
    </div>)
};

export default Error;
