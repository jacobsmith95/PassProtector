import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCode } from 'react-qrcode-logo';
import axios from 'axios';
import { deployTarget, axiosConfigPost } from "../configs.js"
import { generateMasterKey, encryptVault } from "./frontend-encryption.js";
// import { GeneratePW } from "./generate_pw.js"

export const CreateAccount = () => {

    // const [genPW, setGenPW] = useState(null)

    const navigate = useNavigate();

    const createAccountHandler = (email, password) => {  

        const masterValues = generateMasterKey(email, password)
        const masterHash = masterValues.masterHash
        const masterKey = masterValues.masterKey
        console.log(masterHash)

        const encrypted_vault = encryptVault(masterKey, [])

        axios.post(`${deployTarget}/account-create/`, {'email': email, 'hash': masterHash, 'token': "Test token", 'vault': encrypted_vault}, axiosConfigPost)
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

        axios.post(`${deployTarget}/auth-create/`, {'hash': props.masterHash, 'code': formObject.mfa_code}, axiosConfigPost)
        .then(res => {
            if (res.data.account_auth_result === "success") {
                window.alert("Account created!");
                navigate("/login")
            } else {
            window.alert("MFA code is incorrect");
            }
        })

   }

    // const handleGenPW = () => {
    //     setGenPW(GeneratePW())
        // if ( genPW ) {
        //     navigator.clipboard.writeText(genPW_copy)
        //     alert("Copied the text: " + genPW);
        // }
    // }

    const showAccountCreateForm = () => {
        setContent(< AccountCreateForm showMFA={showMFA} createAccountHandler={createAccountHandler} />)
    }

    const showMFA = (qr_link, masterHash) => {
        setContent(< MFAForm showAccountCreateForm={showAccountCreateForm} MFAHandler={MFAHandler} qr_link={qr_link} masterHash={masterHash} />)
    }
    
    const [content, setContent] = useState(< AccountCreateForm showMFA={showMFA} createAccountHandler={createAccountHandler} />)
    
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
                <br></br>
                {/* <button className="btn btn-primary btn-lg" onClick={() => {handleGenPW()}}>Generate Password</button>
                <br></br>
                <div>{genPW}</div> */}
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
    <br></br>
    </div>

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
