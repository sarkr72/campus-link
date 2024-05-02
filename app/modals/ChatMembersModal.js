import React from "react";
import { Modal, Button, Image } from "react-bootstrap";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import styles from "/styles/modal.css";

const ChatMembersModal = ({ show, handleClose, members }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className="d-flex justify-content-center" closeButton>
        <Modal.Title>Chat Members</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul className="member-list">
          {members.map((member) => (
            <li key={member.email} className="members mb-2">
              <Image
                src={member?.profilePicture || defaultProfilePicture}
                alt="Profile Pic"
                width={50}
                height={50}
                className="rounded-circle member-profile-pic"
              />
              <span>{member.name || member.email}</span>
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center modal-btn-danger">
        <Button variant="danger" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChatMembersModal;
