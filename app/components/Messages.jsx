import React, { useState, useEffect } from "react";
import { Button, Card, Modal, Form, Dropdown } from "react-bootstrap";
import styles from "/styles/messages.css";
import Image from "next/image";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import { db } from "../../utils/firebase";
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
import { getAuth } from "firebase/auth";

const Messages = ({ userEmail }) => {
  const auth = getAuth();
  const [newMessage, setNewMessage] = useState("");
  const currentUser = auth.currentUser;
  const [showPrompt, setShowPrompt] = useState(false);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatName, setChatName] = useState("");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (currentUser) {
          const q = query(
            collection(db, "chats"),
            where("users", "array-contains", currentUser.email)
          );
          const snapshot = await getDocs(q);
          const chatsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChats(chatsData);
        }
      } catch (error) {
        console.error("Error fetching chats: ", error);
      }
    };
    fetchChats();

    const fetchUsers = async () => {
      // Fetch all users from Firebase
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    };
    fetchUsers();
    const fetchMessagesForChat = async () => {
      try {
        if (selectedChat && selectedChat.id) {
          // Add check for selectedChat.id
          const chatRef = doc(db, "chats", selectedChat.id);
          const chatSnapshot = await getDoc(chatRef);
          const chatData = chatSnapshot.data();
          if (chatData && chatData.messages) {
            setSelectedChat((prevSelectedChat) => ({
              ...prevSelectedChat,
              messages: chatData.messages,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching messages for chat: ", error);
      }
    };

    fetchMessagesForChat();
  }, [currentUser, selectedChat]);

  const handleClose = () => {
    setShowPrompt(false);
    setSelectedUsers([]); // Clear selected users when closing the prompt
  };

  const handleShow = () => setShowPrompt(true);

  const handleAddToConversation = (user) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === user.id ? { ...u, added: !u.added } : u))
    );
    setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, user]);
  };

  const handleStartConversation = async () => {
    try {
      const currentUserEmail = currentUser.email;
      if (currentUser && currentUserEmail) {
        const updatedSelectedUsers = [
          ...selectedUsers,
          { email: currentUserEmail },
        ];
        const selectedUserEmails = updatedSelectedUsers.map(
          (user) => user.email
        );
        if (!selectedUserEmails.includes(currentUserEmail)) {
          updatedSelectedUsers.push({ email: currentUserEmail });
        }
        // Create a new chat document in Firestore
        const chatRef = await addDoc(collection(db, "chats"), {
          users: updatedSelectedUsers.map((user) => user.email),
          name: chatName,
        });
        console.log("Chat created with ID: ", chatRef.id);
        setShowPrompt(false);
        setSelectedUsers([]);
        setChatName("");
      } else {
        console.error("Current user not found or does not have an email");
      }
    } catch (error) {
      console.error("Error creating chat: ", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (newMessage.trim() !== "" && selectedChat) {
      // Fetch the profile picture URL from Firebase
      const currentUserData = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserProfile = currentUserData.data();
      const senderProfilePicture =
        currentUserProfile.profilePicture?.url || defaultProfilePicture;

      const messageData = {
        id: `${Date.now()}-${Math.random()}`,
        sender: currentUser.email,
        senderProfilePicture: senderProfilePicture,
        content: newMessage.trim(),
        timestamp: Timestamp.fromDate(new Date()),
      };

      try {
        const chatRef = doc(db, "chats", selectedChat.id);
        const chatSnapshot = await getDoc(chatRef);
        const chatData = chatSnapshot.data();

        if (chatData && chatData.messages) {
          await updateDoc(chatRef, {
            messages: [...chatData.messages, messageData],
          });
        } else {
          await updateDoc(chatRef, {
            messages: [messageData],
          });
        }

        setSelectedChat((prevSelectedChat) => ({
          ...prevSelectedChat,
          messages: [...(prevSelectedChat.messages || []), messageData],
        }));

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setShowChat(false);
  };

  return (
    <div className={`messages-container ${styles.messages}`}>
      {/* Start Conversation Button */}
      <Button variant="primary" onClick={handleShow}>
        Start a Conversation
      </Button>

      {/* Start Conversation Modal */}
      <Modal show={showPrompt} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Start a New Conversation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="name" className="chat-name-form">
            <Form.Control
              type="text"
              placeholder="Enter a name for this chat"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
            />
          </Form.Group>
          {/* Display all users with an "Add to Conversation" button */}
          {users.map((user) => (
            <Card key={user.email} className="mb-2">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Image
                    src={user.profilePicture?.url || defaultProfilePicture}
                    alt="Profile Pic"
                    width={50}
                    height={50}
                    className="rounded-circle me-2"
                  />
                  {`${user.firstName} ${user.lastName}`}
                </div>
                <Button
                  variant={user.added ? "danger" : "outline-primary"}
                  onClick={() => handleAddToConversation(user)}
                >
                  {user.added ? "Cancel" : "Add to Conversation"}
                </Button>
              </Card.Body>
            </Card>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleStartConversation}>
            Start Conversation
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Existing Conversations */}
      {chats.map((chat) => (
        <div
          className="chat-card rounded-5"
          key={chat.id}
          onClick={() => handleChatSelect(chat)}
        >
          <Image
            src={defaultProfilePicture}
            alt="Profile Pic"
            width={50}
            height={50}
            className="rounded-circle me-2"
          />
          <div className="chat-details">
            <div className="chat-name">{chat.name}</div>
            <div className="chat-message">{chat.lastMessage}</div>
          </div>
          <div className="chat-actions">
            <Dropdown>
              <Dropdown.Toggle
                as="span"
                className="chat-action"
                id={`dropdown-${chat.id}`}
              >
                <span style={{ fontSize: "1.5em" }}>•••</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item className="text-danger">
                  Leave Conversation
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      ))}

      {selectedChat && (
        <Modal
          show={showChat}
          onHide={handleCloseChat}
          fullscreen
          className="chat-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>{selectedChat.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="chat-body">
            <div className="chat-messages">
              {selectedChat && selectedChat.messages
                ? selectedChat.messages.map((message) => (
                    <div key={message.id} className="message">
                      <Image
                        src={
                          message.senderProfilePicture?.url ||
                          defaultProfilePicture
                        }
                        alt="Profile Pic"
                        className="message-avatar"
                        width={50}
                        height={50}
                      />
                      <div className="message-details">
                        <div className="message-header">
                          <span className="message-username">
                            {message.sender ? message.sender.split("@")[0] : ""}{" "}
                          </span>
                          <span className="message-timestamp">
                            {message.timestamp.toDate().toLocaleString()}{" "}
                          </span>
                        </div>
                        <div className="message-content">{message.content}</div>
                      </div>
                    </div>
                  ))
                : "No messages yet."}
            </div>
          </Modal.Body>
          <Modal.Footer className="chat-input">
            <Form className="message-form" onSubmit={handleSendMessage}>
              <Form.Group controlId="message">
                <Form.Control
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  maxLength={200}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Send
              </Button>
            </Form>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Messages;