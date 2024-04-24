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
import { RiEarthLine, RiUserLine, RiLockLine } from "react-icons/ri";
import SharePostModal from "../modals/SharePostModal";
import SharedPostModal from "../modals/ViewPostModal";
import ViewPost from "./ViewPost";

const MainTimelineFeed = ({ userEmail }) => {
  // const router = useRouter();
  const [chats, setChats] = useState([]);
  const [privacy, setPrivacy] = useState("Friends");
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
  const [sharedPost, setSharedPost] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSharedPostModal, setShowSharedPostModal] = useState(false);
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
  const [currentUser, setCurrentUser] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const usersRef = collection(db, "users");

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
      userId: userId,
      privacy: privacy,
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

  const handleLikePost = async (postId, reactionType, postUserId) => {
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
          if (userId !== postUserId) {
            const userRef = doc(db, "users", postUserId);
            const userDoc = await getDoc(userRef);
            const userdata = userDoc?.data();

            const notifications = {
              senderId: userId,
              message: " liked your post.",
              senderProfilePicture: currentUser?.profilePicture || null,
              senderName: currentUser?.firstName + " " + currentUser?.lastName,
              date: new Date(),
              postId: postId,
            };
            const currentNotifications = userdata?.notifications || [];
            const updatedNotifications = [...currentNotifications, notifications];
    
            updateDoc(userDoc.ref, {
              notifications: updatedNotifications,
            });
          }

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
  const fetchPosts = async (userEmail, id) => {
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
        // setUserId(id);
        // if ( postData.userId === userId) {
        fetchedPosts.push({ ...postData, id: doc.id });
        // }
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

  const handleAddComment = async (postId, commentText, postUserId) => {
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

      if (userId !== postUserId) {
        const userRef = doc(db, "users", postUserId);
        const userDoc = await getDoc(userRef);
const userdata = userDoc?.data();
        const notifications = {
          senderId: userId,
          message: " commented on your post.",
          senderProfilePicture: currentUser?.profilePicture || null,
          senderName: currentUser?.firstName + " " + currentUser?.lastName,
          date: new Date(),
          postId: postId,
        };
        const currentNotifications = userdata?.notifications || [];
        const updatedNotifications = [...currentNotifications, notifications];

        updateDoc(userDoc.ref, {
          notifications: updatedNotifications,
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
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setCurrentUser(docSnap.data());
        }
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
        fetchPosts(userEmail, user.uid);
      }
      const fetchChats = async () => {
        try {
          const auth = getAuth();
          onAuthStateChanged(auth, async (user) => {
            if (user) {
              const q = query(
                collection(db, "chats"),
                where("users", "array-contains", user?.email)
              );
              const snapshot = await getDocs(q);
              const chatsData = snapshot.docs.map((doc) => ({
                ...doc.data(),
              }));
              setChats(chatsData);
              const data = await getDoc(doc(db, "users", user.uid));
            }
          });
        } catch (error) {
          console.error("Error fetching chats: ", error);
        }
      };
      fetchChats();
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

  const handlePrivacyChange = async (privacy, postId) => {
    try {
      const post = posts.find((post) => post.id === postId);
      if (!post) {
        console.error(`Post with ID ${postId} not found`);
        return;
      }
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return { ...post, privacy: privacy };
        }
        return post;
      });
      setPosts(updatedPosts);

      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        privacy: privacy,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSharePost = (postId) => {
    setSharedPost(postId);
    setShowShareModal(true);
  };

  const handleSharePostToChats = (selectedChats, userMessage) => {
    setShowShareModal(false);
    selectedChats.forEach((chat) => {
      console.log(sharedPost);
      if (sharedPost) {
        addSharedPostToExistingChat(chat, sharedPost, userMessage);
      } else {
        console.error("Post not found");
      }
    });
  };

  const handleCloseSharedPostModal = () => {
    setShowSharedPostModal(true);
    setSharedPost(null);
  };

  const addSharedPostToExistingChat = async (chat, sharedPost, userMessage) => {
    try {
      const chatRef = doc(db, "chats", chat.id);
      const chatSnapshot = await getDoc(chatRef);
      const chatData = chatSnapshot.data();

      if (chatData && chatData.messages) {
        const sharedPostMessage = {
          id: `${Date.now()}-shared-post`,
          sender: currentUser.email,
          senderProfilePicture: imageUrl || defaultProfilePicture,
          content: userMessage || "Attached Post",
          sharedPostID: sharedPost,
          timestamp: Timestamp.fromDate(new Date()),
        };

        await updateDoc(chatRef, {
          messages: [...chatData.messages, sharedPostMessage],
        });

        console.log("Shared post added to existing chat.");
      } else {
        console.error("Chat data or messages not found.");
      }
    } catch (error) {
      console.error("Error adding shared post to existing chat:", error);
    }
  };

  return (
    <div className={`timeLine-container ${styles.mainTimeline}`}>
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
          {posts?.map(
            (post, index) =>
              ((post?.privacy !== "Private" &&
                currentUser?.friends?.some(
                  (friend) => friend.id === post.userId
                )) ||
                post?.privacy === "Public" ||
                post.userId === userId) && (
                <>
                  <Card key={`${post.id}-${index}`} className="mb-3">
                    <Card.Header className="post-header">
                      <Link
                        className="user-link"
                        href={`/pages/profile/${encodeURIComponent(
                          post?.userId
                        )}`}
                        style={{ textDecoration: "none" }}
                      >
                        <div className="profile-info">
                          <Image
                            src={
                              post.userProfilePicture || defaultProfilePicture
                            }
                            alt="Profile Picture"
                            className="profile-pic"
                            width={50}
                            height={50}
                          />
                          <div className="post-info">
                            <p className="poster-username">{post.username}</p>
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <p className="post-creation-time">
                                {new Date(
                                  post.creationTime?.toDate()
                                ).toLocaleString(undefined, {
                                  month: "numeric",
                                  day: "numeric",
                                  year: "numeric",
                                })}{" "}
                                {new Date(
                                  post.creationTime?.toDate()
                                ).toLocaleString(undefined, {
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                })}
                              </p>
                              {post?.privacy === "Public" && (
                                <RiEarthLine
                                  style={{
                                    marginLeft: "5px",
                                    cursor: "default",
                                  }}
                                />
                              )}
                              {post?.privacy === "Friends" && (
                                <RiUserLine
                                  style={{
                                    marginLeft: "5px",
                                    cursor: "default",
                                  }}
                                />
                              )}
                              {post?.privacy === "Private" && (
                                <RiLockLine
                                  style={{
                                    marginLeft: "5px",
                                    cursor: "default",
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                      <Dropdown className="post-action-dropdown">
                        <Dropdown.Toggle className="post-options">
                          <span style={{ fontSize: "1.5em" }}>•••</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {userRole.toLocaleLowerCase() === "admin" ||
                            (userId === post?.userId && (
                              <Dropdown.Item
                                onClick={() => handleDeletePost(post.id)}
                                className="text-danger"
                              >
                                <strong>Delete Post</strong>
                              </Dropdown.Item>
                            ))}
                          <Dropdown.Item className="text-warning">
                            <strong>Report Post</strong>
                          </Dropdown.Item>

                          {post.userId === userId.toString() && (
                            <>
                              <Dropdown.Divider />
                              <Dropdown.Item disabled>
                                <strong>Edit Privacy</strong>
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handlePrivacyChange("Public", post.id)
                                }
                              >
                                <strong>
                                  <RiEarthLine /> Public
                                </strong>
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handlePrivacyChange("Friends", post.id)
                                }
                              >
                                <strong>
                                  <RiUserLine /> Friends
                                </strong>
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handlePrivacyChange("Private", post.id)
                                }
                              >
                                <strong>
                                  <RiLockLine /> Only me
                                </strong>
                              </Dropdown.Item>
                            </>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </Card.Header>
                    <Card.Body className="post-body">
                      <Card.Text className="post-comment">
                        {post.comment}
                      </Card.Text>
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
                            onError={(e) =>
                              console.error("Image failed to load", e)
                            }
                          />
                        </div>
                      )}
                    </Card.Body>
                    <Card.Footer className="post-footer">
                      <div className="post-footer-icons">
                        <Button className="social-btn rounded-5">
                          <Image
                            onClick={() => handleLikePost(post.id, "like", post?.userId)}
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
                            onClick={() => handleLikePost(post.id, "dislike", post?.userId)}
                            className="social-btn-icon"
                            src={dislikeIcon}
                            alt="Discussion Board Icon"
                            width={20}
                            height={20}
                          />{" "}
                        </Button>
                        <Button
                          className="social-btn rounded-5"
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
                        <Button
                          className="social-btn rounded-5"
                          onClick={() => handleSharePost(post.id)}
                        >
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
                            href={`/pages/profile/${encodeURIComponent(
                              user?.email
                            )}`}
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
                            onClick={() =>
                              handlePostComment(post.id, post?.userId)
                            }
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
                                    className="profile-pic comment-avatar"
                                    width={50}
                                    height={50}
                                  />
                                </Link>
                                <div className="comment-info">
                                  <div className="comment-header">
                                    <p className="comment-user">
                                      {comment.username}
                                    </p>
                                    <p className="comment-timestamp">
                                      {comment.timestamp &&
                                        comment.timestamp
                                          .toDate()
                                          .toLocaleString()}
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
                                    {(comment.likes || 0) -
                                      (comment.dislikes || 0)}
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
                </>
              )
          )}
        </div>
      </div>
      <Modal
        show={showCreatePostModal}
        onHide={() => setShowCreatePostModal(false)}
        className="createPostTemplate"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {/* <div style={{ display: "flex", alignItems: "center" }}> */}
            <p style={{ margin: 0 }}>Create Post</p>
            <Dropdown style={{ marginLeft: "10px" }}>
              <Dropdown.Toggle
                variant="light"
                id="dropdown-basic"
                style={{
                  maxHeight: "25px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0px",
                  backgroundColor: "transparent",
                  color: "black",
                }}
              >
                <strong>Privacy:</strong>&nbsp;
                {privacy === "Friends" && (
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <RiUserLine /> {privacy}
                  </span>
                )}
                {privacy === "Public" && (
                  <>
                    <RiEarthLine style={{ marginRight: "5px" }} /> {privacy}
                  </>
                )}
                {privacy === "Private" && (
                  <>
                    <RiLockLine style={{ marginRight: "5px" }} /> Only me
                  </>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ padding: "0px" }}>
                <Dropdown.Item
                  style={{ padding: "0px" }}
                  onClick={() => setPrivacy("Public")}
                >
                  <RiEarthLine /> Public
                </Dropdown.Item>
                <Dropdown.Item
                  style={{ padding: "0px" }}
                  onClick={() => setPrivacy("Friends")}
                >
                  <RiUserLine /> Friends
                </Dropdown.Item>
                <Dropdown.Item
                  style={{ padding: "0px" }}
                  onClick={() => setPrivacy("Private")}
                >
                  <RiLockLine /> Only me
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {/* </div> */}
          </Modal.Title>
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
          <Button id="createPost-btn" onClick={handleCreatePost}>
            Post
          </Button>
        </Modal.Footer>
      </Modal>
      {/* View Comments modal */}
      {viewCommentsModalShow && showAllComments && (
        <ViewPost
          viewCommentsModalShow={viewCommentsModalShow}
          handleCloseViewCommentsModal={handleCloseViewCommentsModal}
          selectedPost={selectedPost}
          userRole={userRole}
          imageUrl={imageUrl}
          setComment={setComment}
          handlePostComment={handlePostComment}
          comment={comment}
          handleLikePost={handleLikePost}
        />
      )}

      <SharePostModal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        onSharePost={handleSharePostToChats}
        chats={chats}
        currentUser={currentUser}
      />
      <SharedPostModal
        show={showSharedPostModal}
        onHide={handleCloseSharedPostModal}
        userEmail={userEmail}
        posts={posts}
        handleLikePost={handleLikePost}
        handleAddComment={handleAddComment}
        handlePostComment={handlePostComment}
        comment={comment}
        setComment={setComment}
        userId={userId}
        imageUrl={imageUrl}
      />
    </div>
  );
};

export default MainTimelineFeed;
