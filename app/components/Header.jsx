"use client";

// import { withRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
// import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
// import currentUser from "../../utils/checkSignIn";
import React, { useState, useEffect, useRef } from "react";
import GrowSpinner from "./Spinner";
import { toast } from "react-toastify";
import { useLayoutEffect } from "react";
import Image from "next/image";
import logoImage from "../resources/images/logo.png";
import { db } from "../../firebase";
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const auth = getAuth();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        getUserRole(user.uid);
      }
    });
  }, [toggle]);

  console.log("role: ", userRole);

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

  const getUserRole = async (uid) => {
    const userRef = doc(db, "users", uid);

    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role);
      } else {
        console.log("User document not found.");
      }
    } catch (error) {
      console.error("Error getting user document:", error);
    }
  };

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
      await auth.signOut();
      handleToggle();
      // router.push("/pages/logIn");
      window.location.assign("/pages/logIn");
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
      // onClick={handleToggle}
      expanded={!isNavbarCollapsed}
      onToggle={handleToggleNavbar}
    >
      <Container>
        <div className="brand d-flex justify-content-center align-items-center">
          <Image
            src={logoImage}
            alt="Logo"
            style={{ width: "30px", height: "30px", marginRight: "10px" }}
          />
          <Navbar.Brand href="/pages/home">Campus Link</Navbar.Brand>
        </div>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse
          style={{ justifyContent: "flex-end" }}
          id="basic-navbar-nav"
        >
          <Nav className="justify-content-end">
            {userId ? (
              <Nav.Link href="/pages/mainTimeline">Home</Nav.Link>
            ) : (
              <Nav.Link href="/">Home</Nav.Link>
            )}
            {userRole && userRole.toLocaleLowerCase() === "admin" && (
              <Nav.Link href="/pages/admin">Admin</Nav.Link>
            )}
            <NavDropdown
              title="Tools"
              id="basic-nav-dropdown"
              onSelect={handleDropdownSelect} // Close dropdown on select
              show={dropdownOpen} // Control visibility of dropdown
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ zIndex: 9999 }}
            >
              {userId && (
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

                  {userRole && userRole.toLocaleLowerCase() === "admin" && (
                    <>
                    <NavDropdown.Item href="/pages/addCourse">
                      Add Course
                    </NavDropdown.Item>
                    <NavDropdown.Item href="/pages/createTutoringSession">
                    Create Tutoring Session
                  </NavDropdown.Item>
                  </>
                  )}
                </>
              )}
              <NavDropdown.Item href="/pages/tutors">Tutors</NavDropdown.Item>
              <NavDropdown.Item href="/pages/mainTimeline">
                Timeline
              </NavDropdown.Item>
              <NavDropdown.Item href="/pages/schedule">
                Schedule
              </NavDropdown.Item>
              <NavDropdown.Divider />
              {userId && (
                <NavDropdown.Item href="#blankForNow" onClick={handleSignOut}>
                  Logout
                </NavDropdown.Item>
              )}
            </NavDropdown>
            {!userId && (
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
