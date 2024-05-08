import React from "react";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function NavBar() {
    return (
        <Nav className="navigation-bar">
            <Nav.Link className="nav-link" href="#vault">Vault</Nav.Link>
            <Nav.Link className="nav-link" href="#generator">Generator</Nav.Link>
            <Nav.Link className="nav-link" href="#log-out">Log Out</Nav.Link>
        </Nav>
    );
}
  
export default NavBar;