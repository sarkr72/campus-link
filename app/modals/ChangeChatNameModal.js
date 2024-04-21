import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ChangeChatNameModal = ({
  show,
  handleClose,
  newChatName,
  setNewChatName,
  handleSaveChatName,
}) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Change Chat Name</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="newChatName">
          <Form.Label>New Chat Name: </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter new chat name"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveChatName}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeChatNameModal;
