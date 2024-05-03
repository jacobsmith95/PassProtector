import { createContext, useContext, useState } from "react"
import { CreateLinks, CreateRoutes } from "../components/createNavbar.js";
import { axiosConfigPost } from "../configs.js"
import { generateMasterKey, decryptVault } from "../components/frontend-encryption.js";

import axios from 'axios';

const AuthContext = createContext();
export const AuthObject = () => useContext(AuthContext);

export const AuthWrapper = () => {

     const [user, setUser] = useState({email: "", isAuthenticated: false})
     const [masterKey, setMasterKey] = useState("")
     const [masterHash, setMasterHash] = useState("")
     const [vaultDecrypted, setVaultDecrypted] = useState()
     
     const login = (email, password) => {  

          const masterValues = generateMasterKey(email, password)
          setMasterKey(masterValues.masterKey)
          setMasterHash(masterValues.masterHash)

          return new Promise((resolve, reject) => {

               console.log(masterValues.masterHash)
               // axios.post('https://backend-ngnhr6tt3a-ul.a.run.app/login/', {'masterHash': masterValues.masterHash}, axiosConfigPost)
               axios.post('http://localhost:8000/login/', {'masterHash': masterValues.masterHash}, axiosConfigPost)
               .then(res => {
                    const login_result = res.data.login_result;
                    if (login_result === "success") {
                         setUser({email: email, isAuthenticated: true})
                         setVaultDecrypted(decryptVault(masterValues.masterKey, res.data.ciphertext))
                         resolve("success")
                    } else {
                         reject("Incorrect password")}
               })
          })                    
     }
     
     const logout = () => {
          setUser({...user, isAuthenticated: false})
     }

     return (         
        <AuthContext.Provider value={{user, login, logout, vaultDecrypted, setVaultDecrypted}}>
            <>
            <CreateLinks />
            <CreateRoutes />
            </>
        </AuthContext.Provider>        
     )

}