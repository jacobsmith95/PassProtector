import { createContext, useContext, useState } from "react"
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { deployTarget, axiosConfigPost } from "../configs.js"
import { CreateLinks, CreateRoutes } from "../components/createNavbar.js";
import { decryptVault, encryptVault } from "../components/frontend-encryption.js";

const AuthContext = createContext();
export const AuthObject = () => useContext(AuthContext);

export const AuthWrapper = () => {

     const [email, setEmail] = useState("")
     const [password, setPassword] = useState("")
     const [masterKey, setMasterKey] = useState("")
     const [masterHash, setMasterHash] = useState("")    
     const [user, setUser] = useState({email: "", isAuthenticated: false})
     const [vaultDecrypted, setVaultDecrypted] = useState()

     const navigate = useNavigate();
  
     const GetVault = (masterHash, masterKey) => {  

          axios.post(`${deployTarget}/get-vault/`, {'hash': masterHash}, axiosConfigPost)
          .then(res => {
               if (res.data.login_result === "success") {
                    setVaultDecrypted(decryptVault(masterKey, res.data.encrypted_vault))
                    navigate("/vault")
               } else {
                    window.alert(res.data.login_result);
               }
          })
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

     const logout = () => {
          saveVault()
          setUser({...user, isAuthenticated: false})
     }

     return (         
        <AuthContext.Provider value={{
               user, setUser,
               email, setEmail,
               password, setPassword,
               masterKey, setMasterKey,
               masterHash, setMasterHash,
               logout, 
               vaultDecrypted, setVaultDecrypted,  
               GetVault
               }}>
            <>
            <CreateLinks />
            <CreateRoutes />
            </>
        </AuthContext.Provider>        
     )

}