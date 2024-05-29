/* global chrome */
import React from 'react';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import PasswordField from './PasswordField';

function VaultItem(props: any) {
    const [expanded, setExpanded] = useState(false)

    async function AutoFillLogin() {
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        if (tab.id) chrome.tabs.sendMessage(tab.id, {
            username: props.account.username,
            password: props.account.password
        });
    }

    if (!expanded) {
        return (
            <div className="vault-item">
                <div id="dropdown-icon" onClick={() => {setExpanded(!expanded)}}>&#128898;</div>
                <div id="item-name" onClick={() => {setExpanded(!expanded)}}>{props.account.account}</div>
                <div><Button onClick={AutoFillLogin}>Autofill</Button></div>
            </div>
        )
    } else {
        return (
            <div>
                <div className="vault-item">
                    <div id="dropdown-icon" onClick={() => {setExpanded(!expanded)}}>&#128899;</div>
                    <div id="item-name" onClick={() => {setExpanded(!expanded)}}>{props.account.account}</div>
                    <div><Button onClick={AutoFillLogin}>Autofill</Button></div>
                </div>
                <div className='vault-extra-info'>
                    <div className='extra-info-container'>
                        <p className='extra-info-label'>Username:</p> 
                        {props.account.username}
                    </div>
                    <div className='extra-info-container'>
                        <p className='extra-info-label'>Password:</p> 
                        <PasswordField password={props.account.password} />
                    </div>
                </div>
            </div>
        )
    }
    
}
  
export default VaultItem;