import React from 'react';
import { useState } from "react";
import VaultScreen from './VaultScreen';
import './App.css';
import LoginScreen from './LoginScreen';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import MFAScreen from './MFAScreen';

function App() {
	const [vault, setVault] = useState("");
	const [token, setToken] = useState("");
	const [masterVals, setMasterVals] = useState("");
	const routes = [
		{
			path: "/login/",
			element: <LoginScreen setToken={setToken} setMasterVals={setMasterVals}></LoginScreen>,
		},
		{
			path: "/mfa/",
			element: <MFAScreen token={token} masterVals={masterVals} setVault={setVault}></MFAScreen>
		},
		{
			path: "/vault/",
			element: <VaultScreen vault={vault}></VaultScreen>,
		},
	]
	const router = createMemoryRouter(routes, {
		initialEntries: ["/login/"],
	});

	return (
		<div className="App">
			<RouterProvider router={router}/>
		</div>
	);
}

export default App;
