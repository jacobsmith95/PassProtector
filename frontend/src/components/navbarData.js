
import { Home } from './home';
import { Login } from './login';
import { CreateAccount } from './createAccount';
import { GeneratePW } from './generate_pw';
import { Vault } from './vault';
import { Analytics } from './analytics';
import { Settings } from './settings';
import { Docs } from './docs';

export const nav = [
  { path: "/",                name: "Home",               element: <Home />,          isNav: true,     isSecure: true },
  { path: "/login",           name: "Login",              element: <Login />,         isNav: false,    isSecure: false }, 
  { path: "/create-account",  name: "Create Account",     element: <CreateAccount />, isNav: true,     isSecure: false },     
  { path: "/generate-pw",     name: "Generate Password",  element: <GeneratePW />,    isNav: true,     isSecure: false },
  { path: "/vault",           name: "Vault",              element: <Vault />,         isNav: true,     isSecure: true },
  { path: "/analytics",       name: "Analytics",          element: <Analytics />,     isNav: true,     isSecure: true },
  { path: "/settings",        name: "Settings",           element: <Settings />,      isNav: true,     isSecure: true },
  { path: "/docs",            name: "Documentation",      element: <Docs />,          isNav: true,     isSecure: true },  
]
