
import { Home } from './home.js';
import { Login } from './login.js';
import { CreateAccount } from './createAccount.js';
import { Vault } from './vault.js';
import { Settings } from './settings.js';
import { UserGuide } from './userGuide.js'

/*
Notes:
- This is passed to createNavbar so a route can easily be added. 
- path: sub-URL 
- name: displayed on the browser.
- element: function exported from the route
- isSecure: only authenticated users will see
- isLogin: only non-authenticated users will see
*/

export const nav = [
  { path: "/",                name: "Home",               element: <Home />,            isSecure: false, isLogin: false, isSecureAndLogin: false },
  { path: "/login",           name: "Login",              element: <Login />,           isSecure: false, isLogin: true,  isSecureAndLogin: false },
  { path: "/create-account",  name: "Create Account",     element: <CreateAccount />,   isSecure: false, isLogin: true,  isSecureAndLogin: false },    
  { path: "/vault",           name: "Vault",              element: <Vault />,           isSecure: true,  isLogin: false, isSecureAndLogin: false },
  { path: "/settings",        name: "Settings",           element: <Settings />,        isSecure: true,  isLogin: false, isSecureAndLogin: false },
  { path: "/user-guide",      name: "User Guide" ,        element: <UserGuide />,       isSecure: true,  isLogin: false, isSecureAndLogin: true },
]
