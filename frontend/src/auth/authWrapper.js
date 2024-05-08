import { createContext, useContext, useState } from "react"
import { CreateLinks, CreateRoutes } from "../components/createNavbar.js";
import { axiosConfigPost } from "../configs.js"
import { generateMasterKey, decryptVault, encryptVault } from "../components/frontend-encryption.js";
import axios from 'axios';

const AuthContext = createContext();
export const AuthObject = () => useContext(AuthContext);

export const AuthWrapper = () => {

     const [email, setEmail] = useState("")
     const [password, setPassword] = useState("")

     const [user, setUser] = useState({email: "", isAuthenticated: false})
     const [masterKey, setMasterKey] = useState("")
     const [masterHash, setMasterHash] = useState("")
     const [vaultDecrypted, setVaultDecrypted] = useState()
     
     const login = (email, password) => {  

          setEmail(email)
          setPassword(password)

          const masterValues = generateMasterKey(email, password)
          setMasterKey(masterValues.masterKey)
          setMasterHash(masterValues.masterHash)

          return new Promise((resolve, reject) => {

               console.log(masterValues.masterHash)
               axios.post('https://backend-ngnhr6tt3a-ul.a.run.app/login/', {'hash': masterValues.masterHash}, axiosConfigPost)
               // axios.post('http://localhost:8000/login/', {'hash': masterValues.masterHash}, axiosConfigPost)
               .then(res => {
                    console.log(res.data.login_result)
                    if (res.data.login_result === "success") {
                         setUser({email: email, isAuthenticated: true})
                         console.log(res.data.encrypted_vault)
                         setVaultDecrypted(decryptVault(masterValues.masterKey, res.data.encrypted_vault))
                         resolve("success")
                    } else {
                         reject("Incorrect password")}
               })
          })                    
     }

     const saveVault = () => {       
          const encrypted_vault = encryptVault(masterKey, vaultDecrypted)
          axios.post('https://backend-ngnhr6tt3a-ul.a.run.app/vault-update/', {'hash': masterHash, 'vault': encrypted_vault}, axiosConfigPost)
          // axios.post('http://localhost:8000/vault-update/', {'hash': masterHash, 'vault': encrypted_vault}, axiosConfigPost)
          .then(res => {
               if (res.data.vault_update_result === "success") {
                  window.alert("Vault saved");
               } else {
                  window.alert(res.data.vault_update_result);
               }
          })
      }

     const logout = () => {
          saveVault()
          setUser({...user, isAuthenticated: false})
     }

     return (         
        <AuthContext.Provider value={{user, email, password, setPassword, login, logout, vaultDecrypted, setVaultDecrypted, masterHash, setMasterHash, masterKey, setMasterKey, setUser}}>
            <>
            <CreateLinks />
            <CreateRoutes />
            </>
        </AuthContext.Provider>        
     )

}