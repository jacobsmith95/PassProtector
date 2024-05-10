import React, { useState, useEffect } from "react";
import axios from 'axios';
import { deployTarget, axiosConfigPost } from "../configs.js"
import { AuthObject } from "../auth/authWrapper.js";
import { encryptVault } from "../components/frontend-encryption.js";

export const Vault = () => {

    const { vaultDecrypted, setVaultDecrypted, masterHash, masterKey } = AuthObject()

    const addItem = (item) => {
        let obj = { 
            ID: vaultDecrypted.length === 0 ? 1: vaultDecrypted[vaultDecrypted.length-1].ID + 1, 
            account: item.account,
            username: item.username,
            password: item.password,
            notes: item.notes
        };
        let vaultDecryptedNew = [...vaultDecrypted, obj]
        setVaultDecrypted(vaultDecryptedNew);
    }

    const deleteItem = (index) => {
        setVaultDecrypted(vaultDecrypted.filter((_, i) => i !== index));
    }

    const editItem = (item) => {

        let obj = { 
            ID: parseInt(item.ID), 
            account: item.account,
            username: item.username,
            password: item.password,
            notes: item.notes
        };

        const currentVaultIndex = vaultDecrypted.findIndex((elem) => elem.ID === parseInt(item.ID));

        const newVault = [
            ...vaultDecrypted.slice(0, currentVaultIndex),
            obj,
            ...vaultDecrypted.slice(currentVaultIndex + 1, vaultDecrypted.length)
        ];
        setVaultDecrypted(newVault)
    };

    useEffect(() => {
        showList()
    }, [vaultDecrypted])

    const showList = () => {
        setContent(< VaultList vaultDecrypted={vaultDecrypted} showForm={showForm} editItem={editItem} deleteItem={deleteItem} saveVault={saveVault}/>)
    }

    const showForm = (item) => {
        setContent(< VaultForm item={item} showList={showList} editItem={editItem} addItem={addItem} />)
    }
    
    const saveVault = () => {       
        const encrypted_vault = encryptVault(masterKey, vaultDecrypted)
        axios.post(`${deployTarget}/vault-update/`, {'hash': masterHash, 'vault': encrypted_vault}, axiosConfigPost)
        .then(res => {
             if (res.data.vault_update_result === "success") {
                window.alert("Vault saved");
             } else {
                window.alert(res.data.vault_update_result);
             }
        })
    }

    const [content, setContent] = useState(< VaultList vaultDecrypted={vaultDecrypted} showForm={showForm} editItem={editItem} deleteItem={deleteItem} />)
    
    return (
        <div className="container my-5">
            { content }
        </div>
    )
}

const VaultList = (props) => {
       
    return (
        <>
        <div className="container-md">     
        <div className="text-left button-padding-left">
        <button onClick={() => props.showForm({}) } type="button" className="btn btn-success btn-lg me-2">Create Item</button>
        <button onClick={() => props.saveVault({}) } type="button" className="btn btn-success btn-lg me-2">Save Vault</button>
        </div>
  
        <table className="table table-striped text-left w-75">
            <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Account</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Notes</th>                    
                    <th>Action</th>
                </tr>
            </thead>
            <tbody> {
                props.vaultDecrypted.map((item, index)=> {
                    return <tr key={index}>
                        <td>{item.ID}</td>
                        <td>{item.account}</td>
                        <td>{item.username}</td>
                        <td>{item.password}</td>
                        <td>{item.notes}</td>                       
                        <td style={{width:"10px", whiteSpace:"nowrap"}}>
                        <button onClick={() => props.showForm(item)} type="button" className="btn btn-primary btn-lg me-2">Edit</button>
                        <button onClick= {() => props.deleteItem(index)} type="button" className="btn btn-danger btn-lg">Delete</button>
                        </td>                                                                         
                    </tr>
                })
            }
            </tbody>
        </table>
        </div>
        </>
    )
}

const VaultForm = (props) => {

    const handleSubmit = (event, props) => {
        
        event.preventDefault()
    
        const formData = new FormData(event.target)
        const item = Object.fromEntries(formData.entries())
    
        if (!item.account || !item.username || !item.password) {
            window.alert("Items are missing!")
            return
        }
    
        if (!item.ID) {
            props.addItem(item)
        }
    
        else {
            props.editItem(item)
        }
    }
    
    return (
    <>
    <div className="row">
    <div className="col-lg-6 mx-auto">

    <form onSubmit={(event) => handleSubmit(event, props)}>

        {props.item.ID ? <div className="row mb-3">
            <label className="col-sm-4 col-form-label">ID</label>
            <div className="col-sm-8">
            <input readOnly className="form-control-plaintext"
                name = "ID"
                defaultValue={props.item.ID}
            ></input>
            </div>
        </div>
        : null
        }

        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">Account</label>
            <div className="col-sm-8">
            <input className="form-control"
                name = "account"
                defaultValue={props.item.account}
            ></input>
            </div>
        </div>

        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">Username</label>
            <div className="col-sm-8">
            <input className="form-control"
                name = "username"
                defaultValue={props.item.username}
            ></input>
            </div>
        </div>

        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">Password</label>
            <div className="col-sm-8">
            <input className="form-control"
                name = "password"
                defaultValue={props.item.password}
            ></input>
            </div>
        </div>

        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">Notes</label>
            <div className="col-sm-8">
            <input className="form-control"
                name = "notes"
                defaultValue={props.item.notes}
            ></input>
            </div>
        </div>

        <div>
        <button type="submit" className="btn btn-primary btn-lg me-2">Save</button>
        <button onClick={() => props.showList()} type="button" className="btn btn-secondary btn-lg">Cancel</button>
        </div>
        </form>
    </div> 
    </div>
    </>
    )
}
