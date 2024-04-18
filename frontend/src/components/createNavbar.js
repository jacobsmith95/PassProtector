import { Link, Route, Routes } from "react-router-dom";
import { AuthObject } from "../auth/authWrapper";
import { nav } from "./navbarData";
   
export const CreateLinks = () => {

     const { user, logout } = AuthObject()

     const LinkItem = ({r}) => {
          return (
               <div className="linkItem"><Link to={r.path}>{r.name}</Link></div>
          )
     }

     return (
          <div className="links">
               { nav.map((r, i) => {

                    if (!r.isSecure && r.isNav) {
                         return (
                              <LinkItem key={i} r={r}/>
                         )
                    } else if (user.isAuthenticated && r.isNav) {
                         return (
                              <LinkItem key={i} r={r}/>
                         )
                    } else return false
               } )}

               { user.isAuthenticated ?
               <div className="linkItem"><Link to={'/'} onClick={logout}>Log out</Link></div>
               :
               <div className="linkItem"><Link to={'login'}>Log in</Link></div> }
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