"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Authenticator } from "@aws-amplify/ui-react";
import { deleteUser } from "../utils/server";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import  GrowSpinner  from "./components/Spinner";

import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";
import '../utils/configureAmplify'
import "@aws-amplify/ui-react/styles.css";
Amplify.configure({ ...awsExports, ssr: true });

export default function Home() {
  const [users, setUsers] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserEmail, setDeleteUserEmail] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [toggle]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // const fetchedUsers = await listUsers();
      const response = await fetch("/api/users");

      let data = "";
      if (response.ok) {
        data = await response?.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setIsLoading(false);
  };

  const handleDeleteUser = (id, email) => {
    setDeleteUserId(id);
    setDeleteUserEmail(email);
    setShowConfirmModal(true);
  };

  const handleToggle = () => {
    setToggle(!toggle);
  }
  
  if (isLoading) {
    return <GrowSpinner />;
  }
  
  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      console.log("delete id:", deleteUserId)
      setShowConfirmModal(false);
      const response = await fetch(`/api/users/${deleteUserId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let data = "";
      if (response.ok) {
        data = response?.json();
      }

      // if (data && data?.message === "Student deleted successfully") {
       console.log("deleeee")
        await deleteUser(deleteUserEmail);
        toast.success("Account deleted successfully!");
        handleToggle();
      // }
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h1>Users</h1>
      <Link href='/pages/logIn'>login</Link>
      <table className="table table-striped table-bordered mt-4">
        <thead className="thead-dark">
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.email}</td>
              <td>{user.firstName + " " + user.lastName}</td>
              <td>{user.createdAt}</td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteUser(user.id, user.email)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirm Delete Modal */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete user with email: {deleteUserEmail}?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>

    // <main>

    //   <h1>Hello, {user.username}!</h1>
    //   <button onClick={signOut}>Sign out</button>
    // </main>
  );
}

// export default withAuthenticator(Home)

// {users.map((user, index) => (
//   <tr key={index}>
//     <td>{user.Name}</td>
//     <td>{user.Value}</td>
//     <td><button className="btn btn-danger" onClick={() => handleDeleteUser(index)}>Delete</button></td>
//   </tr>
// ))}
