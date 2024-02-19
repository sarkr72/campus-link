// Import necessary dependencies
"use client";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

function Header() {
  const router = useRouter();
  async function handleSignOut() {
    try {
      await signOut()
        .then(() => {
          router.push("/");
        })
        .catch((error) => {
          console.error("Error signing out:", error);
        });
    } catch (error) {
      console.log("error signing out: ", error);
    }
  }

  return (
    <Navbar style={{ backgroundImage: 'linear-gradient(to right, #EEF5FF, #B4D4FF, #86B6F6, #176B87)'}} expand="lg">
    <Container>
      <Navbar.Brand href="/pages/home">Campus Link</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse style={{ justifyContent: 'flex-end' }} id="basic-navbar-nav">
        <Nav className="justify-content-end">
          <Nav.Link href="/">Home</Nav.Link>
          <NavDropdown title="User" id="basic-nav-dropdown">
            <NavDropdown.Item href="/pages/profile">View Profile</NavDropdown.Item>
            <NavDropdown.Item href="/pages/settings">Settings</NavDropdown.Item>
            <NavDropdown.Item href="/pages/tutors">Tutors</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#blankForNow" onClick={handleSignOut}>
              Logout
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
