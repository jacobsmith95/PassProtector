import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosConfigPost } from "../configs.js"
import { GeneratePW } from "./generate_pw.js"

import axios from 'axios';

export const CreateAccount = () => {

    const [errorMessage, setErrorMessage] = useState(null)
    const [genPW, setGenPW] = useState(null)
    const navigate = useNavigate();

    const createAccountPost = (email, password) => {  

        return new Promise((resolve, reject) => {
    
            // axios.post('https://backend-ngnhr6tt3a-ul.a.run.app/login/', {'email': email, 'password': password}, axiosConfigPost)
            axios.post('http://localhost:8000/create-account/', {'email': email, 'password': password}, axiosConfigPost)
            .then(res => {
                const api_respose = res.data.api_result;
                console.log(api_respose)
                resolve("success")
            })
        })                    
    }
   
    const createAccountHandler = async (email, password) => {
        
        try {           
            await createAccountPost(email, password)
            window.alert("Account created!");
            navigate("/login")
        } catch (error) {
            setErrorMessage(error)               
        }       
    }

    const handleGenPW = () => {
        setGenPW(GeneratePW())
        // if ( genPW ) {
        //     navigator.clipboard.writeText(genPW_copy)
        //     alert("Copied the text: " + genPW);
        // }
    }

    return (
        <div className="page">
        {/* <h3>Create Account</h3> */}
            <div className="inputs">
                <div><input className="input" type="email" id="email_id" size="20" placeholder="email" required/></div>
                <div><input className="input" type="password" id="password_id" size="20" placeholder="password" required minLength={8}/></div>
                <br></br>
                <button className="btn btn-primary btn-lg" onClick={() => createAccountHandler(
                    document.getElementById("email_id").value,
                    document.getElementById("password_id").value
                )}>Create Account</button>
                <br></br>
                {errorMessage ?<div className="error">{errorMessage}</div>: null}
                <br></br>
                <button className="btn btn-primary btn-lg" onClick={() => {handleGenPW()}}>Generate Password</button>
                <br></br>
                <br></br>
                <div>{genPW}</div>
            </div>            
        </div>
     )
}