import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCode } from 'react-qrcode-logo';
import axios from 'axios';
import { deployTarget, axiosConfigPost } from "../configs.js"
import { generateMasterKey, encryptVault } from "./frontend-encryption.js";
import { GeneratePW } from "./generate_pw.js"

/*
How this works:
1. User enters desired username and password.
2. POST request sent to /account-create.
3. If the response is 'success', MFA is presented with the QR link sent by the backend.
4. User scans the QR image using an app on their phone and enters the active code into the MFA input.
5. POST request sent to /auth-create with MFA code and token.
6. If the token doesn't match, reroute to login. 
    If the MFA code isn't correct, the user is prompted to try again. 
    If both match, the user is added to the databse and rerouted to /login. 
*/

export const CreateAccount = () => {

    const navigate = useNavigate();

    const createAccountHandler = (email, password) => {  

        if (!email || !password) {
            window.alert("Items are missing!")
            return
        }
        
        const masterValues = generateMasterKey(email, password)
        const masterHash = masterValues.masterHash
        const masterKey = masterValues.masterKey
        console.log('Create user hash:' + masterHash)

        // Pass an empty array so /vault will render with a blank vault. 
        const encrypted_vault = encryptVault(masterKey, [])

        axios.post(`${deployTarget}/account-create/`, {'email': email, 'hash': masterHash, 'token': "AccountCreateTestToken", 'vault': encrypted_vault}, axiosConfigPost)
        .then(res => {
            if (res.data.account_create_result === "success") {
                const qr_link = res.data.qr_link
                showMFA(qr_link, masterHash)
            } else {
                window.alert(res.data.account_create_result);
            }
       })                          
    }

   const MFAHandler = (formObject, props) => {

        if (!formObject.mfa_code) {
            window.alert("Please enter a value")
            return
        } else if (formObject.mfa_code.length < 6) {
            window.alert("Please enter 6 digits")
            return
        }

        axios.post(`${deployTarget}/auth-create/`, {'hash': props.masterHash, 'code': formObject.mfa_code}, axiosConfigPost)
        .then(res => {
            if (res.data.account_auth_result === "success") {
                window.alert("Account created!");
                navigate("/login")
            } else {
                window.alert(res.data.account_auth_result);
                document.getElementById("mfa_form").reset()
            }
        })
   }

    const handleGenPW = () => {
        const pw = GeneratePW()
        navigator.clipboard.writeText(pw);
        alert('Copied to clipboard:\n\n' + pw);
    }

    // Dynamically render the content of either AccountCreateForm or MFAForm based on user selections. 
    const showAccountCreateForm = () => {
        setContent(< AccountCreateForm showMFA={showMFA} createAccountHandler={createAccountHandler} handleGenPW={handleGenPW}/>)
    }

    const showMFA = (qr_link, masterHash) => {
        setContent(< MFAForm showAccountCreateForm={showAccountCreateForm} MFAHandler={MFAHandler} qr_link={qr_link} masterHash={masterHash} />)
    }
    
    // Default is AccountCreateForm.
    const [content, setContent] = useState(< AccountCreateForm showMFA={showMFA} createAccountHandler={createAccountHandler} handleGenPW={handleGenPW} />)
    
    return (
        <div className="container my-5">
            { content }
        </div>
    )
}

const AccountCreateForm = (props) => {

    return (

        <div className="page">
            <div className="inputs">
                <div><input className="input" type="email" id="email_id" size="20" placeholder="email" required/></div>
                <div><input className="input" type="password" id="password_id" size="20" placeholder="password" required minLength={8}/></div>
                <br></br>
                <button className="btn btn-primary btn-lg" onClick={() => props.createAccountHandler(
                    document.getElementById("email_id").value,
                    document.getElementById("password_id").value
                )}>Create Account</button>

                <div className="container w-50 fs-5 my-5">
                    <div className="text-left">- Enter your email and password then select "Create Account".</div>
                    <div className="text-left">- You will need your authentication app to continue.</div>
                </div>

                <hr className="mt-4 mb-3 hr-len"/>
                <button className="btn btn-outline-primary btn-lg mt-5" onClick={() => {props.handleGenPW()}}>Generate Password</button>
                <div className="container w-50 fs-5 mt-5">
                    <div className="text-left">- Once you select "Generate Password", a password is copied to your clipboard.</div>
                    <div className="text-left">- You can access this password by selecting "OK" then right-clicking then selecting paste or using control + v from the keyboard.</div>                    
                </div>
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
    <div>
        <QRCode value = {props.qr_link} />
        <br></br>
        <br></br>
    </div>

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
        <button type="submit" className="btn btn-primary btn-lg mt-3">Submit</button>

        </div>
        </form>
    </div> 
    </div>
    <div className="container w-50 fs-5 mt-5">
        <div className="text-left">- Scan the QR code using your authentication app then enter the 6 digit code here and select "Submit".</div>
        <div className="text-left">- You'll then be rerouted to the login page.</div>
    </div>
    </>
    )
}
