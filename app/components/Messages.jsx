import React, { useState, useEffect } from "react";
import { Button, Card, Modal, Form, Dropdown } from "react-bootstrap";
import styles from "/styles/messages.css";
import Image from "next/image";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import { db } from "../utils/firebase";
import postStyles from "/styles/mainTimeline.css";
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
import ChangeChatImageModal from "../modals/ChangeChatImageModal.js";
import ChangeChatNameModal from "../modals/ChangeChatNameModal.js";
import ChatMembersModal from "../modals/ChatMembersModal.js";
import AddUsersToChatModal from "../modals/AddUsersToChatModal.js";
import RemoveUsersFromChatModal from "../modals/RemoveUsersFromChat.js";
import ConversationList from "../modals/ConversationList.js";
import SharedPostModal from "../modals/ViewPostModal.js";

const Messages = ({
  userEmail,
  handleLikePost,
  handlePostComment,
  handleAddComment,
  comment,
  setComment,
  userId,
  imageUrl
}) => {
  const [showSharedPostModal, setShowSharedPostModal] = useState(false);
  const [selectedSharedPost, setSelectedSharedPost] = useState(null);
  const [sharedPost, setSharedPost] = useState(null);
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

  const [chatUsers, setChatUsers] = useState([]);
  const [chatImage, setChatImage] = useState(null);
  const [showChatImageModal, setShowChatImageModal] = useState(false);
  const handleShowChatImageModal = () => setShowChatImageModal(true);
  const handleCloseChatImageModal = () => setShowChatImageModal(false);
  const [newChatName, setNewChatName] = useState("");
  const [showChatNameModal, setShowChatNameModal] = useState(false);
  const handleShowChatNameModal = () => setShowChatNameModal(true);
  const handleCloseChatNameModal = () => setShowChatNameModal(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [chatMembers, setChatMembers] = useState([]);
  const [selectedChatMembers, setSelectedChatMembers] = useState([]);
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  const [showRemoveUsersModal, setShowRemoveUsersModal] = useState(false);

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

        // Set default chat name if not provided
        const selectedUsernames = selectedUserEmails
          .filter((email) => email !== currentUserEmail)
          .map((email) => email.split("@")[0]);
        const chatNameToUse =
          chatName || `Chat with ${selectedUsernames.join(", ")}`;

        // Create a new chat in DB
        const chatDocRef = await addDoc(collection(db, "chats"), {
          users: updatedSelectedUsers.map((user) => user.email),
          name: chatNameToUse,
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

  const handleLeaveChat = async (chat) => {
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
        window.location.reload();
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

      // Fetch chat members
      const chatMembers = [];
      for (const email of chatData.users) {
        const userQuery = query(
          collection(db, "users"),
          where("email", "==", email)
        );
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          userSnapshot.forEach((doc) => {
            const userData = doc.data();
            chatMembers.push({
              name: `${userData.firstName} ${userData.lastName}`,
              profilePicture: userData.profilePicture?.url,
              email: userData.email,
            });
          });
        } else {
          console.log("User data not found for :", email);
        }
      }
      setChatMembers(chatMembers);
    } catch (error) {
      console.error("Error selecting chat: ", error);
    }
  };
  const handleCloseChat = () => {
    setSelectedChat(null);
    console.log("hehe", selectedChat);
    setShowChat(false);
  };
  // Share Post
  const handleShowSharedPostModal = (sharedPostID) => {
    setSelectedSharedPost(sharedPostID);
    setShowSharedPostModal(true);
  };
  const handleCloseSharedPostModal = () => {
    setShowSharedPostModal(false);
    setSelectedSharedPost(null);
  };
  const handleSharePost = (post) => {
    setSharedPost(post);
    setShowSharedPostModal(true);
  };
  // Chat updates
  const handleChatImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setChatImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handleViewMembers = async (chat) => {
    try {
      const members = [];
      for (const email of chat.users) {
        // Fetch user data
        const userQuery = query(
          collection(db, "users"),
          where("email", "==", email)
        );
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          userSnapshot.forEach((doc) => {
            const userData = doc.data();
            members.push({
              name: `${userData.firstName} ${userData.lastName}`,
              profilePicture: userData.profilePicture?.url,
            });
          });
        } else {
          console.log("User data not found for :", email);
        }
      }
      setChatMembers(members);
      setShowMembersModal(true);
    } catch (error) {
      console.error("Error fetching chat members: ", error);
    }
  };
  const handleCloseMembersModal = () => {
    setShowMembersModal(false);
    setChatMembers([]);
  };
  const handleSaveChatImage = async () => {
    try {
      if (chatImage) {
        // Upload image to storage
        const storageRef = ref(storage, `chatImages/${selectedChat.id}`);
        await uploadString(storageRef, chatImage, "data_url");

        // Update chat document with new image URL
        const chatRef = doc(db, "chats", selectedChat.id);
        await updateDoc(chatRef, {
          image: `chatImages/${selectedChat.id}`,
        });

        handleCloseChatImageModal();
      } else {
        console.error("No image selected");
      }
    } catch (error) {
      console.error("Error saving chat image:", error);
    }
  };
  const getChatImage = (chat, currentUser) => {
    if (chat.image) {
      return chat.image;
    } else if (chat.users.length === 2) {
      // If there are exactly two users -> return the profile picture of the other user
      const otherUser = chat.users.find((email) => email !== currentUser.email);
      const otherUserData = users.find((user) => user.email === otherUser);
      return otherUserData
        ? otherUserData.profilePicture?.url || defaultProfilePicture
        : defaultProfilePicture;
    } else {
      // If there are more than two users -> return the default profile picture
      return defaultProfilePicture;
    }
  };
  const handleChangeChatName = (chat) => {
    setNewChatName(chat.name);
    setSelectedChat(chat);
    setShowChatNameModal(true);
  };
  const handleSaveChatName = async () => {
    try {
      const chatRef = doc(db, "chats", selectedChat.id);
      await updateDoc(chatRef, {
        name: newChatName,
      });
      setSelectedChat((prevSelectedChat) => ({
        ...prevSelectedChat,
        name: newChatName,
      }));

      handleCloseChatNameModal();
    } catch (error) {
      console.error("Error updating chat name: ", error);
    }
  };
  const handleAddUserToChat = (chat) => {
    setSelectedChat(chat);
    setShowAddUsersModal(true);
  };
  const handleCloseAddUsersModal = () => {
    setShowAddUsersModal(false);
  };
  const handleAddUsers = async () => {
    try {
      const updatedUsers = [...selectedChat.users, ...selectedUsers];
      await updateDoc(doc(db, "chats", selectedChat.id), {
        users: updatedUsers,
      });
      handleClose();
    } catch (error) {
      console.error("Error adding users to chat: ", error);
    }
  };
  const handleShowRemoveUsersModal = (chat) => {
    setSelectedChat(chat);
    setShowRemoveUsersModal(true);
  };
  const handleCloseRemoveUsersModal = () => {
    setShowRemoveUsersModal(false);
  };

  return (
    <div>
      <div className="convo-container">
        <div className="conversations-container-mobile">
          <ConversationList chats={chats} handleChatSelect={handleChatSelect} />
        </div>
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
                src={getChatImage(chat, currentUser.email)}
                alt="Profile Pic"
                width={50}
                height={50}
                className="rounded-circle me-2 profile-pic"
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
                      className="text-success"
                      onClick={() => handleViewMembers(chat)}
                    >
                      View Members
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="text-success"
                      onClick={() => handleAddUserToChat(chat)}
                    >
                      Add User to Chat
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="text-info"
                      onClick={handleShowChatImageModal}
                    >
                      Change Chat Image
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="text-info"
                      onClick={() => handleChangeChatName(chat)}
                    >
                      Change Chat Name
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="text-danger"
                      onClick={() => handleShowRemoveUsersModal(chat)}
                    >
                      Remove User from Chat
                    </Dropdown.Item>
                    <Dropdown.Item
                      key={`leave-${chat.id}`}
                      className="text-danger"
                      onClick={() => handleLeaveChat(chat)}
                    >
                      Leave Chat
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
                          message.senderProfilePicture ||
                          message.senderProfilePicture.src ||
                          defaultProfilePicture
                        }
                        alt="Profile Pic"
                        className="message-avatar profile-pic"
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
                          {message.sharedPostID && (
                            <div
                              className="shared-post-link"
                              onClick={() =>
                                handleShowSharedPostModal(message.sharedPostID)
                              }
                            >
                              <p className="shared-Post rounded-4">
                                Click Here to See Attached Post
                              </p>
                            </div>
                          )}
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
              {users.map((user, index) => (
                <Card key={`${user.email}-${index}`} className="mb-2">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "5px" }}
                    >
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
      {/* Other Modals */}
      <ChatMembersModal
        show={showMembersModal}
        handleClose={handleCloseMembersModal}
        members={chatMembers}
      />
      <SharedPostModal
        show={showSharedPostModal}
        onHide={handleCloseSharedPostModal}
        postId={selectedSharedPost}
        handleLikePost={handleLikePost}
        handleAddComment={handleAddComment}
        handlePostComment={handlePostComment}
        comment={comment}
        setComment={setComment}
        userId={userId}
        imageUrl={imageUrl}
      />
      <ChangeChatImageModal
        show={showChatImageModal}
        handleClose={handleCloseChatImageModal}
        selectedChat={selectedChat}
      />
      <ChangeChatNameModal
        show={showChatNameModal}
        handleClose={handleCloseChatNameModal}
        newChatName={newChatName}
        setNewChatName={setNewChatName}
        handleSaveChatName={handleSaveChatName}
      />
      <AddUsersToChatModal
        show={showAddUsersModal}
        handleClose={handleCloseAddUsersModal}
        users={users}
        chatUsers={chatUsers}
        setChatUsers={setChatUsers}
        selectedChat={selectedChat}
      />
      <RemoveUsersFromChatModal
        show={showRemoveUsersModal}
        handleClose={handleCloseRemoveUsersModal}
        users={users}
        setChatUsers={setChatUsers}
        chatUsers={chatMembers}
        selectedChat={selectedChat}
      />
    </div>
  );
};
export default Messages;
