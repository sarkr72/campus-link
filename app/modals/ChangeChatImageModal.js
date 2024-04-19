import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { ref, uploadString } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db } from "../utils/firebase";
import Image from "next/image";

const ChangeChatImageModal = ({ show, handleClose, selectedChat }) => {
  const [chatImage, setChatImage] = useState(null);

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

        handleClose();
      } else {
        console.error("No image selected");
      }
    } catch (error) {
      console.error("Error saving chat image:", error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Change Chat Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="chatImage">
          <Form.Label>Upload New Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleChatImageChange}
          />
        </Form.Group>
        {chatImage && (
          <div className="text-center mb-3">
            <p className="mb-2">Current Image:</p>
            <Image
              src={chatImage}
              alt="Current Chat Image"
              width={100}
              height={100}
              className="rounded"
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveChatImage}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeChatImageModal;
