import styles from "/styles/mainTimeline.css";
import React, { useState, useEffect } from "react";
import { Button, Card, Modal, Form, Dropdown } from "react-bootstrap";
import Image from "next/image";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import likeIcon from "../resources/images/like.svg";
import dislikeIcon from "../resources/images/dislike.svg";
import shareIcon from "../resources/images/share.svg";
import { db } from "../utils/firebase";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  orderBy,
  updateDoc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";



const ViewPost = ({
  viewCommentsModalShow,
  handleCloseViewCommentsModal,
  selectedPost,
  userRole,
  imageUrl,
  setComment,
  handlePostComment,
  comment,
  handleLikePost,
}) => {
  const [localComment, setLocalComment] = useState("");
  const [viewLocalComment, setViewLocalComment] = useState("");
  const [wholeCmt, setWholeCmt] = useState("");
  const handleCom = () => {
    setViewLocalComment(localComment);
  };
  const [user, setUser] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc?.data();
            setUser(userData);
            const username = user?.email.split("@")[0];
            setUsername(username);
          }
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      <Modal
        show={viewCommentsModalShow}
        onHide={handleCloseViewCommentsModal}
        className="modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Post and Comments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPost && (
            <Card key={selectedPost.id} className="mb-3">
              <Card.Header className="post-header">
                <div className="profile-info">
                  <Image
                    src={
                      selectedPost.userProfilePicture || defaultProfilePicture
                    }
                    alt="Profile Picture"
                    className="profile-pic"
                    width={50}
                    height={50}
                  />
                  <p className="poster-username">{selectedPost.username}</p>
                </div>
                <Dropdown className="post-action-dropdown">
                  <Dropdown.Toggle className="post-options">
                    <span style={{ fontSize: "1.5em" }}>•••</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {userRole.toLocaleLowerCase() === "admin" && (
                      <Dropdown.Item
                        onClick={() => handleDeletePost(selectedPost.id)}
                        className="text-danger"
                      >
                        <strong>Delete Post</strong>
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item className="text-warning">
                      <strong>Report Post</strong>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Header>
              <Card.Body className="post-body">
                <Card.Text className="post-comment">
                  {selectedPost.comment}
                </Card.Text>
                {selectedPost.image && (
                  <div className="post-img">
                    <Image
                      className="post-img"
                      src={selectedPost.image}
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
              <Card.Footer className="post-footer">
                <div className="post-footer-icons">
                  {handleLikePost && (
                    <>
                     <Button className="social-btn rounded-5" variant="btn">
                    <Image
                      onClick={() => handleLikePost(selectedPost.id, "like")}
                      className="social-btn-icon"
                      src={likeIcon}
                      alt="Discussion Board Icon"
                      width={20}
                      height={20}
                    />{" "}
                    Likes (
                    {(selectedPost.likedBy?.length || 0) -
                      (selectedPost.dislikedBy?.length || 0)}
                    )
                    <Image
                      onClick={() => handleLikePost(selectedPost.id, "dislike")}
                      className="social-btn-icon"
                      src={dislikeIcon}
                      alt="Discussion Board Icon"
                      width={20}
                      height={20}
                    />{" "}
                  </Button>
                    </>
                  )}
                 
                  <Button className="social-btn rounded-5" variant="btn">
                    <Image
                      className="social-btn-icon"
                      src={shareIcon}
                      alt="Discussion Board Icon"
                      width={20}
                      height={20}
                    />{" "}
                    Share
                  </Button>
                </div>
                {/* Add comment section */}
              
                   <div>
                   <Form className="comment-prompt rounded-5">
                     <Image
                       src={imageUrl || defaultProfilePicture}
                       alt="Profile Picture"
                       className="profile-pic"
                       width={50}
                       height={50}
                     />
                     {setComment && (
                       <Form.Control
                       className="rounded-5"
                       type="text"
                       placeholder="Add a comment..."
                       value={comment} 
                       onChange={(e) => {
                         setComment(e.target.value),
                           setLocalComment(e.target.value);
                       }}
                     />
                     )}
                     {handlePostComment &&(
                       <Button
                       className="rounded-5"
                       onClick={() => {
                         handlePostComment(
                           selectedPost.id,
                           selectedPost?.userId
                         ),
                           handleCom();
                       }}
                     >
                       Post
                     </Button>
                     )}
                     
                   </Form>
                 </div>
             
               
                {/* Display comments */}
                <div className="comment-section">
                  <h5>Comments:</h5>

                  {selectedPost.comments &&
                    selectedPost.comments.map((comment, index) => (
                      <>
                        <div key={index} className="comment rounded-5">
                          <div className="profile-info">
                            <Image
                              src={
                                comment.userProfilePicture ||
                                defaultProfilePicture
                              }
                              alt="Profile Picture"
                              className="profile-pic"
                              width={50}
                              height={50}
                            />
                            <p className="poster-username"  style={{fontWeight: "bold"}}>
                              {comment.username}
                            </p>
                          </div>
                          <p className="comment-text" >{comment.text}</p>
                        </div>
                      </>
                    ))}
                  {viewLocalComment && localComment && (
                    <div className="comment rounded-5">
                      <div className="profile-info" style={{display: 'flex'}}>
                        <Image
                          src={
                            user?.profilePicture?.url || defaultProfilePicture
                          }
                          alt="Profile Picture"
                          className="profile-pic"
                          width={50}
                          height={50}
                          style={{alignSelf: "flex-start"}}
                        />
                        <p className="poster-username" style={{fontWeight: "bold"}}>{username}</p>
                      </div>
                      <p className="comment-text">{localComment}</p>
                    </div>
                  )}
                </div>
              </Card.Footer>
            </Card>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ViewPost;
