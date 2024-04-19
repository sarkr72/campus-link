import React from "react";
import { Modal, Card } from "react-bootstrap";
import Image from "next/image";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";

const SharedPostModal = ({ show, onHide, sharedPost }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Shared Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {sharedPost && (
          <Card className="mb-3">
            <Card.Header className="post-header">
              <div className="profile-info">
                <Image
                  src={sharedPost.userProfilePicture || defaultProfilePicture}
                  alt="Profile Picture"
                  className="profile-pic"
                  width={50}
                  height={50}
                />
                <p className="poster-username">{sharedPost.username}</p>
              </div>
            </Card.Header>
            <Card.Body className="post-body">
              <Card.Text className="post-comment">
                {sharedPost.comment}
              </Card.Text>
              {sharedPost.image && (
                <div className="post-img">
                  <Image
                    className="post-img"
                    src={sharedPost.image}
                    alt="Post Image"
                    width={200}
                    height={200}
                    priority
                    style={{ filter: "brightness(90%)" }}
                    onError={(e) => console.error("Image failed to load", e)}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SharedPostModal;
