import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { generateMasterKey, decryptVault } from './frontend_encryption'
import axios from 'axios'
import { useState } from 'react';
import { KeyboardEvent } from 'react';

function LoginScreen(props: any) {
    const navigate = useNavigate()
    const [hasLoginError, setHasLoginError] = useState(false) 

    function handleEnter(key: KeyboardEvent<HTMLInputElement>) {
        console.log(key)
        if (key.key == 'Enter') {
            attemptLogin()
        }
    }

    function attemptLogin() {
        var usernameField = document.getElementById("username-field") as HTMLInputElement
        var passwordField = document.getElementById("password-field") as HTMLInputElement
        var username = usernameField.value
        var password = passwordField.value

        var masterVals = generateMasterKey(username, password)

        axios.post('https://backend-ngnhr6tt3a-ul.a.run.app/login/', {'hash': masterVals.masterHash})
        .then(function (response) {
            if (response.data.login_result == "success") {
                props.setToken(response.data.token)
                props.setMasterVals(masterVals)
                navigate("/mfa/")
            }
            else {
                setHasLoginError(true)
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    if (hasLoginError) {
        return (
            <div>
                <div className='title-bar'>PassProtector</div>
                <div className="screen-container">
                    <input className='login-element' id="username-field" type="text" placeholder='email' onKeyDown={(e) => {console.log("pressed")}}></input>
                    <input className='login-element' id="password-field" type="password" placeholder='password' onKeyDown={(e) => {console.log("pressed")}}></input>
                    <p className='input-alert'>Incorrect username or password</p>
                    <Button className='login-element' onClick={attemptLogin}>Login</Button>
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <div className='title-bar'>Secure Password Manger</div>
                <div className="screen-container">
                    <input className='login-element' id="username-field" type="text" placeholder='email'></input>
                    <input className='login-element' id="password-field" type="password" placeholder='password'></input>
                    <Button className='login-element' onClick={attemptLogin}>Login</Button>
                </div>
            </div>
        );
    }
}
  
export default LoginScreen;