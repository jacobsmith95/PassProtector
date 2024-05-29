import { Link, Route, Routes, useLocation } from "react-router-dom";
import { AuthObject } from "../auth/authWrapper.js";
import { nav } from "./navbarData.js";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

/*
Notes
- Functions for the navbar links and routes.
- Dynamically maps these using the list provided in navbarData.
*/

export const TopHeader = () => {
     return (
          
     <div className='topHeader' >
          <div className="vaultIcon me-4"> <LockOpenIcon /> </div>
          <div className="me-4"> PassProtector </div>
          <div className="vaultIcon"> <LockIcon /> </div>
     </div>
     )
}

export const CreateLinks = () => {

     const pageURL = useLocation();
     const { user, logout } = AuthObject()

     const LinkItem = ({r}) => {

          // Dynamic className to reflect the active link.
          return (
               <div className={pageURL.pathname.includes(r.path) ? "linkItemActive" : "linkItem"}>  
               <Link to={r.path}>{r.name}</Link></div>
          )
     }

     return (
          // Loop through all the items in nav, only displaying the specfic set associated with the indicators. 
          <div className="links">
               { nav.map((r, i) => {
                    if ((!user.isAuthenticated && r.isLogin) || r.isSecureAndLogin) {
                         return ( <LinkItem key={i} r={r}/> )
                    } else if ((user.isAuthenticated && r.isSecure) || r.isSecureAndLogin) {
                         return ( <LinkItem key={i} r={r}/> ) 
                    } else return false
               } )}        
               { user.isAuthenticated ? <div className="linkItem"> <Link to={'/login'} onClick={logout}>Logout</Link> </div> : false }
          </div>
     )
}

export const CreateRoutes = () => {

     const { user } = AuthObject();
     
     // Create the routes associated with the links above.
     return (
          <Routes>
          { nav.map((r, i) => {                 
               if ((r.isSecure && user.isAuthenticated) || r.isSecureAndLogin) {
                    return <Route key={i} path={r.path} element={r.element}/>
               } else if (!r.isSecure || r.isSecureAndLogin) {
                    return <Route key={i} path={r.path} element={r.element}/>
               } else return false
          })}         
          </Routes>
     )
}