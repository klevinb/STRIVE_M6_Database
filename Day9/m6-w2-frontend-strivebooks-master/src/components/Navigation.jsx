import React from 'react';
import { Nav, Navbar, FormControl, Button, Form, Badge } from "react-bootstrap"
import { Cart4 } from "react-bootstrap-icons"
import { Link } from "react-router-dom"


function Navigation({ cart, query, onSeachQueryUpdated,onSearchClicked,title }) {
    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand><Link to="/" style={{ color: "black"}}>{title}</Link></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                </Nav>
                <Form inline>
                    <FormControl value={query} onChange={(event)=> onSeachQueryUpdated(event.currentTarget.value)} type="text" placeholder="Search" className="mr-sm-2" />
                    <Button variant="outline-success" onClick={onSearchClicked}>Search</Button>
                </Form>
                <Link to="/cart" className="justify-content-center d-flex mx-3" style={{ color: "black"}}>
                <Badge pill variant={cart.length ? "danger" : "secondary"}>
                    {cart.length}
                </Badge>
                <Cart4 className="ml-2" />
                </Link>
            </Navbar.Collapse>
        </Navbar>
    )
}

export default Navigation;
