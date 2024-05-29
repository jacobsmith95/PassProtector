import React, { useState, useEffect } from "react";
import axios from 'axios';
import { deployTarget, axiosConfigPost } from "../configs.js"
import { generateMasterKey } from "./frontend-encryption.js";
import { AuthObject } from "../auth/authWrapper.js";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

/*
Notes:
- Only the password can be changed.
- If the token is invalid, logout the user without saving any proposed changes. 
*/

export const Settings = () => {

    const { email, password, token, setPassword, masterHash, setMasterHash, setMasterKey, user, setUser, logoutInvalidToken} = AuthObject()

    const [showPW, setShowPW] = useState(false)

    // Set showPW to the opposite of it's current value. 
    const togglePW = () => {
        setShowPW(!showPW);
    };

    const editAccount = (user) => {

        if (!user.password) {
            window.alert("Please enter a password.")
            return
        }

        const masterValues = generateMasterKey(email, user.password)
    
        axios.post(`${deployTarget}/account-update/`, {'email': user.email, 'hash': masterValues.masterHash, 'token': token}, axiosConfigPost)
        .then(res => {
             if (res.data.account_update_result === "success") {
                setPassword(user.password)
                setMasterKey(masterValues.masterKey)
                setMasterHash(masterValues.masterHash)                
                window.alert("Account updated");
             } else if (res.data.account_update_result === "Invalid token") {
                window.alert("User session timed-out");
                logoutInvalidToken() 
             } else {
                window.alert(res.data.account_update_result);
             }
        })

    };

    useEffect(() => {
        showList()
    }, [password, showPW])

    const deleteUser = () => {
        axios.post(`${deployTarget}/account-delete/`, {'hash': masterHash, 'token': token}, axiosConfigPost)
        .then(res => {
             if (res.data.account_delete_result === "success") {
                window.alert("Account deleted");
                setUser({...user, isAuthenticated: false})
            } else if (res.data.account_delete_result === "Invalid token") {
                window.alert("User session timed-out");
                logoutInvalidToken() 
             } else {
                window.alert(res.data.account_update_result);
             }
        })
    }

    // Dynamically render the content of either UserData or UserForm based on user selections. 
    const showList = () => {
        setContent(< UserData email={email} password={password} showForm={showForm} editAccount={editAccount} deleteUser={deleteUser} showPW={showPW} togglePW={togglePW} />)
    }

    const showForm = (user) => {
        setContent(< UserForm email={email} password={password} showList={showList} editAccount={editAccount}/>)
    }
    
    // UserData is default.
    const [content, setContent] = useState(< UserData email={email} password={password} showForm={showForm} editAccount={editAccount} deleteUser={deleteUser} />)
    
    return (
        <div className="container my-5">
            { content }
        </div>
    )
}

const UserData = (props) => {
       
    return (
        <>
        <div className="container-md">     
        <div className="text-left button-padding-left">
        </div>

        <table className="table table-striped text-left w-50">
            <thead className="table-dark">
                <tr>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Action</th>                    
                </tr>
            </thead>
            <tbody> 
                <tr>
                <td>{props.email}</td>
                <td>
                {props.showPW ? props.password : "**************"}
                <button onClick= {() => props.togglePW()} type="button" className="btn border-0 ml-4" title={props.showPW ? "Hide password" : "Show password"}>{props.showPW ? <VisibilityOffIcon /> : <VisibilityIcon /> }</button>                
                </td>                     
                <td style={{width:"10px", whiteSpace:"nowrap"}}>
                    <button onClick={() => props.showForm(props.email, props.password)} type="button" className="btn btn-warning btn-lg mx-2" title="Edit user"><EditIcon /> </button>
                    <button onClick= {() => props.deleteUser()} type="button" className="btn btn-danger btn-lg" title="Delete user"> <DeleteIcon /></button>
                </td>                                                                         
                </tr>
            </tbody>
        </table>
        </div>
        </>
    )
}

const UserForm = (props) => {

    const handleSubmit = (event, props) => {
        
        event.preventDefault()
        const formData = new FormData(event.target)
        const user = Object.fromEntries(formData.entries())
        props.editAccount(user)
        
    }
    
    return (
    <>
    <div className="row">
    <div className="col-lg-6 mx-auto">

    <form onSubmit={(event) => handleSubmit(event, props)}>

        <div className="row mb-3">
            <label className="col-sm-4 text-right">Email:</label>
            <div className="col-sm-6">
            <input readOnly className="form-control"
                name = "email"
                defaultValue = {props.email}
            ></input>
            </div>
        </div>

        <div className="row mb-3">
            <label className="col-sm-4 text-right">Password:</label>
            <div className="col-sm-6">
            <input className="form-control"
                name = "password"
                defaultValue={props.password}
            ></input>
            </div>
        </div>

        <div>
        <button type="submit" className="btn btn-primary btn-lg me-4 mt-4" title="Save"><SaveIcon/> </button>
        <button onClick={() => props.showList()} type="button" className="btn btn-dark btn-lg mt-4" title="Cancel"><CancelIcon /></button>
        </div>
        </form>
        <div className="container w-75 fs-5 mt-5">
            <div className="text-left">- Users can only change their password (not their email) at this time.</div>
        </div>
    </div>
    </div>
    </>
    )
}