import React, { useState, useEffect } from "react";
import axios from 'axios';
import { deployTarget, axiosConfigPost } from "../configs.js"
import { generateMasterKey } from "./frontend-encryption.js";
import { AuthObject } from "../auth/authWrapper.js";
import LoginIcon from '@mui/icons-material/Login';

export const Login = () => {

    const {  user, setUser, setEmail, setPassword, setToken, setMasterKey, setMasterHash, GetVault  } = AuthObject(); 

    const updateStateVars = (email, password, token, masterKey, masterHash ) => {  

        setEmail(email)
        setPassword(password)
        setToken(token)
        setMasterKey(masterKey)
        setMasterHash(masterHash)  

        // let userNew = {
        //     ...user, 
        //     email: email,
        //     password: password,
        //     token: token,
        //     masterKey: masterKey,
        //     masterHash: masterHash
        // }
        // setUser(userNew)
   }

    const loginHandler = (email, password) => {  

        const masterValues = generateMasterKey(email, password)
        console.log('Login hash: ' + masterValues.masterHash)
      
        axios.post(`${deployTarget}/login/`, {'hash': masterValues.masterHash}, axiosConfigPost)
        .then(res => {
            if (res.data.login_result === "success") { 
                updateStateVars(email, password, res.data.token, masterValues.masterKey, masterValues.masterHash)             
                showMFA(masterValues.masterHash, masterValues.masterKey, res.data.token)
            } else {
                window.alert(res.data.login_result)
                showLoginForm()
            }
        });
        
    }

   const MFAHandler = (formObject, props) => {
        
        axios.post(`${deployTarget}/mfa-login/`, {'hash': props.masterHash, 'code': formObject.mfa_code, 'token': props.token }, axiosConfigPost)
        .then(res => {
            if (res.data.account_auth_result === "success") {
                window.alert("User verified");
                setUser({...user, isAuthenticated: true})               
                GetVault(props.masterHash, props.masterKey, props.token)
            } else if (res.data.account_auth_result === "MFA code is incorrect") {
                window.alert("MFA code is incorrect");
                document.getElementById("mfa_form").reset()
            } else if (res.data.account_auth_result === "Invalid token") {
                window.alert("Invalid token");
                showLoginForm()             
            } else {
                window.alert(res.data.account_auth_result);
            }
        })
    }

    const showMFA = (masterHash, masterKey, token) => {
        setContent(< MFAForm MFAHandler={MFAHandler} masterHash={masterHash} masterKey={masterKey} token={token} />)
    }

    const showLoginForm = () => {
        setContent(< LoginForm showMFA={showMFA} loginHandler={loginHandler} />)
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
                <button className="btn btn-primary btn-lg" title="Login" onClick={() => props.loginHandler(
                document.getElementById("email_id").value,
                document.getElementById("password_id").value
                )}>Login <LoginIcon /></button>
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

    <form id="mfa_form" onSubmit={(event) => handleSubmit(event, props)}>
        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">MFA Code</label>
            <div className="col-sm-4">
            <input className="form-control"
                name = "mfa_code"
            ></input>
            </div>
        </div>
        <div>
        <button type="submit" className="btn btn-primary btn-lg me-2" title="Submit">Submit <LoginIcon /></button>
        </div>
        </form>
    </div> 
    </div>
    </>
    )
}
