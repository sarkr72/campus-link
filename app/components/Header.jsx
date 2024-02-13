// Import necessary dependencies
"use client";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Header() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/pages/home">
            <img
              src="/app/favicon.ico"
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="React Bootstrap logo"
            />Campus Link</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/pages/home">Home</Nav.Link>
            <NavDropdown title="Users" id="basic-nav-dropdown">
              <NavDropdown.Item href="/pages/students">Students</NavDropdown.Item>
              <NavDropdown.Item href="/pages/professors">Professors</NavDropdown.Item>
              <NavDropdown.Item href="/pages/tutors">Tutors</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="/pages/logIn">Log In</Nav.Link>
            <Nav.Link href="/pages/register">Register</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;