import styles from "/styles/mainTimeline.css";
import React, { useState, useEffect } from "react";
import { Button, Card, Modal, Form, Dropdown } from "react-bootstrap";
import Image from "next/image";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import likeIcon from "../resources/images/like.svg";
import dislikeIcon from "../resources/images/dislike.svg";
import commentIcon from "../resources/images/comment.svg";
import shareIcon from "../resources/images/share.svg";
import { db } from "../../utils/firebase";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaThumbsUp } from "react-icons/fa";

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

const MainTimelineFeed = () => {
  // const router = useRouter();
  const [sortBy, setSortBy] = useState("recent");
  const [showAllComments, setShowAllComments] = useState(false);
  const [viewCommentsModalShow, setViewCommentsModalShow] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  // const [selectedPostComments, setSelectedPostComments] = useState([]);
  const [comment, setComment] = useState("");
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [content, setContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [likedByUser, setLikedByUser] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [allComments, setAllComments] = useState([]);
  const handleCreatePost = async () => {
    const newPost = {
      email: user?.email,
      username: user?.email ? user.email.split("@")[0] : "",
      userProfilePicture: user?.profilePicture?.url ? user.profilePicture?.url : null,
      comment: content,
      image: postImage,
      creationTime: Timestamp.now(),
      likes: 0,
      likedBy: [],
      dislikes: 0,
      dislikedBy: [],
      comments: [],
      userId: userId,
    };

    const postsCollection = collection(db, "posts");
    const docRef = await addDoc(postsCollection, newPost);
    const newPostWithID = { ...newPost, id: docRef.id };
    await updateDoc(doc(postsCollection, docRef.id), newPostWithID);

    setPosts([{ ...newPost, id: docRef.id }, ...posts]);
    setLikes([...likes, 0]);
    setLikedByUser([...likedByUser, false]);
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

  const handleLikePost = async (e, postId) => {
    e.preventDefault();
    try {
      const postDocRef = doc(db, "posts", postId);
      const postDocSnap = await getDoc(postDocRef);
      if (postDocSnap.exists()) {
        const postData = postDocSnap.data();
        const isLiked = postData?.likedBy?.includes(userId);
        let newLikedBy = [];

        if (isLiked) {
          newLikedBy = postData?.likedBy?.filter((id) => id !== userId);
        } else {
          newLikedBy = [...postData?.likedBy, userId];
        }

        await updateDoc(postDocRef, { likedBy: newLikedBy });
        setLikedByUser(newLikedBy);
        if (likes?.length > 0) {
          setLikes((prevLikes) => {
            const exists = prevLikes.map((item) => item.id).includes(postId);
            const index = prevLikes.findIndex((item) => item.id === postId);
            if (isLiked) {
              const updatedLikedBy = prevLikes[index].likedBy.filter(
                (id) => id !== userId
              );
              return [
                ...prevLikes.slice(0, index),
                { ...prevLikes[index], likedBy: updatedLikedBy },
                ...prevLikes.slice(index + 1),
              ];
            } else {
              const updatedLikedBy = [...prevLikes[index]?.likedBy, userId];
              return [
                ...prevLikes.slice(0, index),
                { ...prevLikes[index], likedBy: updatedLikedBy },
                ...prevLikes.slice(index + 1),
              ];
            }
          });
        } else {
          setLikes([{ id: postId, likedBy: newLikedBy }]);
        }
      } else {
        console.log("Post not found");
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  // Fetch posts function
  const fetchPosts = async () => {
    try {
      const postsCollection = collection(db, "posts");
      let postsQuery;

      if (sortBy === "likes") {
        postsQuery = query(postsCollection, orderBy("likes", "desc"));
      } else if (sortBy === "oldest") {
        postsQuery = query(postsCollection, orderBy("creationTime", "asc"));
      } else {
        postsQuery = query(postsCollection, orderBy("creationTime", "desc"));
      }

      const querySnapshot = await getDocs(postsQuery);

      const fetchedPosts = [];
      const fetchedLikes = [];
      const fetchedLikedByUser = [];
      const fetchComments = [];
      const fetchedDislikes = [];
      const fetchedDislikedByUser = [];

      querySnapshot.forEach((doc) => {
        const postData = doc?.data();
        const likes = { id: doc.id, likedBy: postData?.likedBy };
        fetchedPosts.push(postData);
        fetchedLikes.push(likes);
        const comments = postData?.comments;
        fetchComments.push(comments);
        // fetchedDislikes.push(
        //   postData.dislikedBy ? postData.dislikedBy.length : 0
        // );
        // Check if the current user has liked or disliked the post
        const userLiked = postData.likedBy && postData.likedBy.includes(userId);
        // const userDisliked =
        //   postData.dislikedBy && postData.dislikedBy.includes(userId);
        fetchedLikedByUser.push(userLiked);
        // fetchedDislikedByUser.push(userDisliked);
      });

      setPosts(fetchedPosts);
      setLikes(fetchedLikes);
      setAllComments(fetchComments);
      // setDislikes(fetchedDislikes);
      setLikedByUser(fetchedLikedByUser);
      // setDislikedByUser(fetchedDislikedByUser);
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
      // const postRef = doc(db, "posts", postId);
      // const postSnapshot = await getDoc(postRef);
      // const postData = postSnapshot.data();
      if (posts) {
        const foundPost = posts?.find((post) => post.id === postId);
        setSelectedPost(foundPost);
      }

      // if (postData.comments) {
      //   setSelectedPostComments(postData.comments);
      // }
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
    // setSelectedPostComments([]);
  };

  const handleAddComment = async (postId, commentText, postUserId) => {
    try {
      const post = posts.find((post) => post.id === postId);
      if (!post) {
        console.error(`Post with ID ${postId} not found`);
        return;
      }
      const commentsArray = Array.isArray(post.comments) ? post.comments : [];
      const userCommentMap = commentsArray.find(
        (commentMap) => commentMap.userId === postUserId
      );
      if (!userCommentMap) {
        console.log("hereww")
        const newCommentMap = {
          userId: userId,
          userComments: [
            {
              text: commentText,
              timestamp: Timestamp.now(),
            },
          ],
          profilePicture: user?.profilePicture?.url
            ? user?.profilePicture?.url
            : "",
          name: user?.firstName + " " + user?.lastName,
        };
        console.log("ssdsd", newCommentMap)
        await updateDoc(doc(db, "posts", postId), {
          comments: [newCommentMap],
        });
      } else {
        const updatedUserComments = [
          ...userCommentMap.userComments,
          {
            text: commentText,
            timestamp: Timestamp.now(),
          },
        ];
        const updatedComments = commentsArray.map((commentMap) =>
          commentMap.userId === userId
            ? { ...commentMap, userComments: updatedUserComments }
            : commentMap
        );
        await updateDoc(doc(db, "posts", postId), {
          comments: updatedComments,
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Function to handle posting comments
  const handlePostComment = async (postId, postUserId) => {
    if (comment.trim() !== "") {
      await handleAddComment(postId, comment, postUserId);
      setComment("");
      fetchPosts();
    }
  };
  // Note: does not work just yet
  const handleLikeComment = async (e, postId, commentIndex, selectedPostUserId) => {
    e.preventDefault();
    const postDocRef = doc(db, "posts", postId);
    const postDocSnap = await getDoc(postDocRef);
    const postData = postDocSnap?.data();

    if (postData) {
      const commentWithUserId = postData.comments.find(
        (comment) => comment.userId === selectedPostUserId
      );
      if (commentWithUserId) {
        const userComment = commentWithUserId?.userComments[commentIndex];
        if (!userComment?.likes) {
          userComment.likes = [];
        }
        if (!userComment?.likes?.includes(userId)) {
          userComment.likes.push(userId); 
        } else {
          const userIndex = userComment.likes.indexOf(userId);
          if (userIndex !== -1) {
            userComment.likes.splice(userIndex, 1);
          }
        }
        const updatedPosts = posts?.map(post => {
          if (post.id === postId) {
            const updatedComments = post?.comments?.map(comment => {
              if (comment?.userId === selectedPostUserId) {
                if(comment?.userComments[commentIndex]?.likes){
                comment.userComments[commentIndex].likes = userComment.likes;
                }
              }
              return comment;
            });
            return {...post, comments: updatedComments};
          }
          return post;
        });
        setPosts(updatedPosts);

        await updateDoc(postDocRef, postData);
      }
    }

    // try {
    //   const commentRef = doc(db, "comments", commentId);
    //   const commentDoc = await getDoc(commentRef);
    //   if (commentDoc.exists()) {
    //     const commentData = commentDoc.data();

    //     // Check if the necessary fields exist and initialize them if they don't
    //     if (!commentData.likes) {
    //       commentData.likes = 0;
    //     }
    //     if (!commentData.dislikes) {
    //       commentData.dislikes = 0;
    //     }
    //     if (!commentData.likedBy) {
    //       commentData.likedBy = [];
    //     }
    //     if (!commentData.dislikedBy) {
    //       commentData.dislikedBy = [];
    //     }

    //     // Update like/dislike arrays and counts based on reactionType
    //     if (reactionType === "like") {
    //       if (!commentData.likedBy) {
    //         commentData.likedBy = [];
    //       }
    //       if (!commentData.likedBy.includes(userId)) {
    //         commentData.likedBy.push(userId);
    //         const dislikedIndex = commentData.dislikedBy?.indexOf(userId);
    //         if (dislikedIndex !== undefined && dislikedIndex !== -1) {
    //           commentData.dislikedBy.splice(dislikedIndex, 1); // Remove from dislikedBy if present
    //         }
    //         commentData.likes++;
    //       }
    //     } else if (reactionType === "dislike") {
    //       if (!commentData.dislikedBy) {
    //         commentData.dislikedBy = [];
    //       }
    //       if (!commentData.dislikedBy.includes(userId)) {
    //         commentData.dislikedBy.push(userId);
    //         const likedIndex = commentData.likedBy?.indexOf(userId);
    //         if (likedIndex !== undefined && likedIndex !== -1) {
    //           commentData.likedBy.splice(likedIndex, 1); // Remove from likedBy if present
    //         }
    //         commentData.dislikes++;
    //       }
    //     }

    //     // Update the comment document in Firestore
    //     await updateDoc(commentRef, {
    //       likes: commentData.likes,
    //       dislikes: commentData.dislikes,
    //       likedBy: commentData.likedBy,
    //       dislikedBy: commentData.dislikedBy,
    //     });
    //   } else {
    //     console.error("Comment document not found");
    //   }
    // } catch (error) {
    //   console.error("Error handling like/dislike for comment:", error);
    // }
  };

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        if (user.email) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          const userData = userDocSnap?.data();
          if (userData) {
            setUser(userData);
          }
        } else {
          console.log("Failed to fetch user data", response);
        }
        fetchPosts();
      }
    });
  }, []);

  return (
    <div className={`timeLine-container ${styles.mainTimeline}`}>
      <div className="col-md-3 left-box">
        <p>Quicklinks</p>
        <p>Calendar Link</p>
        <p>Tutors</p>
        <p>Other features</p>
      </div>

      <div className="col-md-6 center-box">
        <SearchPage />
        <div className="createPostPrompt shadow-sm border rounded-5 p-3 bg-white shadow box-area">
          <div className="prompt-info">
            <Link
              className="user-link"
              href={`/pages/profile/${encodeURIComponent(user?.email)}`}
              style={{ textDecoration: "none" }}
            >
              {user?.profilePicture?.url ? (
                <Image
                  src={user?.profilePicture?.url}
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
                      src={post?.userProfilePicture|| defaultProfilePicture}
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
                    {user?.role.toLowerCase() === "admin" && (
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
                  <Button
                    onClick={(e) => handleLikePost(e, post?.id)}
                    className="social-btn rounded-5"
                    variant="btn"
                  >
                    <FaThumbsUp /> Likes (
                    {likes?.some((item) => item?.id === post?.id)
                      ? likes?.find((item) => item?.id === post?.id)?.likedBy
                          ?.length
                      : 0}
                    )
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
                        src={user?.profilePicture?.url || defaultProfilePicture}
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
                      onClick={() => handlePostComment(post.id, post.userId)}
                    >
                      Post
                    </Button>
                  </Form>
                </div>
                {/* Display comments */}
                <div className="comment-section">
                  {post.comments &&
                    post.comments.length > 0 &&
                    post.comments.slice(0, 1).map((comment, index) => (
                      <div key={index} className="rounded-5">
                      {comment?.userComments?.length > 0 && (
                        <div>
                          {/* Display only the first comment from userComments array */}
                          <div
                            style={{
                              alignItems: "center",
                              backgroundColor: "white",
                              paddingLeft: "10px",
                              borderRadius: "10px",
                              marginBottom: "12px",
                            }}
                          >
                            <div className="profile-info" style={{ marginRight: "10px" }}>
                              <Image
                                src={comment?.profilePicture || defaultProfilePicture}
                                alt="Profile Picture"
                                className="profile-pic"
                                width={40}
                                height={40}
                                style={{ marginRight: "10px" }}
                              />
                              <span
                                className="poster-username"
                                style={{
                                  maxWidth: "150px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontWeight: "bold",
                                }}
                              >
                                {comment?.name}
                              </span>
                            </div>
                            <div
                              style={{
                                maxWidth: "400px",
                                borderRadius: "10px",
                                textAlign: "left",
                              }}
                            >
                              <Button
                                // onClick={(e) =>
                                //   handleLikeComment(e, post.id, comment.userId, 0) // Pass index 0 to select the first comment
                                // }
                                className="rounded-5"
                                variant="btn"
                                style={{
                                  maxHeight: "20px",
                                  padding: "0 5px",
                                  fontSize: "12px",
                                  marginBottom: "3px",
                                }}
                                disabled
                              >
                                {comment.userComments[0].likes ? comment.userComments[0].likes.length : 0} Likes
                              </Button>
                              <span style={{ marginLeft: "17px" }}>
                                {comment.userComments[0].text}
                              </span>
                              <span style={{ marginLeft: "5px", fontSize: "11px" }}>
                                {comment.userComments[0].timestamp
                                  ?.toDate()
                                  .toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
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

      <div className="col-md-3 right-box">
        <p>Contacts</p>
        <p>RecentActivity</p>
        <p>Notifications</p>
      </div>
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
                    {user?.role?.toLowerCase() === "admin" && (
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
                {/* <div className="post-footer-icons">
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
                </div> */}
                {/* Add comment section */}
                <div>
                  <Form className="comment-prompt rounded-5">
                    <Image
                      src={user?.profilePicture?.url || defaultProfilePicture}
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
                      onClick={() => handlePostComment(selectedPost.id, selectedPost.userId)}
                    >
                      Post
                    </Button>
                  </Form>
                </div>
                {/* Display comments */}
                <div className="comment-section">
                  <h5>Comments:</h5>
                  {selectedPost?.comments &&
                    selectedPost?.comments?.map((comment, index) => (
                      <div key={index} className=" rounded-5">
                        {comment.userComments.map((userComment, index) => (
                          <>
                            <div
                              key={index}
                              style={{
                                alignItems: "center",
                                backgroundColor: "white",
                                paddingLeft: "10px",
                                borderRadius: "10px",
                                marginBottom: "12px",
                              }}
                            >
                              <div
                                className="profile-info"
                                style={{ marginRight: "10px" }}
                              >
                                <Image
                                  src={
                                    comment?.profilePicture ||
                                    defaultProfilePicture
                                  }
                                  alt="Profile Picture"
                                  className="profile-pic"
                                  width={40}
                                  height={40}
                                  style={{ marginRight: "10px" }}
                                />
                                <span
                                  className="poster-username"
                                  style={{
                                    maxWidth: "150px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {comment?.name}
                                </span>
                              </div>

                              <div
                                style={{
                                  maxWidth: "400px",
                                  borderRadius: "10px",
                                  textAlign: "left",
                                }}
                              >
                                <Button
                                  onClick={(e) =>
                                    handleLikeComment(
                                      e,
                                      selectedPost?.id,
                                      index,
                                      selectedPost?.userId
                                    )
                                  }
                                  className=" rounded-5"
                                  variant="btn"
                                  style={{
                                    // maxWidth: "70px",
                                    maxHeight: "20px",
                                    padding: "0 5px",
                                    fontSize: "12px",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {selectedPost?.comments?.find(comment => comment.userId === selectedPost?.userId)?.userComments[index]?.likes?.length ?? 0} Likes
                                </Button>
                                <span style={{ marginLeft: "17px" }}>
                                  {userComment.text}
                                </span>
                                <span
                                  style={{
                                    marginLeft: "5px",
                                    fontSize: "11px",
                                  }}
                                >
                                  {userComment.timestamp
                                    ?.toDate()
                                    .toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </>
                        ))}
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
