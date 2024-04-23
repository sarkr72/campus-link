import React, { useState } from "react";
import { Modal, Button, Form, Card, Image } from "react-bootstrap";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import { db } from "../utils/firebase";
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

const AddUsersToChatModal = ({
  show,
  handleClose,
  users,
  chatUsers,
  setChatUsers,
  selectedChat,
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleAddUsers = async () => {
    try {
      console.log("Selected Chat:", selectedChat);
      const selectedUserEmails = selectedUsers.map((userId) => {
        const user = users.find((user) => user.id === userId);
        return user.email;
      });
      const updatedUsers = [...selectedChat.users, ...selectedUserEmails];
      console.log("Updated Users:", updatedUsers);
      await updateDoc(doc(db, "chats", selectedChat.id), {
        users: updatedUsers,
      });
      handleClose();
    } catch (error) {
      console.error("Error adding users to chat:", error);
    }
  };
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Users to Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {users.map((user, index) => (
          <Card key={`${user.email}-${index}`} className="mb-2">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center" style={{ gap: "5px" }}>
                <Image
                  src={user.profilePicture?.url || defaultProfilePicture}
                  alt="Profile Pic"
                  width={50}
                  height={50}
                  className="rounded-circle profile-pic"
                />
                {`${user.firstName} ${user.lastName}`}
              </div>
              <Button
                variant={
                  selectedUsers.includes(user.id) ? "danger" : "outline-primary"
                }
                onClick={() => toggleUserSelection(user.id)}
              >
                {selectedUsers.includes(user.id) ? "Remove" : "Add"}
              </Button>
            </Card.Body>
          </Card>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose} variant="warning">
          Close
        </Button>
        <Button onClick={handleAddUsers} variant="success">
          Add Users
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUsersToChatModal;
