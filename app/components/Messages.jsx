import React, { useState, useEffect } from "react";
import { Button, Card, Modal, Form, Dropdown } from "react-bootstrap";
import styles from "/styles/messages.css";
import Image from "next/image";
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
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Messages = ({ userEmail }) => {
  const [newMessage, setNewMessage] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatName, setChatName] = useState("");
  const [currentUserData, setCurrentUserData] = useState("");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            setCurrentUser(user);
            const q = query(
              collection(db, "chats"),
              where("users", "array-contains", user?.email)
            );
            const snapshot = await getDocs(q);
            const chatsData = snapshot.docs.map((doc) => ({
              ...doc.data(),
            }));
            console.log("sss", chatsData);
            setChats(chatsData);
            const data = await getDoc(doc(db, "users", user.uid));
            setCurrentUserData(data);
          }
        });
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
  }, []);

  const handleClose = () => {
    setShowPrompt(false);
    setSelectedUsers([]);
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

        // Create a new chat in DB
        const chatDocRef = await addDoc(collection(db, "chats"), {
          users: updatedSelectedUsers.map((user) => user.email),
          name: chatName,
        });

        // Get the ID
        const chatId = chatDocRef.id;

        // Update doc
        await updateDoc(doc(db, "chats", chatId), { id: chatId });

        console.log("Chat created with ID: ", chatId);
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
  const handleLeaveConversation = async (chat) => {
    try {
      const chatRef = doc(db, "chats", chat.id);
      const chatSnapshot = await getDoc(chatRef);
      const chatData = chatSnapshot.data();

      if (chatData && chatData.users) {
        // Remove the user from the users array
        const updatedUsers = chatData.users.filter(
          (userEmail) => userEmail !== currentUser.email
        );

        // Update  chat
        await updateDoc(chatRef, {
          users: updatedUsers,
        });

        // Add a system message indicating that the user has left
        const systemMessage = {
          id: `${Date.now()}-system`,
          content: `${
            currentUserData.displayName || currentUser.email
          } has left the conversation.`,
          timestamp: Timestamp.fromDate(new Date()),
        };

        await updateDoc(chatRef, {
          messages: [...(chatData.messages || []), systemMessage],
        });

        console.log("User left conversation successfully.");
      } else {
        console.error("Chat data or users not found.");
      }
    } catch (error) {
      console.error("Error leaving conversation: ", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (newMessage.trim() !== "" && selectedChat) {
      const currentUserProfile = currentUserData.data();
      const senderProfilePicture =
        currentUserProfile.profilePicture?.url || defaultProfilePicture;

      const messageData = {
        id: `${Date.now()}-${Math.random()}`,
        sender: currentUser.email,
        senderProfilePicture: senderProfilePicture,
        content: newMessage?.trim(),
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
  const getChatImage = (users) => {
    // If there are exactly two users, return the profile picture of the other user
    if (users.length === 2) {
      const otherUser = users.find((user) => user.email !== currentUser.email);
      return otherUser
        ? otherUser.profilePicture?.url || defaultProfilePicture
        : defaultProfilePicture;
    } else {
      // If there are more than two users, return the default profile picture
      return defaultProfilePicture;
    }
  };

  const handleChatSelect = async (chat) => {
    try {
      const chatRef = doc(db, "chats", chat.id);
      const chatSnapshot = await getDoc(chatRef);
      const chatData = chatSnapshot.data();

      if (chatData && chatData.messages) {
        // Reset messages state to only contain messages of the selected chat
        setSelectedChat({
          ...chatData,
          messages: chatData.messages,
        });
      } else {
        setSelectedChat(chatData);
      }

      setShowChat(true);
    } catch (error) {
      console.error("Error selecting chat: ", error);
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    console.log("hehe", selectedChat);
    setShowChat(false);
  };

  return (
    <div>
      <div className="convo-container">
        {/* Conversations */}
        <div className="conversations-container">
          <Button className="rounded-5" variant="primary" onClick={handleShow}>
            Start a New Chat
          </Button>
          {/* Convos */}
          {chats.map((chat, index) => (
            <div
              className="conversation rounded-5"
              key={`${chat.id}-${index}`}
              onClick={() => handleChatSelect(chat)}
            >
              <Image
                src={getChatImage(chat.users)}
                alt="Profile Pic"
                width={50}
                height={50}
                className="rounded-circle me-2"
              />

              {/* Chat details */}
              <div className="chat-details">
                <div className="chat-name">{chat.name}</div>
                <div className="chat-message">{chat.lastMessage}</div>
              </div>

              {/* Chat actions */}
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
                    <Dropdown.Item
                      key={`leave-${chat.id}`}
                      className="text-danger"
                      onClick={() => handleLeaveConversation(chat)}
                    >
                      Leave Conversation
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          ))}
        </div>

        {/* Messages) */}
        <div className="chat-container rounded-3">
          <div className="messages-container">
            {selectedChat ? (
              <div className="chat-messages">
                {selectedChat.messages && selectedChat.messages.length > 0 ? (
                  selectedChat.messages.map((message, index) => (
                    <div
                      key={`${message?.id}-${index}`}
                      className={`message ${
                        message.sender === currentUser.email
                          ? "user-message"
                          : "other-message"
                      }`}
                    >
                      <Image
                        src={
                          message.senderProfilePicture || defaultProfilePicture
                        }
                        alt="Profile Pic"
                        className="message-avatar"
                        width={50}
                        height={50}
                      />
                      <div className="message-details">
                        <div className="message-header">
                          <span className="message-username">
                            {message.sender ? message.sender.split("@")[0] : ""}
                          </span>
                          <span className="message-timestamp">
                            {message.timestamp.toDate().toLocaleString()}
                          </span>
                        </div>
                        <div className="message-content rounded-4">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-messages">No messages yet</div>
                )}
              </div>
            ) : (
              <div className="no-chat-selected">
                Select a chat to start messaging
              </div>
            )}
          </div>
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
              {users.map((user, index) => (
                <Card key={`${user.email}-${index}`} className="mb-2">
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
          <div className="send-prompt">
            <Form className="message-form" onSubmit={handleSendMessage}>
              <Form.Group controlId="message">
                <Form.Control
                  className="rounded-5"
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  maxLength={200}
                />
              </Form.Group>
              <Button className="rounded-4" variant="primary" type="submit">
                Send
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Messages;
