import { createContext, useContext, useState } from "react"
import { CreateLinks, CreateRoutes } from "../components/createNavbar";

const AuthContext = createContext();
export const AuthObject = () => useContext(AuthContext);

export const AuthWrapper = () => {

     const [user, setUser] = useState({email: "", isAuthenticated: false})

     const login = (email, password) => {  

          return new Promise((resolve, reject) => {
               if (password === "password") {
                    setUser({email: email, isAuthenticated: true})
                    resolve("success")
               } else {
                    reject("Incorrect password")}
          })                    
     }
     
     const logout = () => {
          setUser({...user, isAuthenticated: false})
     }

     return (         
        <AuthContext.Provider value={{user, login, logout}}>
            <>
            <CreateLinks />
            <CreateRoutes />
            </>
        </AuthContext.Provider>        
     )

}