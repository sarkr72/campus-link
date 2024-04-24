import React, { useState, useEffect } from "react";
import { Modal, Card, Button, Form, Dropdown } from "react-bootstrap";
import Image from "next/image";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import likeIcon from "../resources/images/like.svg";
import dislikeIcon from "../resources/images/dislike.svg";
import shareIcon from "../resources/images/share.svg";
import { db } from "../utils/firebase";
import Link from "next/link";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import styles from "/styles/mainTimeline.css";

const SharedPostModal = ({
  show,
  onHide,
  postId,
  handleLikePost,
  handleAddComment,
  handlePostComment,
  comment,
  setComment,
  userId,
  imageUrl,
}) => {
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handlePostNewComment = () => {
    if (commentText.trim() !== "") {
      handleAddComment(postId, commentText);
      handlePostComment(postId, commentText);
      setCommentText("");
    }
  };

  const fetchPost = async () => {
    if (postId) {
      console.log(postId);
      try {
        const postRef = doc(db, "posts", postId);
        const postSnapshot = await getDoc(postRef);
        if (postSnapshot.exists()) {
          const postData = { ...postSnapshot.data(), id: postSnapshot.id };
          setPost(postData);
        } else {
          console.log("Post not found!");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    }
  };
  useEffect(() => {
    fetchPost();
  }, [postId]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Shared Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {post && (
          <Card>
            <Card.Header className="post-header">
              <div className="profile-info">
                <Image
                  src={post.userProfilePicture || defaultProfilePicture}
                  alt="Profile Picture"
                  className="profile-pic"
                  width={50}
                  height={50}
                />
                <p className="poster-username">{post.username}</p>
              </div>
              <Card.Title>{post.title}</Card.Title>
            </Card.Header>
            <Card.Body className="post-body">
              <Card.Text className="post-comment">{post.comment}</Card.Text>
              {post.image && (
                <div className="post-img">
                  <Image
                    className="post-img"
                    src={post.image}
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
                <Button className="social-btn rounded-5">
                  Likes ({post.likedBy?.length}
                  )
                  <Image
                    // onClick={() => handleLikePost(post.id, "like")}
                    className="social-btn-icon"
                    src={likeIcon}
                    alt="Discussion Board Icon"
                    width={20}
                    height={20}
                  />{" "}
                </Button>
                <Button className="social-btn rounded-5">
                  Dislikes ({post.dislikedBy?.length}
                  )
                  <Image
                    // onClick={() => handleLikePost(post.id, "dislike")}
                    className="social-btn-icon"
                    src={dislikeIcon}
                    alt="Discussion Board Icon"
                    width={20}
                    height={20}
                  />{" "}
                </Button>
              </div>
              {/* <div>
                <Form className="comment-prompt rounded-5">
                  <Image
                    src={post.userProfilePicture || defaultProfilePicture}
                    alt="Profile Picture"
                    className="profile-pic"
                    width={50}
                    height={50}
                  />
                  <Form.Control
                    className="rounded-5"
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button className="rounded-4" onClick={handlePostNewComment}>
                    Post
                  </Button>
                </Form>
              </div> */}
              {/* Display comments */}
              <div className="comment-section">
              <hr></hr>
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment, index) => (
                    <div key={index} className="comment rounded-5">
                      <div className="profile-info">
                        <Image
                          src={
                            comment.userProfilePicture || defaultProfilePicture
                          }
                          alt="Profile Picture"
                          className="profile-pic"
                          width={50}
                          height={50}
                        />
                        <div className="comment-info">
                          <div className="comment-header">
                            <p className="comment-user">{comment.username}</p>
                            <p className="comment-timestamp">
                              {comment.timestamp &&
                                comment.timestamp.toDate().toLocaleString()}
                            </p>
                          </div>
                          <p className="comment-text">{comment.text}</p>
                          <div className="comment-likes"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No comments yet</p>
                )}
              </div>
            </Card.Footer>
          </Card>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SharedPostModal;
