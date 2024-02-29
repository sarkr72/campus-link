import styles from "/styles/mainTimeline.css";
import React, { useState } from "react";
import { Button, Card, Modal, Form } from "react-bootstrap";
import Image from "next/image";

const MainTimelineFeed = () => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postComment, setPostComment] = useState("");
  const [postImage, setPostImage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState(Array(posts.length).fill(0));
  const [likedByUser, setLikedByUser] = useState(
    Array(posts.length).fill(false)
  );

  const handleCreatePost = () => {
    const newPost = {
      title: postTitle,
      comment: postComment,
      image: postImage,
    };

    setPosts([...posts, newPost]);
    setLikes([...likes, 0]);
    setLikedByUser([...likedByUser, false]);

    setPostTitle("");
    setPostComment("");
    setShowCreatePostModal(false);
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePost = (index) => {
    const updatedPosts = [...posts];
    updatedPosts.splice(index, 1);

    const updatedLikes = [...likes];
    updatedLikes.splice(index, 1);

    const updatedLikedByUser = [...likedByUser];
    updatedLikedByUser.splice(index, 1);

    setPosts(updatedPosts);
    setLikes(updatedLikes);
    setLikedByUser(updatedLikedByUser);
  };

  const handleLikePost = (index) => {
    if (!likedByUser[index]) {
      const updatedLikes = [...likes];
      updatedLikes[index]++;
      setLikes(updatedLikes);

      const updatedLikedByUser = [...likedByUser];
      updatedLikedByUser[index] = true;
      setLikedByUser(updatedLikedByUser);
    }
  };

  return (
    <div className={`timeLine-container ${styles.mainTimeline}`}>
      <div className="col-md-3 left-box">
        <p>Quicklinks</p>
        <p>Calendar Link</p>
        <p>Tutors</p>
        <p>Other features</p>
      </div>

      <div className="col-md-6 center-box">
        <div className="createPostPrompt shadow-sm border rounded-5 p-3 bg-white shadow box-area">
          <p>Share what&apos;s on your mind</p>
          <Button
            variant="primary"
            onClick={() => setShowCreatePostModal(true)}
          >
            Create Post
          </Button>
        </div>

        <div className="feed">
          {posts.map((post, index) => (
            <Card key={index} className="mb-3">
              <Card.Header className="post-header">
                <div className="profile-info">
                  {/* Profile pic */}
                  {/*<img
                  src= 
                  alt="Profile pic"
                  className="profile-pic"
                />*/}
                  <strong>{/* Username goes here */}Username</strong>
                </div>
                <div className="post-title">
                  <p>{post.title}</p>
                </div>
              </Card.Header>
              <Card.Body className="post-body">
                <Card.Text className="post-comment">{post.comment}</Card.Text>
                {post.image && (
                  <div className="post-img">
                    <Image
                      src={post.image}
                      alt="Post Image"
                      width={200}
                      height={200}
                      layout="responsive"
                      objectFit="contain"
                      onError={(e) => console.error("Image failed to load", e)}
                    />
                  </div>
                )}
              </Card.Body>
              <Card.Footer className="post-footer">
                <Button
                  variant="btn"
                  onClick={() => handleLikePost(index)}
                >
                  Like ({likes[index]})
                </Button>
                <Button variant="btn">Comment</Button>
                <Button variant="btn">Share</Button>
                <Button
                  variant="btn"
                  onClick={() => handleDeletePost(index)}
                >
                  Delete
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      </div>

      <div className="col-md-3 right-box">
        <p>Contacts</p>
        <p>FriendRequests</p>
        <p>RecentActivity</p>
        <p>Notifications</p>
      </div>

      <Modal
        show={showCreatePostModal}
        onHide={() => setShowCreatePostModal(false)}
        className="createPostTemplate"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="postTitle">
              <Form.Label>Post Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter post title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="postComment">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="What's on your mind?"
                value={postComment}
                onChange={(e) => setPostComment(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="postImage">
              <Form.Label>Choose Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="createPost-btn"
            variant="primary"
            onClick={handleCreatePost}
          >
            Post
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MainTimelineFeed;
