import React from "react";
import { Navbar, Nav, Button, Form, FormControl } from "react-bootstrap";
import { withRouter, Link } from "react-router-dom";

class NavBar extends React.Component {
  render() {
    return (
      <Navbar bg='light' expand='lg'>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='mr-auto'>
            <Link to='/' className='nav-link'>
              {"Students"}
            </Link>
            <Link to='/backend' className='nav-link'>
              {"Backend"}
            </Link>
          </Nav>
          {this.props.match.isExact ? (
            <>
              <Form inline>
                <FormControl
                  type='text'
                  placeholder='Search'
                  className='mr-sm-2'
                />
                <Button variant='outline-success'>Search</Button>
              </Form>
            </>
          ) : null}
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default withRouter(NavBar);
