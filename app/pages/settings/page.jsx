"use client";

import { Container, Nav, Button, Modal, Form, Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
// import { updatePassword } from "aws-amplify/auth";
import {
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth";

const SettingsPage = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleCloseModal = () => {
    setShowModal(false);
    setOldPassword("");
    setNewPassword("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleChangePassword = () => {
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // const user = await updatePassword({ oldPassword, newPassword });
      const auth = getAuth();
      const user = auth.currentUser;

      const password = newPassword;
      const response = await fetch(`/api/changeUserPassword/${user.email}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const credential = EmailAuthProvider.credential(
          user.email,
          oldPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setSuccessMessage("Password changed successfully.");
        toast.success("Password changed successfully!")
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.message.includes("auth/invalid-credential")) {
        setErrorMessage("Incorrect old password!");
      } else if (
        error.message.includes("Password should be at least 6 characters")
      ) {
        setErrorMessage("Password should be at least 6 characters!");
      }
    }
  };

  return (
    <Container className="w-50 mt-5">
      <h1 className="mb-4">Settings</h1>
      <Nav className="flex-column">
        <Nav.Link
          style={{ transition: "background-color 0.3s", fontWeight: "600" }}
          href="/pages/profile"
          className="nav-link"
          onMouseOver={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          Profile Settings
        </Nav.Link>
        <Nav.Link
          style={{ transition: "background-color 0.3s", fontWeight: "600" }}
          href="/pages/notification"
          className="nav-link"
          onMouseOver={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          Notification Settings
        </Nav.Link>
        <Nav.Link
          style={{ transition: "background-color 0.3s", fontWeight: "600" }}
          href="/pages/preference"
          className="nav-link"
          onMouseOver={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          Notification Preferences
        </Nav.Link>
        <Button
          variant="outline-primary"
          onClick={handleChangePassword}
          className="mt-3"
        >
          Change Password
        </Button>
      </Nav>

      {/* Change Password Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="oldPassword">
              <Form.Label>Old Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group style={{ marginTop: "10px" }} controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              style={{ marginTop: "10px" }}
              variant="primary"
              type="submit"
            >
              Change Password
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SettingsPage;
