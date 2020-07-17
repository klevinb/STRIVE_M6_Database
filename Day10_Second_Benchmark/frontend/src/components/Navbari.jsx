import React, { Component } from 'react';
import {
    NavDropdown,
    Navbar,
    Nav
} from "react-bootstrap"

import { Link, withRouter } from 'react-router-dom'

class Navbari extends Component {

    render() {
        return (
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home">Oiii SHOP</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link onClick={() => console.log("fetch everything")}>Home</Nav.Link>
                        <NavDropdown title="Categories" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={() => this.fetchCategory("smartphones")}>Smarphones</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => this.fetchCategory("watches")}>Watches</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => this.fetchCategory("bikes")}>Bikes</NavDropdown.Item>
                        </NavDropdown>
                        <Link className='nav-link' to={"/backoffice"}>BackOffice</Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default withRouter(Navbari);