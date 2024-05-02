
import { Home } from './home.js';
import { Login } from './login.js';
import { MFA } from './mfa';
import { CreateAccount } from './createAccount.js';
import { Vault } from './vault.js';
import { Settings } from './settings.js';
import { Docs } from './docs.js'

export const nav = [
  { path: "/",                name: "Home",               element: <Home />,            isSecure: false, isLogin: false },
  { path: "/login",           name: "Login",              element: <Login />,           isSecure: false, isLogin: true },
  { path: "/mfa",             name: "MFA",                element: <MFA />,             isSecure: false, isLogin: false }, 
  { path: "/create-account",  name: "Create Account",     element: <CreateAccount />,   isSecure: false, isLogin: true },     
  { path: "/vault",           name: "Vault",              element: <Vault />,           isSecure: true,  isLogin: false },
  { path: "/settings",        name: "Settings",           element: <Settings />,        isSecure: true,  isLogin: false },
  { path: "/docs",            name: "Documentation",      element: <Docs />,             isSecure: true,  isLogin: false },  
]
