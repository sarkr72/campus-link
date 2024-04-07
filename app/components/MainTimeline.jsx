import styles from "/styles/mainTimeline.css";
import React, { useState, useEffect } from "react";
import { Button, Card, Modal, Form, Dropdown } from "react-bootstrap";
import Image from "next/image";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import likeIcon from "../resources/images/like.svg";
import dislikeIcon from "../resources/images/dislike.svg";
import commentIcon from "../resources/images/comment.svg";
import shareIcon from "../resources/images/share.svg";
import { db } from "../utils/firebase";
import Link from "next/link";
import { useRouter } from "next/router";
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SearchPage from "./SearchUsers";

const MainTimelineFeed = ({ userEmail }) => {
  // const router = useRouter();
  const [sortBy, setSortBy] = useState("recent");
  const [userRole, setUserRole] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [viewCommentsModalShow, setViewCommentsModalShow] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostComments, setSelectedPostComments] = useState([]);
  const [comment, setComment] = useState("");
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [content, setContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [dislikedByUser, setDislikedByUser] = useState([]);
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
      email: user.email,
      username: user.email ? user.email.split("@")[0] : "",
      userProfilePicture: imageUrl,
      comment: content,
      image: postImage,
      creationTime: Timestamp.now(),
      likes: 0,
      likedBy: [],
      dislikes: 0,
      dislikedBy: [],
      comments: [],
    };

    // Save the new post to Firestore
    const postsCollection = collection(db, "posts");
    const docRef = await addDoc(postsCollection, newPost);

    // Update the local state
    setPosts([{ ...newPost, id: docRef.id }, ...posts]);
    setLikes([...likes, 0]);
    setLikedByUser([...likedByUser, false]);
    setDislikes([...dislikes, 0]);
    setDislikedByUser([...dislikedByUser, false]);
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
  // Delete Posts, eventually should be changed so that only admin can delete posts
  const handleDeletePost = async (postId) => {
    try {
      // Remove the post document from Firestore
      await deleteDoc(doc(db, "posts", postId));

      // Update the local state to remove the deleted post
      const updatedPosts = posts.filter((post) => post.id !== postId);
      const updatedLikes = likes.filter(
        (like, index) => posts[index].id !== postId
      );
      const updatedLikedByUser = likedByUser.filter(
        (liked, index) => posts[index].id !== postId
      );

      setPosts(updatedPosts);
      setLikes(updatedLikes);
      setLikedByUser(updatedLikedByUser);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleLikePost = async (postId, reactionType) => {
    try {
      const postIndex = posts.findIndex((post) => post.id === postId);
      const post = posts[postIndex];
      let updatedPosts = [...posts];
      let updatedPost = { ...post };

      // Initialize likedBy and dislikedBy arrays if they are undefined
      if (!updatedPost.likedBy) updatedPost.likedBy = [];
      if (!updatedPost.dislikedBy) updatedPost.dislikedBy = [];

      if (reactionType === "like") {
        if (!updatedPost.likedBy.includes(userId)) {
          // If the user's ID is not present in likedBy array, add it
          updatedPost.likedBy.push(userId);
          // Remove user's ID from dislikedBy array if present
          updatedPost.dislikedBy = updatedPost.dislikedBy.filter(
            (dislikedUserId) => dislikedUserId !== userId
          );
        } else {
          // If the user's ID is already present in likedBy array, remove it
          updatedPost.likedBy = updatedPost.likedBy.filter(
            (likedUserId) => likedUserId !== userId
          );
        }
      } else if (reactionType === "dislike") {
        if (!updatedPost.dislikedBy.includes(userId)) {
          // If the user's ID is not present in dislikedBy array, add it
          updatedPost.dislikedBy.push(userId);
          // Remove user's ID from likedBy array if present
          updatedPost.likedBy = updatedPost.likedBy.filter(
            (likedUserId) => likedUserId !== userId
          );
        } else {
          // If the user's ID is already present in dislikedBy array, remove it
          updatedPost.dislikedBy = updatedPost.dislikedBy.filter(
            (dislikedUserId) => dislikedUserId !== userId
          );
        }
      }

      // Update the likes and dislikes count in the updated post object
      updatedPost.likes = updatedPost.likedBy.length;
      updatedPost.dislikes = updatedPost.dislikedBy.length;

      // Update the likedBy and dislikedBy arrays in Firestore
      await updateDoc(doc(db, "posts", postId), {
        likedBy: updatedPost.likedBy,
        dislikedBy: updatedPost.dislikedBy,
        likes: updatedPost.likes,
        dislikes: updatedPost.dislikes,
      });

      // Update the local state
      updatedPosts[postIndex] = updatedPost;
      setPosts(updatedPosts);
      setLikedByUser({
        ...likedByUser,
        [postId]: updatedPost.likedBy.includes(userId),
      });
      setDislikedByUser({
        ...dislikedByUser,
        [postId]: updatedPost.dislikedBy.includes(userId),
      });
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  // Fetch posts function
  const fetchPosts = async (userEmail) => {
    try {
      const postsCollection = collection(db, "posts");
      let postsQuery = query(postsCollection);
      if (userEmail) {
        postsQuery = query(postsQuery, where("email", "==", userEmail));
      }
      if (sortBy === "likes") {
        postsQuery = query(postsQuery, orderBy("likes", "desc"));
      } else if (sortBy === "dislikes") {
        postsQuery = query(postsQuery, orderBy("dislikes", "desc"));
      } else if (sortBy === "oldest") {
        postsQuery = query(postsQuery, orderBy("creationTime", "asc"));
      } else {
        postsQuery = query(postsQuery, orderBy("creationTime", "desc"));
      }

      const querySnapshot = await getDocs(postsQuery);

      // Process fetched posts
      const fetchedPosts = [];
      const fetchedLikes = [];
      const fetchedLikedByUser = [];
      const fetchedDislikes = [];
      const fetchedDislikedByUser = [];

      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        fetchedPosts.push({ ...postData, id: doc.id });
        fetchedLikes.push(postData.likedBy ? postData.likedBy.length : 0);
        fetchedDislikes.push(
          postData.dislikedBy ? postData.dislikedBy.length : 0
        );
        // Check if the current user has liked or disliked the post
        const userLiked = postData.likedBy && postData.likedBy.includes(userId);
        const userDisliked =
          postData.dislikedBy && postData.dislikedBy.includes(userId);
        fetchedLikedByUser.push(userLiked);
        fetchedDislikedByUser.push(userDisliked);
      });

      // Update state with fetched posts
      setPosts(fetchedPosts);
      setLikes(fetchedLikes);
      setDislikes(fetchedDislikes);
      setLikedByUser(fetchedLikedByUser);
      setDislikedByUser(fetchedDislikedByUser);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (option) => {
    setSortBy(option);
  };

  const handleViewComments = async (postId) => {
    try {
      const postRef = doc(db, "posts", postId);
      const postSnapshot = await getDoc(postRef);
      const postData = postSnapshot.data();
      setSelectedPost({ ...postData, id: postSnapshot.id });

      if (postData.comments) {
        setSelectedPostComments(postData.comments);
      }
      setShowAllComments(true);
      setViewCommentsModalShow(true);
    } catch (error) {
      console.error("Error fetching post and comments:", error);
    }
  };

  // Render comments
  const renderComments = () => {
    if (showAllComments) {
      return post.comments.map((comment, index) => (
        <div key={index} className="comment rounded-5"></div>
      ));
    } else {
      return post.comments
        .slice(0, 2)
        .map((comment, index) => (
          <div key={index} className="comment rounded-5"></div>
        ));
    }
  };

  const handleCloseViewCommentsModal = () => {
    setViewCommentsModalShow(false);
    setSelectedPost(null);
    setSelectedPostComments([]);
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      const post = posts.find((post) => post.id === postId);
      if (!post) {
        console.error(`Post with ID ${postId} not found`);
        return;
      }
      // Initialize comments as an array if it's undefined
      if (!Array.isArray(post.comments)) {
        post.comments = [];
      }
      const comment = {
        text: commentText,
        userId: userId,
        email: user.email,
        username: user.email ? user.email.split("@")[0] : "",
        userProfilePicture: imageUrl,
        timestamp: Timestamp.now(),
      };
      // Update the post document in Firestore with the new comment
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: [...post.comments, comment],
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Function to handle posting comments
  const handlePostComment = async (postId) => {
    if (comment.trim() !== "") {
      await handleAddComment(postId, comment);
      setComment("");
      fetchPosts();
    }
  };
  // Note: does not work just yet
  const handleLikeComment = async (commentId, reactionType) => {
    try {
      const commentRef = doc(db, "comments", commentId);
      const commentDoc = await getDoc(commentRef);
      if (commentDoc.exists()) {
        const commentData = commentDoc.data();

        // Check if the necessary fields exist and initialize them if they don't
        if (!commentData.likes) {
          commentData.likes = 0;
        }
        if (!commentData.dislikes) {
          commentData.dislikes = 0;
        }
        if (!commentData.likedBy) {
          commentData.likedBy = [];
        }
        if (!commentData.dislikedBy) {
          commentData.dislikedBy = [];
        }

        // Update like/dislike arrays and counts based on reactionType
        if (reactionType === "like") {
          if (!commentData.likedBy) {
            commentData.likedBy = [];
          }
          if (!commentData.likedBy.includes(userId)) {
            commentData.likedBy.push(userId);
            const dislikedIndex = commentData.dislikedBy?.indexOf(userId);
            if (dislikedIndex !== undefined && dislikedIndex !== -1) {
              commentData.dislikedBy.splice(dislikedIndex, 1); // Remove from dislikedBy if present
            }
            commentData.likes++;
          }
        } else if (reactionType === "dislike") {
          if (!commentData.dislikedBy) {
            commentData.dislikedBy = [];
          }
          if (!commentData.dislikedBy.includes(userId)) {
            commentData.dislikedBy.push(userId);
            const likedIndex = commentData.likedBy?.indexOf(userId);
            if (likedIndex !== undefined && likedIndex !== -1) {
              commentData.likedBy.splice(likedIndex, 1); // Remove from likedBy if present
            }
            commentData.dislikes++;
          }
        }

        // Update the comment document in Firestore
        await updateDoc(commentRef, {
          likes: commentData.likes,
          dislikes: commentData.dislikes,
          likedBy: commentData.likedBy,
          dislikedBy: commentData.dislikedBy,
        });
      } else {
        console.error("Comment document not found");
      }
    } catch (error) {
      console.error("Error handling like/dislike for comment:", error);
    }
  };

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const email = await getUserEmailById(user.uid);
        setEmail(user.email);

        if (user.email) {
          const usersCollection = collection(db, "users");
          const userQuery = query(usersCollection, where("email", "==", email));
          const querySnapshot = await getDocs(userQuery);

          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData) {
              setData({
                email: userData?.email,
                profilePicture: userData?.profilePicture?.url,
              });
              setImageUrl(userData?.profilePicture?.url);
              setUser(user);
              setUserRole(userData?.role || "");
            }
          });
        } else {
          console.log("Failed to fetch user data", response);
        }
        fetchPosts(userEmail); // Pass the userEmail prop to fetchPosts
      }
    });
  }, [userEmail, sortBy]);
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
      {/* <div className="col-md-3 left-box">
        <p>Quicklinks</p>
        <p>Calendar Link</p>
        <p>Tutors</p>
        <p>Other features</p>
      </div> */}

      <div className="col-md-6 center-box">
        <SearchPage />
        <div className="createPostPrompt shadow-sm border rounded-5 p-3 bg-white shadow box-area">
          <div className="prompt-info">
            <Link
              className="user-link"
              href={`/pages/profile/${encodeURIComponent(user?.email)}`}
              style={{ textDecoration: "none" }}
            >
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
            </Link>

            <p className="poster-username">
              What&apos;s on your mind{" "}
              {user.email ? user.email.split("@")[0] : ""}?{" "}
            </p>
          </div>

          <Button
            className="rounded-5"
            variant="primary"
            onClick={() => setShowCreatePostModal(true)}
          >
            Create Post
          </Button>
        </div>
        <Dropdown>
          <Dropdown.Toggle
            variant="secondary"
            id="dropdown-basic"
            className="rounded-5"
          >
            Sort By
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleSortChange("recent")}>
              Recent
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSortChange("oldest")}>
              Oldest
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSortChange("likes")}>
              Likes
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSortChange("dislikes")}>
              Dislikes
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <div className="feed">
          {posts.map((post, index) => (
            <Card key={index} className="mb-3">
              <Card.Header className="post-header">
                <Link
                  className="user-link"
                  href={`/pages/profile/${encodeURIComponent(post?.email)}`}
                  style={{ textDecoration: "none" }}
                >
                  <div className="profile-info">
                    <Image
                      src={post.userProfilePicture || defaultProfilePicture}
                      alt="Profile Picture"
                      className="profile-pic"
                      width={50}
                      height={50}
                    />
                    <div className="post-info">
                      <p className="poster-username">{post.username}</p>
                      <p className="post-creation-time">
                        {new Date(post.creationTime?.toDate()).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
                <Dropdown className="post-action-dropdown">
                  <Dropdown.Toggle className="post-options">
                    <span style={{ fontSize: "1.5em" }}>•••</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {userRole === "Admin" && (
                      <Dropdown.Item
                        onClick={() => handleDeletePost(post.id)}
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
                  <Button className="social-btn rounded-5" variant="btn">
                    <Image
                      onClick={() => handleLikePost(post.id, "like")}
                      className="social-btn-icon"
                      src={likeIcon}
                      alt="Discussion Board Icon"
                      width={20}
                      height={20}
                    />{" "}
                    Likes (
                    {(post.likedBy?.length || 0) -
                      (post.dislikedBy?.length || 0)}
                    )
                    <Image
                      onClick={() => handleLikePost(post.id, "dislike")}
                      className="social-btn-icon"
                      src={dislikeIcon}
                      alt="Discussion Board Icon"
                      width={20}
                      height={20}
                    />{" "}
                  </Button>
                  <Button
                    className="social-btn rounded-5"
                    variant="btn"
                    onClick={() => handleViewComments(post.id)}
                  >
                    <Image
                      className="social-btn-icon"
                      src={commentIcon}
                      alt="Discussion Board Icon"
                      width={20}
                      height={20}
                    />{" "}
                    Comment
                  </Button>
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
                    <Link
                      className="user-link"
                      href={`/pages/profile/${encodeURIComponent(user?.email)}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Image
                        src={imageUrl || defaultProfilePicture}
                        alt="Profile Picture"
                        className="profile-pic"
                        width={50}
                        height={50}
                      />
                    </Link>
                    <Form.Control
                      className="rounded-5"
                      type="text"
                      placeholder="Add a comment..."
                      value={comment} // State for comment input
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button
                      className="rounded-4"
                      variant="primary"
                      onClick={() => handlePostComment(post.id)}
                    >
                      Post
                    </Button>
                  </Form>
                </div>
                {/* Display comments */}
                <div className="comment-section">
                  {post.comments &&
                    post.comments.length > 0 &&
                    post.comments.slice(0, 2).map((comment, index) => (
                      <div key={index} className="">
                        <div className="comment rounded-5">
                          <Link
                            className="user-link"
                            href={`/pages/profile/${encodeURIComponent(
                              comment?.email
                            )}`}
                            style={{ textDecoration: "none" }}
                          >
                            <Image
                              src={
                                comment.userProfilePicture ||
                                defaultProfilePicture
                              }
                              alt="Profile Picture"
                              className="profile-pic"
                              width={75}
                              height={75}
                            />
                          </Link>
                          <div className="comment-info">
                            <div className="comment-header">
                              <p className="comment-user">{comment.username}</p>
                              <p className="comment-timestamp">
                                {comment.timestamp &&
                                  comment.timestamp.toDate().toLocaleString()}
                              </p>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                            <div className="comment-likes">
                              <Image
                                onClick={() =>
                                  handleLikeComment(comment.id, "like")
                                }
                                className="social-btn-icon"
                                src={likeIcon}
                                alt="Like Icon"
                                width={20}
                                height={20}
                              />
                              Likes (
                              {(comment.likes || 0) - (comment.dislikes || 0)}
                              )
                              <Image
                                onClick={() =>
                                  handleLikeComment(comment.id, "dislike")
                                }
                                className="social-btn-icon"
                                src={dislikeIcon}
                                alt="Dislike Icon"
                                width={20}
                                height={20}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {/* View all comments */}
                  {post.comments &&
                    post.comments.length > 2 &&
                    commentingPostId === post.id && (
                      <Button
                        onClick={() => setCommentingPostId(null)}
                      ></Button>
                    )}
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      </div>

      {/* <div className="col-md-3 right-box">
        <p>Contacts</p>
        <p>RecentActivity</p>
        <p>Notifications</p>
      </div> */}
      {/* Create Post Prompt modal */}
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
      {/* Post modal */}
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
                    {userRole === "Admin" && (
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
                    <Form.Control
                      className="rounded-5"
                      type="text"
                      placeholder="Add a comment..."
                      value={comment} // State for comment input
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button
                      className="rounded-"
                      variant="primary"
                      onClick={() => handlePostComment(selectedPost.id)}
                    >
                      Post
                    </Button>
                  </Form>
                </div>
                {/* Display comments */}
                <div className="comment-section">
                  <h5>Comments:</h5>
                  {selectedPost.comments &&
                    selectedPost.comments.map((comment, index) => (
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
                          <p className="poster-username">{comment.username}</p>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    ))}
                </div>
              </Card.Footer>
            </Card>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MainTimelineFeed;