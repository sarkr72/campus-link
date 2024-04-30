import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db } from "../utils/firebase";
import Image from "next/image";

const ChangeChatImageModal = ({ show, handleClose, selectedChat }) => {
  const [chatImage, setChatImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChatImageChange = (event) => {
    const file = event.target.files[0];
    setChatImage(file);
  };

  const handleSaveChatImage = async () => {
    try {
      if (chatImage) {
        // Upload image to storage
        const storageRef = ref(storage, `chatImages/${selectedChat.id}`);
        const uploadTask = uploadBytesResumable(storageRef, chatImage);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading image:", error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Update chat document with new image URL
            const chatRef = doc(db, "chats", selectedChat.id);
            await updateDoc(chatRef, {
              image: downloadURL,
            });

            handleClose();
            setUploadProgress(0);
          }
        );
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
              src={URL.createObjectURL(chatImage)}
              alt="Current Chat Image"
              width={100}
              height={100}
              className="rounded"
            />
          </div>
        )}
        {uploadProgress > 0 && <progress value={uploadProgress} max="100" />}
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
