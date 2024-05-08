import { Link, Route, Routes, useLocation } from "react-router-dom";
import { AuthObject } from "../auth/authWrapper.js";
import { nav } from "./navbarData.js";
   
export const CreateLinks = () => {

     const pageURL = useLocation();
     const { user, logout } = AuthObject()

     const LinkItem = ({r}) => {
          return (
               <div className={pageURL.pathname.includes(r.path) ? "linkItemActive" : "linkItem"}>  
               <Link to={r.path}>{r.name}</Link></div>
          )
     }

     return (
          <div className="links">
          {/* <div className="navbar navbar-dark bg-dark" */}
               { nav.map((r, i) => {

                    if (!user.isAuthenticated && r.isLogin) {
                         return (
                              <LinkItem key={i} r={r}/>
                         )
                    }
                    else if (user.isAuthenticated && r.isSecure) {
                         return (
                              <LinkItem key={i} r={r}/>
                         ) 
                    } else return false
               } )}

               { user.isAuthenticated ?
               <div className="linkItem"><Link to={'/login'} onClick={logout}>Log out</Link></div>
               : false }
          </div>
     )
}

export const CreateRoutes = () => {

     const { user } = AuthObject();
     
     return (
          <Routes>
          { nav.map((r, i) => {                 
               if (r.isSecure && user.isAuthenticated) {
                    return <Route key={i} path={r.path} element={r.element}/>
               } else if (!r.isSecure) {
                    return <Route key={i} path={r.path} element={r.element}/>
               } else return false
          })}         
          </Routes>
     )
}