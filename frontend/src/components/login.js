import React, { useState } from "react";
import axios from 'axios';
import { deployTarget, axiosConfigPost } from "../configs.js"
import { generateMasterKey } from "./frontend-encryption.js";
import { AuthObject } from "../auth/authWrapper.js";

export const Login = () => {

    const { user, setUser, setEmail, setPassword, setMasterKey, setMasterHash, GetVault } = AuthObject(); 

    const loginHandler = (email, password) => {  

        const masterValues = generateMasterKey(email, password)
        const masterHash = masterValues.masterHash
        const masterKey = masterValues.masterKey
        console.log(masterHash)
    
        setEmail(email)
        setPassword(password)
        setMasterKey(masterKey)
        setMasterHash(masterHash)  

        axios.post(`${deployTarget}/login/`, {'hash': masterHash}, axiosConfigPost)
        .then(res => {
            if (res.data.login_result === "success") {  
                showMFA(masterHash, masterKey)
            } else {
                window.alert(res.data.login_result)
            }
        });
        
    }

   const MFAHandler = (formObject, props) => {
        axios.post(`${deployTarget}/mfa-login/`, {'hash': props.masterHash, 'code': formObject.mfa_code}, axiosConfigPost)
        .then(res => {
            if (res.data.account_auth_result === "success") {
                window.alert("User verified");
                GetVault(props.masterHash, props.masterKey)
                setUser({...user, isAuthenticated: true})
            } else {
                window.alert("MFA code is incorrect");
            }
        })
    }

    const showMFA = (masterHash, masterKey) => {
        setContent(< MFAForm MFAHandler={MFAHandler} masterHash={masterHash} masterKey={masterKey} />)
    }
    
    const [content, setContent] = useState(< LoginForm showMFA={showMFA} loginHandler={loginHandler} />)
    
    return (
        <div className="container my-5">
            { content }
        </div>
    )

}

const LoginForm = (props) => {

    return (
        <div className="page">
            <div className="inputs">
                <div><input className="input" type="email" id="email_id" size="20" placeholder="email" required/></div>
                <div><input className="input" type="password" id="password_id" size="20" placeholder="password" required minLength={8}/></div>
                <br></br>
                <button className="btn btn-primary btn-lg" onClick={() => props.loginHandler(
                document.getElementById("email_id").value,
                document.getElementById("password_id").value
                )}>Login</button>
                {/* {errorMessage ?<div className="card bg-danger text-white card_loc">{errorMessage}</div>: null} */}
            </div>
        </div>
    )

}

const MFAForm = (props) => {

    const handleSubmit = (event, props) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const formObject = Object.fromEntries(formData.entries())
        props.MFAHandler(formObject, props)
        
    }

    return (
    <>
    <div className="row">
    <div className="col-lg-6 mx-auto">

    <form onSubmit={(event) => handleSubmit(event, props)}>
        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">MFA Code</label>
            <div className="col-sm-4">
            <input className="form-control"
                name = "mfa_code"
            ></input>
            </div>
        </div>
        <div>
        <button type="submit" className="btn btn-primary btn-lg me-2">Submit</button>
        </div>
        </form>
    </div> 
    </div>
    </>
    )
}
