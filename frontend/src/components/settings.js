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

export const Settings = () => {

    const { email, password, token, setPassword, masterHash, setMasterHash, setMasterKey, user, setUser, logout} = AuthObject()

    const [showPW, setShowPW] = useState(false)

    const togglePW = () => {
        setShowPW(!showPW);
    };

    const editAccount = (user) => {

        const masterValues = generateMasterKey(email, user.password)
        setMasterKey(masterValues.masterKey)
        setMasterHash(masterValues.masterHash)
        const masterHashNew = masterValues.masterHash
    
        axios.post(`${deployTarget}/account-update/`, {'email': user.email, 'hash': masterHashNew, 'token': token}, axiosConfigPost)
        .then(res => {
             if (res.data.account_update_result === "success") {
                setPassword(user.password)
                window.alert("Account updated");
             } else if (res.data.account_update_result === "Invalid token") {
                window.alert("Invalid token");
                logout() 
             } else {
                window.alert("Error, Account not updated");
             }
        })

    };

    useEffect(() => {
        showList()
    }, [password, showPW])

    const deleteUser = () => {

        axios.post(`${deployTarget}/account-delete/`, {'hash': masterHash}, axiosConfigPost)
        .then(res => {
             if (res.data.account_delete_result === "success") {
                window.alert("Account deleted");
                setUser({...user, isAuthenticated: false})
             } else {
                window.alert("Error, Account not deleted");
             }
        })
    }

    const showList = () => {
        setContent(< UserData email={email} password={password} showForm={showForm} editAccount={editAccount} deleteUser={deleteUser} showPW={showPW} togglePW={togglePW} />)
    }

    const showForm = (user) => {
        setContent(< UserForm email={email} password={password} showList={showList} editAccount={editAccount}/>)
    }
    
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
            <label className="col-sm-4 col-form-label">Email</label>
            <div className="col-sm-8">
            <input className="form-control"
                name = "email"
                defaultValue = {props.email}
            ></input>
            </div>
        </div>

        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">Password</label>
            <div className="col-sm-8">
            <input className="form-control"
                name = "password"
                defaultValue={props.password}
            ></input>
            </div>
        </div>

        <div>
        <button type="submit" className="btn btn-primary btn-lg me-4" title="Save"><SaveIcon/> </button>
        <button onClick={() => props.showList()} type="button" className="btn btn-dark btn-lg" title="Cancel"><CancelIcon /></button>
        </div>
        </form>
    </div> 
    </div>
    </>
    )
}