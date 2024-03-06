import styles from "/styles/mainTimeline.css";
import React, { useState, useEffect } from "react";
import { Button, Card, Modal, Form, Dropdown } from "react-bootstrap";
import Image from "next/image";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { db } from "../../firebase";
import Link from "next/link";
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import deleteImage from "../resources/images/deleteImage.png";
import GrowSpinner from "./Spinner";

const MainTimelineFeed = () => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState(Array(posts.length).fill(0));
  const [likedByUser, setLikedByUser] = useState(
    Array(posts.length).fill(false)
  );
  const [likedPosts, setLikedPosts] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagesToSave, setImagesToSave] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [getPosts, setGetPosts] = useState([]);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState("");
  const auth = getAuth();
  const [postId, setPost] = useState("");
  const [isLikeClicked, setIsLikeClicked] = useState(false);
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // setUserId(user.uid);
        setEmail(user.email);

        if (user.email) {
          const response = await fetch(`/api/users/${user.email}`, {
            cache: "no-store",
          });
          if (response.ok) {
            const data = await response.json();
            setProfilePicture(data?.profilePicture);
            setName(data?.firstName + " " + data?.lastName);
            setUserId(data.id);
            await getUserRole(user.uid, data?.id);
          }
        }
      }
    });
  }, []);

  if (isLoading) {
    return <GrowSpinner />;
  }

  const getUserRole = async (uid, id) => {
    const userRef = doc(db, "users", uid);
    let userId2 = "";
    let postArray = [];

    const seen = new Set();
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role);

        const response = await fetch(`/api/getPost`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userData.email, role: userData.role }),
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("length2: ", data);
          let likedBy = [];
          for (let i = 0; i < data.length; i++) {
            if (id == data[i].userId) {
              // console.log("length: ", data[i]?.likedBy);
              const id = data[i].id;
              const date = data[i].createdAt;
              const content = data[i].content;
              const image = data[i].image;
              const userId = data[i].userId;
              const likesCount = data[i].likesCount;
              const commentsCount = data[i].commentsCount;
              const sharesCount = data[i].sharesCount;
              let newLikedBy = [];
              let likedByArray = [];
              likedByArray = data[i]?.likedBy?.split(", ");
              newLikedBy = likedByArray?.map((user) => {
                const [name, profilePicture] = user.split(",");
                return { id, name, profilePicture };
              });

              newLikedBy?.forEach((entry) => {
                if (!seen.has(entry.name)) {
                  likedBy.push(entry);
                  seen.add(entry.name);
                }
              });

              const existingPostIndex = postArray.findIndex(
                (post) => post.id === id
              );

              if (existingPostIndex !== -1) {
                postArray[existingPostIndex].images.push(image);
                if (data[i]?.likedBy?.length) {
                  postArray[existingPostIndex].likedBy = [
                    ...new Set([
                      ...(postArray[existingPostIndex].likedBy || []),
                    ]),
                  ];
                } else {
                  postArray[existingPostIndex].likedBy = likedBy;
                }
              } else {
                postArray = [
                  ...postArray,
                  {
                    id: id,
                    date: date,
                    content: content,
                    images: [image],
                    userId: userId,
                    likes: likesCount,
                    comments: commentsCount,
                    shares: sharesCount,
                    likedBy: data[i]?.likedBy ? newLikedBy : [],
                  },
                ];
              }
            }
          }
          console.log("postarray", postArray);
          setGetPosts(postArray);
        }

        // const likeCommentShareResponse = await fetch(`/api/getPost`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ userId: userId2 }),
        //   cache: "no-store",
        // });

        // if (likeCommentShareResponse.ok) {
        //   const data = await likeCommentShareResponse.json();
        //   const { likes, comments } = data;

        //   const updatedPosts = postArray.map((post) => {

        //     const postLikes = likes.find(
        //       (like) => like.postId === post.id && like.userId === post.userId
        //     );

        //     const postComments = comments.filter(
        //       (comment) =>
        //         comment.postId === post.id && comment.userId === post.userId
        //     );

        //     return {
        //       ...post,
        //       likes: postLikes ? postLikes.likes : 0,
        //       comments: postComments ? postComments.length : 0,
        //     };

        //   });
        //   setGetPosts(updatedPosts);
        // }
      } else {
        console.log("User document not found.");
      }
    } catch (error) {
      console.error("Error getting user document:", error);
    }
  };

  const handleCreatePost = async () => {
    setIsLoading(true);
    let newImageUrls = [];
    const storage = getStorage();
    const usersCollection = collection(db, "users");

    const userQuery = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      for (const doc of querySnapshot.docs) {
        const userData = doc.data();

        if (userData.postsPicture && Array.isArray(userData.postsPicture)) {
          updatedImages = userData.postsPicture.slice();
        }

        for (const image of imagesToSave) {
          const storageRef = ref(storage, `images/posts/${image.name}`);
          await uploadBytes(storageRef, image);
          const imageUrl = await getDownloadURL(storageRef);
          newImageUrls.push(imageUrl);
          console.log("Image uploaded");
        }
      }

      if (newImageUrls.length > 0) {
        const newPost = {
          title: postTitle,
          comment: content,
          role: userRole,
          email: email,
          imagesCount: newImageUrls.length,
          imageUrls: newImageUrls,
        };
        console.log("checking image urls:", newImageUrls);
        const response = await fetch(`/api/post`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(newPost),
        });

        if (response.ok) {
          setImagesToSave([]);
          setImageUrls([]);
          setSelectedImages([]);
          setPostTitle("");
          setContent("");
          setIsLoading(false);
          // window.location.reload();
        } else {
          setIsLoading(false);
          console.log("failed to post.");
        }
        setShowCreatePostModal(false);
        setIsLoading(false);
      } else {
        console.log("images urls empty");
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    const newProfilePictures = [];

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (event) => {
          newProfilePictures.push(event.target.result);
          // Check if all files have been processed
          if (newProfilePictures.length === files.length) {
            setImagesToSave(files); // Save the files
            setSelectedImages(newProfilePictures); // Save the base64 data
          }
        };
        reader.readAsDataURL(files[i]); // Read each file as data URL
      }
    }
  };

  const handleDeleteImage = async (imageIndex) => {
    try {
      const updatedImages = [...selectedImages];
      updatedImages.splice(imageIndex, 1);
      setSelectedImages(updatedImages);
      const updatedImages2 = [...imagesToSave];
      updatedImages2.splice(imageIndex, 1);
      setImagesToSave(updatedImages2);
    } catch (error) {
      console.error("Error deleting image:", error);
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
      const post = getPosts[index];
      const postId = post.id;
      const userId = post.userId;
      // Check if the user already liked the post
      // if (!likedByUser[index]) {
      //   // Increment likes
      //   const updatedLikes = [...likes];
      //   updatedLikes[index]++;
      //   setLikes(updatedLikes);

      //   // Update likedByUser state
      //   const updatedLikedByUser = [...likedByUser];
      //   updatedLikedByUser[index] = true;
      //   setLikedByUser(updatedLikedByUser);

      // Add the user to the list of users who liked the post in Firestore
      // const likedUsersRef = doc(db, "posts", postId);
      // await updateDoc(likedUsersRef, {
      //   likedBy: [...post.likedBy, userId],
      // });
      const response = await fetch(`/api/insertLike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: postId, userId: userId }),
        cache: "no-store",
      });
      if (response.ok) {
        console.log("like saved:", postId, userId);
      }
      // }
      // else {
      //   // Decrement likes if the user already liked the post
      //   const updatedLikes = [...likes];
      //   updatedLikes[index]--;
      //   setLikes(updatedLikes);

      //   // Update likedByUser state
      //   const updatedLikedByUser = [...likedByUser];
      //   updatedLikedByUser[index] = false;
      //   setLikedByUser(updatedLikedByUser);

      //   // Remove the user from the list of users who liked the post in Firestore
      //   // const likedUsersRef = doc(db, "posts", postId);
      //   // await updateDoc(likedUsersRef, {
      //   //   likedBy: post.likedBy.filter((id) => id !== userId),
      //   // });
      //   const response = await fetch(`/api/undoLike`, {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ postId: postId, userId: userId }),
      //     cache: "no-store",
      //   });
      //   if(response.ok){
      //     console.log("like saved:", postId, userId);
      //   }
      // }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleLikeButtonClick = () => {
    setIsLikeClicked(!isLikeClicked);
  };

  function handleDropdownChange(event) {
    const userId = event.target.value;
    if (userId) {
      router.push(`/pages/profile/`);
    }
  }

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
            style={{ color: "white", border: "white" }}
            onClick={() => setShowCreatePostModal(true)}
          >
            Create Post
          </Button>
        </div>
        {getPosts && Array.isArray(getPosts) && (
          <div className="feed">
            {getPosts.map((post, index) => (
              <Card key={index} className="mb-3">
                <Card.Header className="post-header">
                  <div>
                    {/* Profile pic */}
                    {profilePicture && (
                      <Image
                        src={profilePicture}
                        alt={`Profile Image`}
                        width={40}
                        height={40}
                        style={{ borderRadius: "50%" }}
                      />
                    )}
                    <strong> {name}</strong>
                  </div>
                  <Dropdown className="post-action-dropdown">
                    <Dropdown.Toggle
                      style={{ border: "white" }}
                      className="post-options"
                    >
                      <span style={{ fontSize: "1.5em", color: "white" }}>
                        •••
                      </span>
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
                  {/* <div className="post-title"><p>{post.title}</p></div> */}
                </Card.Header>
                <Card.Body className="post-body">
                  <Card.Text className="post-comment">{post.content}</Card.Text>
                  {post && post?.images && (
                    <div className="post-img">
                      {post.images.map((image, index) => (
                        <div key={index} className="post-img">
                          {image && (
                            <Image
                              src={image}
                              alt={`Post Image ${index}`}
                              width={200}
                              height={200}
                              priority
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
                <Card.Footer className="post-footer">
                  <Link href={`/pages/profile/${"post.userId"}`}></Link>
                  {post?.likedBy?.length > 0 && (
                    <>
                      <Dropdown onSelect={handleDropdownChange}>
                        <Dropdown.Toggle
                          variant="transparent"
                          style={{
                            border: "none",
                            background: "transparent",
                            width: "40px",
                          }}
                        >
                          {post.likes === 0 && "Like"}
                          {post.likes > 1 && `${post.likes} Likes`}
                          {post.likes === 1 && `${post.likes} Like`}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {post.likedBy.map((value, index) => (
                            <Dropdown.Item key={index}>
                              <Image
                                src={value?.profilePicture}
                                alt={value?.name}
                                width={20}
                                height={20}
                                style={{ borderRadius: "50%" }}
                              />
                              {value?.name}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </>
                  )}

                  <Button
                    variant="btn"
                    onClick={(event) => {
                      handleLikeButtonClick();
                      handleLikePost(index);
                      event.target.classList.toggle("clicked"); // Toggle the presence of the class
                    }}
                    className={post.likes > 0 ? "liked" : ""}
                  >
                    {post.likes === 0 && <span>Like</span>}
                    {post.likes > 1 && <span>Likes</span>}
                    {post.likes === 1 && <span>Like</span>}
                  </Button>
                  <Button variant="btn">Comment</Button>
                  <Button variant="btn">Share</Button>
                  {/* <Button variant="btn" onClick={() => handleDeletePost(index)}>
                    Delete
                  </Button> */}
                </Card.Footer>
              </Card>
            ))}
          </div>
        )}
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
                onChange={handleChange}
                multiple
              />

              {Array.isArray(selectedImages) &&
                selectedImages.length > 0 &&
                selectedImages.map((image, index) => (
                  <div key={index} className="relative inline-block">
                    <button
                      className="position-absolute z-10 p-2 bg-white rounded-circle"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent the form submission
                        handleDeleteImage(index);
                      }}
                    >
                      <Image
                        src={deleteImage}
                        alt="Delete"
                        width={14}
                        height={18}
                      />
                    </button>
                    <Image
                      src={image}
                      alt={`Uploaded Image ${index}`}
                      className="mb-4"
                      width={150}
                      height={150}
                    />
                  </div>
                ))}
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
