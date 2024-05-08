import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosConfigPost } from "../configs.js"
import { GeneratePW } from "./generate_pw.js"

import { generateMasterKey, encryptVault } from "./frontend-encryption.js";

import axios from 'axios';

export const CreateAccount = () => {

    const [errorMessage, setErrorMessage] = useState(null)
    const [genPW, setGenPW] = useState(null)
    const navigate = useNavigate();

    const createAccountHandler = (email, password) => {  


        const masterValues = generateMasterKey(email, password)
        const masterHash = masterValues.masterHash
        const masterKey = masterValues.masterKey

        console.log(masterHash)

        const encrypted_vault = encryptVault(masterKey, [])
        console.log(encrypted_vault)
        axios.post('https://backend-ngnhr6tt3a-ul.a.run.app/account-create/', {'email': email, 'hash': masterHash, 'token': "Test token", 'vault': encrypted_vault}, axiosConfigPost)        
        // axios.post('http://localhost:8000/account-create/', {'email': email, 'hash': masterHash, 'token': "Test token", 'vault': encrypted_vault}, axiosConfigPost)
        .then(res => {
            if (res.data.account_create_result === "success") {
                window.alert("Account created!");
                navigate("/login")
            } else {
                setErrorMessage(res.data.account_create_result)  
            }
       })                          
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