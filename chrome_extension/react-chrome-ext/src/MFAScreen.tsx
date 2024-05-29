import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import axios from 'axios'
import { decryptVault } from './frontend_encryption'
import { useState } from 'react';

function MFAScreen(props: any) {
    const navigate = useNavigate()
    const [hasMFAError, setHasMFAError] = useState(false)

    function submitMFA() {
        var MFAField = document.getElementById("mfa-field") as HTMLInputElement
        var code = MFAField.value
        axios.post('https://backend-ngnhr6tt3a-ul.a.run.app/mfa-login/', {
            'hash': props.masterVals.masterHash,
            'token': props.token,
            'code': code
        })
        .then(function(response) {
            if (response.data.account_auth_result == "success") {
                axios.post('https://backend-ngnhr6tt3a-ul.a.run.app/get-vault/', {
                    'hash': props.masterVals.masterHash,
                    'token': props.token
                })
                .then(function (response) {
                    console.log(response)
                    var vault = decryptVault(props.masterVals.masterKey, response.data.encrypted_vault)
                    props.setVault(vault)
                    navigate("/vault/")
                })
                .catch(function (error) {
                    alert("error getting vault")
                    console.log(error);
                });
            }
            else {
                MFAField.value = ""
                setHasMFAError(true)
                console.log(response)
                console.log(props.token)
            }
        })
        .catch(function (error) {
            alert("error submitting mfa")
            console.log(error);
        });
    }

    if (hasMFAError) {
        return (
            <div>
                <div className='title-bar'>Secure Password Manger</div>
                <div className="screen-container">
                    <input className='login-element' id="mfa-field" type="text" placeholder='Authentication Code'></input>
                    <p className='input-alert'>Invalid code</p>
                    <Button className='login-element' onClick={submitMFA}>Submit</Button>
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <div className='title-bar'>Secure Password Manger</div>
                <div className="screen-container">
                    <input className='login-element' id="mfa-field" type="text" placeholder='Authentication Code'></input>
                    <Button className='login-element' onClick={submitMFA}>Submit</Button>
                </div>
            </div>
        );
    }
}
  
export default MFAScreen;