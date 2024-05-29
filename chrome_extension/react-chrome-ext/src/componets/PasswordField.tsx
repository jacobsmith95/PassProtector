import React from 'react';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';

function PasswordField(props: any) {
    const [hidden, setHidden] = useState(true)

    if (hidden) {
        return (
            <div className='password-field-container'>
                <div className='password'>********</div>
                <button className='show' onClick={() => setHidden(!hidden)}>Show</button>
                <button className='clipboard' onClick={() => {navigator.clipboard.writeText(props.password);}}>Copy</button>
            </div>
        )
    } else {
        return (
            <div className='password-field-container'>
                <div className='password'>{props.password}</div>
                <button className='show' onClick={() => setHidden(!hidden)}>Hide</button>
                <button className='clipboard' onClick={() => {navigator.clipboard.writeText(props.password);}}>Copy</button>
            </div>
        )
    }
    
}
  
export default PasswordField;