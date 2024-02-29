"use client";

import { withRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import currentUser from "../../utils/checkSignIn";
import React, { useState, useEffect, useRef } from "react";
import GrowSpinner from "./Spinner";
import { toast } from "react-toastify";
import { useLayoutEffect } from "react";
import Image from "next/image";
import logoImage from "../resources/images/logo.png";

function Header() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [currnetEmail, setCurrentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSet, setIsEmailSet] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toggle, setToggle] = useState(false);
  const navbarRef = useRef(null);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);

  console.log("role: ", user?.role);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsNavbarCollapsed(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useLayoutEffect(() => {
    // setIsLoading(true);
    const fetchCurrentUser = async () => {
      try {
        const email = await currentUser();
        setCurrentEmail(email);
        if (email) {
          console.log("emaaaa", email);
          setIsEmailSet(true);
        }
        if (email) {
          const response = await fetch(`/api/users/${email}`, {
            method: "GET",
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            setIsLoading(false);
            console.log("User data:", data);
          } else {
            console.log("Failed to fetch user data:", response.statusText);
          }
        } else {
          console.log("User is not signed in");
        }
      } catch (error) {
        console.error("Error getting current user:", error);
      } finally {
      }
    };

    fetchCurrentUser();
  }, [toggle]);

  const handleToggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
  };

  const handleDropdownSelect = () => {
    setDropdownOpen(false);
  };

  const handleToggle = () => {
    setToggle(!toggle);
  };

  if (isLoading) {
    return <GrowSpinner />;
  }

  async function handleSignOut(e) {
    e.preventDefault();

    try {
      await signOut()
        .then(() => {
          router.push("/pages/logIn");
          setIsEmailSet(false);
          toast.success("You are logged out!");
        })
        .catch((error) => {
          console.error("Error signing out:", error);
        });
    } catch (error) {
      console.log("error signing out: ", error);
    }
  }

  const goToProfilePage = (e) => {
    e.preventDefault();
    // const encodedUser = encodeURIComponent(JSON.stringify(user));
    router.push("/pages/updateProfile");
  };

  return (
    <Navbar
      ref={navbarRef}
      style={{
        backgroundImage:
          "linear-gradient(to right, #EEF5FF, #B4D4FF, #86B6F6, #176B87)",
      }}
      expand="lg"
      collapseOnSelect
      onClick={handleToggle}
      expanded={!isNavbarCollapsed}
      onToggle={handleToggleNavbar}
    >
      <Container>
        <div className="brand d-flex justify-content-center align-items-center">
          <Image src={logoImage} alt="Logo" style={{ width: "30px", height: "30px", marginRight: "10px" }}/>
          <Navbar.Brand href="/pages/home">Campus Link</Navbar.Brand>
        </div>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse
          style={{ justifyContent: "flex-end" }}
          id="basic-navbar-nav"
        >
          <Nav className="justify-content-end">
            <Nav.Link href="/">Home</Nav.Link>
            {user && user.role === "admin" && (
              <Nav.Link href="/pages/admin">Admin</Nav.Link>
            )}
            <NavDropdown
              title="User"
              id="basic-nav-dropdown"
              onSelect={handleDropdownSelect} // Close dropdown on select
              show={dropdownOpen} // Control visibility of dropdown
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {isEmailSet && (
                <>
                  <NavDropdown.Item href="/pages/profile">
                    View Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/pages/updateProfile">
                    Update Profile
                  </NavDropdown.Item>

                  <NavDropdown.Item href="/pages/settings">
                    Settings
                  </NavDropdown.Item>
                </>
              )}
              <NavDropdown.Item href="/pages/tutors">Tutors</NavDropdown.Item>
              <NavDropdown.Item href="/pages/mainTimeline">Timeline</NavDropdown.Item>
              <NavDropdown.Divider />
              {isEmailSet && (
                <NavDropdown.Item href="#blankForNow" onClick={handleSignOut}>
                  Logout
                </NavDropdown.Item>
              )}
            </NavDropdown>
            {!isEmailSet && (
              <>
                <Nav.Link href="/pages/logIn">Log In</Nav.Link>
                <Nav.Link href="/pages/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
