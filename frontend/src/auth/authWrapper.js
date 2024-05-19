import { createContext, useContext, useState } from "react"
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { deployTarget, axiosConfigPost } from "../configs.js"
import { CreateLinks, CreateRoutes, TopHeader } from "../components/createNavbar.js";
import { decryptVault, encryptVault } from "../components/frontend-encryption.js";

const AuthContext = createContext();
export const AuthObject = () => useContext(AuthContext);

export const AuthWrapper = () => {

     const [email, setEmail] = useState("")
     const [password, setPassword] = useState("")
     const [masterKey, setMasterKey] = useState("")
     const [masterHash, setMasterHash] = useState("")
     const [token, setToken] = useState("")
     const [user, setUser] = useState({email: "", isAuthenticated: false})

     // const [user, setUser] = useState({
     //      email: "", 
     //      setPassword:"",
     //      isAuthenticated: false,
     //      token: ""  ,       
     //      masterKey: "",
     //      masterHash: ""
     // })

     const [vaultExists, setVaultExists] = useState(false)
     const [vaultDecrypted, setVaultDecrypted] = useState()

     const navigate = useNavigate();
  
     const GetVault = (masterHash, masterKey, token) => {  

          axios.post(`${deployTarget}/get-vault/`, {'hash': masterHash, 'token': token}, axiosConfigPost)
          .then(res => {
               if (res.data.get_vault_result === "success") {
                    setVaultDecrypted(decryptVault(masterKey, res.data.encrypted_vault))
                    setVaultExists(true)
                    navigate("/vault")
               } else if (res.data.get_vault_result === "Invalid token") {
                    window.alert("Invalid token");
                    logout()     
               } else {
                    window.alert(res.data.get_vault_result);
               }
          })
     }

     const saveVault = () => {    
          
          let vaultDecryptedDelShowPW = [...vaultDecrypted]
          vaultDecryptedDelShowPW.forEach((obj) => {
              delete obj.showPW;
          });
  
          const encrypted_vault = encryptVault(masterKey, vaultDecryptedDelShowPW)
          axios.post(`${deployTarget}/vault-update/`, {'hash': masterHash, 'vault': encrypted_vault, 'token': token}, axiosConfigPost)
          .then(res => {
               if (res.data.vault_update_result === "success") {
                    console.log("Vault saved");
               } else if (res.data.vault_update_result === "Invalid token") {
                    window.alert("Invalid token");
                    setUser({...user, isAuthenticated: false})                   
               } else {
                  window.alert(res.data.vault_update_result);
               }
          })
      }

     const logout = () => {
      
          if (vaultExists) {
               saveVault()
          }
          
          axios.post(`${deployTarget}/logout/`, {'hash': masterHash, 'token': token }, axiosConfigPost)
          .then(res => {
               if (res.data.logout_result === "success") {
                    setUser({...user, isAuthenticated: false})              
               } else {
                    window.alert("Couldn't logout");
               }
          })
     }

     return (         
        <AuthContext.Provider value={{
               user, setUser,
               email, setEmail,
               password, setPassword,
               masterKey, setMasterKey,
               masterHash, setMasterHash,
               token, setToken,
               logout,
               vaultExists, setVaultExists,
               vaultDecrypted, setVaultDecrypted,  
               GetVault
               }}>
            <>
            <TopHeader />
            <CreateLinks />
            <CreateRoutes />
            </>
        </AuthContext.Provider>        
     )

}