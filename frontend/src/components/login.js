import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthObject } from "../auth/authWrapper";

export const Login = () => {

    const navigate = useNavigate();
    const { login } = AuthObject();

    const [errorMessage, setErrorMessage] = useState(null)

    const loginHandler = async (email, password) => {
        try {           
            await login(email, password)
            navigate("/vault")
        } catch (error) {
            setErrorMessage(error)               
        }       
    }

    return (
        <div className="page">
        <h2>Login</h2>
            <div className="inputs">
            <div><input type="email" id="email_id" size="20" placeholder="email" required/></div>
            <div><input type="password" id="password_id" size="20" placeholder="password" required minLength={8}/></div>
            <button onClick={() => loginHandler(
                document.getElementById("email_id").value,
                document.getElementById("password_id").value
            )}>Login</button>

            {errorMessage ?<div className="error">{errorMessage}</div>: null}</div>
        </div>
     )
}