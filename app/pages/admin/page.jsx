"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
// import { Authenticator } from "@aws-amplify/ui-react";
// import { deleteUser } from "../../../utils/server";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import GrowSpinner from "../../components/Spinner";
// import listUsers from '../../../utils/server'
// import { Amplify } from "aws-amplify";
// import config from "../../../aws-exports";
// import "@aws-amplify/ui-react/styles.css";
// Amplify.configure(config);
import { db } from "../../../utils/firebase";
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
import Dropdown from "../../components/Dropdown";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserEmail, setDeleteUserEmail] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState();

  useEffect(() => {
    fetchUsers();
  }, [toggle]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const userRef = collection(db, "users");
      const snapshot = await getDocs(userRef);
      const usersData = snapshot.docs.map((doc) => ({
        id: doc?.id,
        email: doc?.data()?.email,
        firstName: doc?.data()?.firstName,
        lastName: doc?.data()?.lastName,
        role: doc?.data()?.role,
        timestamp: doc?.data()?.timestamp?.toDate(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async (email) => {
    let id = "";
    const userRef = collection(db, "users");
    const userQuery = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(userQuery);
    id = querySnapshot.docs[0].id;
    setDeleteUserId(id);
    setDeleteUserEmail(email);
    setShowConfirmModal(true);
  };

  const handleToggle = () => {
    setToggle(!toggle);
  };

  if (isLoading) {
    return <GrowSpinner />;
  }

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      console.log("delete id:", deleteUserId);
      setShowConfirmModal(false);

      const response = await fetch(`/api/users/${deleteUserEmail}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deleteUserId }),
      });

      let data = "";
      if (response.ok) {
        data = await response?.json();
        console.log("data:", data.message, data);
        if (data && data?.message === "Student deleted successfully") {
          // console.log("deleeee");
          // await deleteUser(deleteUserEmail);
          toast.success("Account deleted successfully!");
          handleToggle();
        }
        // fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <h1>Users</h1>
      <table className="table table-striped table-bordered mt-4">
        <thead className="thead-dark">
          <tr>
          <th>Role</th>
            <th>Email</th>
            <th>Name</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td
                onClick={() => {
                  setSelectedRow(user?.id);
                }}
                className="p-3 md:p-6"
              >
                <Dropdown userId={user?.id} selected={selectedRow === user?.id} />
              </td>
              <td>{user?.email}</td>
              <td>{user?.firstName + " " + user?.lastName}</td>
              <td>{user?.timestamp?.toLocaleString()}</td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteUser(user.email)}
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
