import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <Nav className="navigation-bar">
            <Link className="nav-link" to="/login">Log Out</Link>
        </Nav>
    );
}
  
export default NavBar;