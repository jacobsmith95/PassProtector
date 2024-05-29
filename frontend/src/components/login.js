import React, { useState } from "react";
import axios from 'axios';
import { deployTarget, axiosConfigPost } from "../configs.js"
import { generateMasterKey } from "./frontend-encryption.js";
import { AuthObject } from "../auth/authWrapper.js";
import LoginIcon from '@mui/icons-material/Login';

/*
How this works:
1. User enters desired username and password.
2. POST request sent to /login
3. If the response is 'success', MFA is presented.
4. User enters the active code from their phone into the MFA code input.
5. POST request sent to /mfa-login with MFA code and token.
6. If the token doesn't match, reroute to login. 
    If the MFA code isn't correct, the user is prompted to try again. 
    If both match, set the state variables used throughout the app, 
    /get-vault is called and the user is rerouted to /vault. 
*/

export const Login = () => {

    const {  user, setUser, setEmail, setPassword, setToken, setMasterKey, setMasterHash, GetVault  } = AuthObject(); 

    // Set these in authWrapper so they can be used throughout the app. 
    const updateStateVars = (email, password, token, masterKey, masterHash ) => {  

        setEmail(email)
        setPassword(password)
        setToken(token)
        setMasterKey(masterKey)
        setMasterHash(masterHash)  
   }

    const loginHandler = (email, password) => {  

        if (!email || !password) {
            window.alert("Items are missing!")
            return
        }

        const masterValues = generateMasterKey(email, password)
        console.log('Login hash: ' + masterValues.masterHash)
      
        // Pass parameters to showMFA because a rerender wasn't performed yet so the 
        //  state variables are not initialized yet. 
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
        
        if (!formObject.mfa_code) {
            window.alert("Please enter a value")
            return
        } else if (formObject.mfa_code.length < 6) {
            window.alert("Please enter 6 digits")
            return
        }

        // Pass parameters to GetVault because a rerender wasn't performed yet so the 
        //  state variables are not initialized yet. 
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
                window.alert("User session timed-out");
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
            </div>
            <div className="container w-50 fs-5 mt-5 ml-5">
                <div className="text-left">- Enter your email and password then select "Login".</div>
                <div className="text-left">- After login, you will need your authentication app to continue.</div>
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
            <label className="col-sm-4 text-right">MFA Code:</label>
            <div className="col-sm-4">
            <input className="form-control"
                name = "mfa_code"
            ></input>
            </div>
        </div>
        <div>
            <button type="submit" className="btn btn-primary btn-lg mt-4" title="Submit">Submit <LoginIcon /></button>
        </div>
        </form>
    </div> 
    </div>
    <div className="container w-50 fs-5 mt-5">
        <div className="text-left">- Enter the 6 digit code from your authentication app then select "Submit".</div>
    </div>
    </>
    )
}
