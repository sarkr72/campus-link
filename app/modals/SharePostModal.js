import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const SharePostModal = ({ show, onHide, onSharePost, chats, currentUser }) => {
  const [selectedChats, setSelectedChats] = useState([]);
  const [userMessage, setUserMessage] = useState("");

  const handleSharePost = () => {
    onSharePost(selectedChats, userMessage);
    setSelectedChats([]);
    setUserMessage("");
  };

  const handleCheckboxChange = (chat) => {
    if (selectedChats.includes(chat)) {
      setSelectedChats(selectedChats.filter((c) => c !== chat));
    } else {
      setSelectedChats([...selectedChats, chat]);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Share Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {chats.length > 0 ? (
          <Form>
            {chats.map((chat) => (
              <div key={chat.id} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id={`share-${chat.id}`}
                  label={chat.name}
                  checked={selectedChats.includes(chat)}
                  onChange={() => handleCheckboxChange(chat)}
                />
              </div>
            ))}
          </Form>
        ) : (
          <p>You don not have any chats available.</p>
        )}
        <Form.Group controlId="userMessage">
          <Form.Label>Your Message</Form.Label>
          <Form.Control
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Enter your message (optional)"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSharePost}
          disabled={selectedChats.length === 0}
        >
          Share
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SharePostModal;
