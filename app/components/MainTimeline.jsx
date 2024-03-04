import styles from "/styles/mainTimeline.css";
import React, { useState, useEffect } from "react";
import { Button, Card, Modal, Form, Dropdown } from "react-bootstrap";
import Image from "next/image";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import likeIcon from "../resources/images/like.svg";
import commentIcon from "../resources/images/comment.svg";
import shareIcon from "../resources/images/share.svg";
import { db } from "../../firebase";

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
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const MainTimelineFeed = () => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [content, setContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [likedByUser, setLikedByUser] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState("");
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    email: "",
    profilePicture: "",
  });
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleCreatePost = async () => {
    const newPost = {
      username: user.email ? user.email.split("@")[0] : "",
      userProfilePicture: imageUrl,
      comment: content,
      image: postImage,
      creationTime: new Date(),
      likes: 0,
      likedBy: [],
    };

    // Save the new post to Firestore
    const postsCollection = collection(db, "posts");
    const docRef = await addDoc(postsCollection, newPost);

    // Update the local state
    setPosts([{ ...newPost, id: docRef.id }, ...posts]);
    setLikes([...likes, 0]);
    setLikedByUser([...likedByUser, false]);

    // Clear input fields and close the modal
    setContent("");
    setPostImage("");
    setShowCreatePostModal(false);
  };
    // Store image post
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result);
      };
      reader.readAsDataURL(file);
      const storage = getStorage();
      const storageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      setPostImage(imageUrl);
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

  const handleLikePost = async (index) => {
    try {
      const post = posts[index];
      const postId = post.id;

      // Check if the user already liked the post
      if (!likedByUser[index]) {
        // Increment likes
        const updatedLikes = [...likes];
        updatedLikes[index]++;
        setLikes(updatedLikes);

        // Update likedByUser state
        const updatedLikedByUser = [...likedByUser];
        updatedLikedByUser[index] = true;
        setLikedByUser(updatedLikedByUser);

        // Add the user to the list of users who liked the post in Firestore
        const likedUsersRef = doc(db, "posts", postId);
        await updateDoc(likedUsersRef, {
          likedBy: [...post.likedBy, userId],
        });
      } else {
        // Decrement likes if the user already liked the post
        const updatedLikes = [...likes];
        updatedLikes[index]--;
        setLikes(updatedLikes);

        // Update likedByUser state
        const updatedLikedByUser = [...likedByUser];
        updatedLikedByUser[index] = false;
        setLikedByUser(updatedLikedByUser);

        // Remove the user from the list of users who liked the post in Firestore
        const likedUsersRef = doc(db, "posts", postId);
        await updateDoc(likedUsersRef, {
          likedBy: post.likedBy.filter((id) => id !== userId),
        });
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };
  const fetchPosts = async () => {
    try {
      const postsCollection = collection(db, "posts");
      const postsQuery = query(
        postsCollection,
        orderBy("creationTime", "desc")
      );

      const querySnapshot = await getDocs(postsQuery);

      const fetchedPosts = [];
      const fetchedLikes = [];
      const fetchedLikedByUser = [];

      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        fetchedPosts.push({ ...postData, id: doc.id });
        fetchedLikes.push(postData.likes || 0);
        fetchedLikedByUser.push(false);
      });

      setPosts(fetchedPosts);
      setLikes(fetchedLikes);
      setLikedByUser(fetchedLikedByUser);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [currentUser, setCurrentUser] = useState({
    email: null,
    profilePicture: null,
  });

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const email = await getUserEmailById(user.uid);
        setEmail(user.email);
        if (email) {
          const response = await fetch(`/api/users/${email}`, {
            cache: "no-store",
          });
          if (response.ok) {
            const data = await response.json();
            setData((prevData) => ({
              ...prevData,
              email: data.email,
              profilePicture: data.profilePicture,
            }));

            setUser(data);
            const usersCollection = collection(db, "users");
            const userQuery = query(
              usersCollection,
              where("email", "==", email)
            );
            const querySnapshot = await getDocs(userQuery);

            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              if (userData.image && userData.image.url) {
                setImageUrl(userData.image.url);
              }
            });
          } else {
            console.log("Failed to fetch user data", response);
          }
          fetchPosts();
        }
      }
    });
  }, []);
  const getUserEmailById = async (userId) => {
    try {
      console.log("id: ", userId);
      const userDocRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const userEmail = userData.email;
        setCurrentEmail(userEmail);
        return userEmail;
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error retrieving user email:", error);
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
          <div className="prompt-info">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Profile pic"
                className="profile-pic"
                width={50}
                height={50}
              />
            ) : (
              <Image
                src={defaultProfilePicture}
                alt="Default profile pic"
                className="default-profile-pic"
                width={50}
                height={50}
              />
            )}
            <p className="poster-username">
              What&apos;s on your mind{" "}
              {user.email ? user.email.split("@")[0] : ""}?{" "}
            </p>
          </div>

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
                  {imageUrl ? (
                    <Image
                      src={post.userProfilePicture}
                      alt="Profile pic"
                      className="profile-pic"
                      width={50}
                      height={50}
                    />
                  ) : (
                    <Image
                      src={defaultProfilePicture}
                      alt="Default profile pic"
                      className="default-profile-pic"
                      width={50}
                      height={50}
                    />
                  )}
                  <p className="poster-username">{post.username}</p>
                </div>
                <Dropdown className="post-action-dropdown">
                  <Dropdown.Toggle className="post-options">
                    <span style={{ fontSize: "1.5em" }}>•••</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => handleDeletePost(index)}
                      className="text-danger"
                    >
                      <strong>Delete Post</strong>
                    </Dropdown.Item>
                    <Dropdown.Item className="text-warning">
                      <strong>Report Post</strong>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
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
                <Button
                  className="social-btn"
                  variant="btn"
                  onClick={() => handleLikePost(index)}
                >
                  <Image
                    className="social-btn-icon"
                    src={likeIcon}
                    alt="Discussion Board Icon"
                    width={20}
                    height={20}
                  />{" "}
                  Like ({likes[index]})
                </Button>

                <Button className="social-btn" variant="btn">
                  <Image
                    className="social-btn-icon"
                    src={commentIcon}
                    alt="Discussion Board Icon"
                    width={20}
                    height={20}
                  />{" "}
                  Comment
                </Button>
                <Button className="social-btn" variant="btn">
                  <Image
                    className="social-btn-icon"
                    src={shareIcon}
                    alt="Discussion Board Icon"
                    width={20}
                    height={20}
                  />{" "}
                  Share
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
            <Form.Group controlId="content">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
