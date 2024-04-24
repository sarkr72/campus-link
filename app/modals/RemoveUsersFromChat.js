import React, { useState, useEffect } from "react";
import { Modal, Button, Card, Image } from "react-bootstrap";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import { db } from "../utils/firebase";
import styles from "/styles/modal.css";
import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    query,
    where,
    Timestamp,
    doc,
    updateDoc,
  } from "firebase/firestore";

const RemoveUsersFromChatModal = ({
  show,
  handleClose,
  chatUsers,
  selectedChat,
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [usersData, setUsersData] = useState([]);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const usersData = usersSnapshot.docs.map((doc) => doc.data());
        setUsersData(usersData);
      } catch (error) {
        console.error("Error fetching users data:", error);
      }
    };

    fetchUsersData();
  }, []);

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleRemoveUsers = async () => {
    try {
      const updatedUsers = selectedChat.users.filter(
        (email) => !selectedUsers.includes(email)
      );
      await updateDoc(doc(db, "chats", selectedChat.id), {
        users: updatedUsers,
      });
      handleClose();
    } catch (error) {
      console.error("Error removing users from chat:", error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="remove-modal">
      <Modal.Header closeButton>
        <Modal.Title>Remove Users from Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {chatUsers.map((user, index) => {
          const userData = usersData.find(
            (userData) => userData.email === user.email
          );
          return (
            <Card key={`${user.email}-${index}`} className="mb-2">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div
                  className="d-flex align-items-center"
                  style={{ gap: "5px" }}
                >
                  <Image
                    src={userData?.profilePicture?.url || defaultProfilePicture}
                    alt="Profile Pic"
                    width={50}
                    height={50}
                    className="rounded-circle"
                  />
                  {`${userData?.firstName || ""} ${userData?.lastName || ""}`}
                </div>
                <Button
                  variant={
                    selectedUsers.includes(user.email)
                      ? "danger"
                      : "outline-primary"
                  }
                  onClick={() => toggleUserSelection(user.email)}
                >
                  {selectedUsers.includes(user.email) ? "Cancel" : "Remove"}
                </Button>
              </Card.Body>
            </Card>
          );
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose} variant="warning">
          Close
        </Button>
        <Button onClick={handleRemoveUsers} variant="danger">
          Remove Users
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveUsersFromChatModal;
