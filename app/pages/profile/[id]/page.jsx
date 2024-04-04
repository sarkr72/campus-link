"use client";
import styles from "/styles/viewProfile.css";
import Image from "next/image";
import defaultProfilePicture from "../../../resources/images/default-profile-picture.jpeg";
import reportIcon from "../../../resources/images/flag.svg";
import messageIcon from "../../../resources/images/comment.svg";
import styles2 from "/styles/mainTimeline.css";
import { useParams, useSearchParams, usePathname } from "next/navigation";

import { Row, Breadcrumb, Card, Modal, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import React, { useState } from "react";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { db } from "../../../utils/firebase";
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
  limit,
  arrayUnion,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaCalendarAlt } from "react-icons/fa";

function ViewProfile() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState("");
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    profilePicture: "",
    bio: "",
    major: "",
    tutor: "",
    role: "",
  });
  const [userId, setUserId] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const usersRef = collection(db, "users");
  const [friends, setFriends] = useState([]);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        try {
          const auth = getAuth();
          onAuthStateChanged(auth, async (user) => {
            if (user) {
              setUserId(user.uid);
              const userRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userRef);
              const userData = userDoc?.data();
              setCurrentUser(userData);
              setFollowing(userData?.following);
              if (userData) {
                if (userDoc.exists()) {
                  const updatedFriendRequests =
                    userData?.friendRequestsSent?.map((request) => {
                      const [, requestUserId] = request.split(",");
                      return requestUserId;
                    });
                  setSentRequests(updatedFriendRequests || []);
                }
              }
            }
          });

          const userDocRef = doc(db, "users", id);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot?.data();

            setFollowers(userData?.followers);
            setData({
              firstName: userData?.firstName,
              lastName: userData?.lastName,
              email: userData?.email,
              password: userData?.password,
              phone: userData?.phone,
              profilePicture: userData?.profilePicture?.url,
              bio: userData?.bio,
              major: userData?.major,
              tutor: userData?.isTutor,
              role: userData?.role,
            });

            setUser(userData);
          } else {
            console.log("No user found with the specified ID.");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };

    fetchUser();
  }, [id]);

  const handleClose = () => {
    setOpen(false);
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleAppointment = (e) => {
    e.preventDefault();
    router.push(`/pages/schedule/${id}`);
  };

  const sendRequest = async (reciverId, name) => {
    try {
      const usersRef = doc(db, "users", reciverId);
      const usersDoc = await getDoc(usersRef);

      if (usersDoc.exists()) {
        const friendRequests = usersDoc?.data()?.friendRequests || [];
        const isRequestFound = friendRequests.some((request) => {
          const [, requestUserId] = request.split(",");
          return requestUserId === userId;
        });

        if (isRequestFound) {
          const updatedFriendRequests = friendRequests.filter((request) => {
            const [, requestUserId] = request.split(",");
            return requestUserId !== userId;
          });

          await updateDoc(usersDoc.ref, {
            friendRequests: updatedFriendRequests,
          });
          console.log("Friend request canceled successfully.");
        } else {
          const updatedFriendRequests = [
            ...friendRequests,
            `${currentUser?.firstName} ${currentUser?.lastName},${userId}`,
          ];
          await updateDoc(usersDoc.ref, {
            friendRequests: updatedFriendRequests,
          });
          console.log("Friend request sent successfully.");
        }
      } else {
        console.log("No user found with the specified ID.");
      }

      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const friendRequestsSent = userDoc?.data()?.friendRequestsSent || [];
        const isRequestFound = friendRequestsSent.some((request) => {
          const [, requestUserId] = request.split(",");
          return requestUserId === reciverId;
        });

        if (isRequestFound) {
          const updatedFriendRequests = friendRequestsSent.filter((request) => {
            const [, requestUserId] = request.split(",");
            return requestUserId !== reciverId;
          });
          await updateDoc(userDoc.ref, {
            friendRequestsSent: updatedFriendRequests,
          });
          console.log("Friend request canceled successfully.");
        } else {
          const updatedFriendRequests = [
            ...friendRequestsSent,
            `${name},${reciverId}`,
          ];
          await updateDoc(userDoc.ref, {
            friendRequestsSent: updatedFriendRequests,
          });
          // setSentRequests((prevSentRequests) => {
          //   if (prevSentRequests.includes(reciverId)) {
          //     return prevSentRequests.filter((id) => id !== reciverId);
          //   } else {
          //     return [...prevSentRequests, reciverId];
          //   }
          // });

          console.log("Friend request sent successfully.");
        }
      } else {
        console.log("User document not found.");
      }
    } catch (error) {
      console.error("Error sending/canceling friend request:", error);
    }
  };

  const handleSendRequest = async (e, receiverId, name) => {
    e.preventDefault();
    if (
      currentUser?.friends?.some((request) => {
        const requestId = request?.id;
        return requestId === receiverId;
      })
    ) {
      console.log("hereeee");
      handleClickOpen();
      setOpenModal(true);
    } else {
      await sendRequest(receiverId, name);
      if (sentRequests?.some((item) => item === receiverId)) {
        setSentRequests((prevSentRequests) =>
          prevSentRequests.filter((id) => id !== receiverId)
        );
      } else {
        setSentRequests((prevSentRequests) => [
          ...prevSentRequests,
          receiverId,
        ]);
      }
    }
  };
const friendProfile = async (e, id) => {
    e.preventDefault();
    router.push(`/pages/profile/${id}`);
  }
  const handleConfirmation = async (e) => {
    e.preventDefault();
    setOpenModal(false);
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    const updatedFriends = userDoc?.data()?.friends?.filter((friend) => {
      const friendId = friend?.id;
      return friendId !== id;
    });
    setFriends(updatedFriends);
    await updateDoc(userDoc.ref, {
      friends: updatedFriends,
    });

    const userRef2 = doc(db, "users", id);
    const userDoc2 = await getDoc(userRef2);
    const friends = userDoc2?.data()?.friends;
    const updatedFriends2 = friends?.filter((friend) => {
      const friendId = friend?.id;
      return friendId !== userId;
    });
    if (sentRequests?.some((item) => item === id)) {
      setSentRequests((prevSentRequests) =>
        prevSentRequests.filter((item) => item !== id)
      );
    }
    await updateDoc(userDoc2.ref, {
      friends: updatedFriends2,
    });
  };

  const handleFollow = async (e, id, name) => {
    e.preventDefault();
    setOpenModal(false);
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const userRef2 = doc(db, "users", id);
    const userDoc2 = await getDoc(userRef2);

    const isYourIdInFriendFollowers = following?.some(
      (follower) => follower.id === id
    );

    if (isYourIdInFriendFollowers) {
      const updatedFollowing = following?.filter((friend) => {
        const friendId = friend?.id;
        return friendId !== id;
      });

      setFollowing(updatedFollowing);
      await updateDoc(userDoc.ref, {
        following: updatedFollowing,
      });

      const updatedFollowers = followers?.filter((friend) => {
        const friendId = friend?.id;
        return friendId !== userId;
      });
      setFollowers(updatedFollowers);
      await updateDoc(userDoc2.ref, {
        followers: updatedFollowers,
      });
    } else {
      {
        console.log("here");
      }
      setFollowing((prevFollowing) => {
        if (!Array.isArray(prevFollowing)) {
          prevFollowing = []; 
        }
        return [
          ...prevFollowing,
          {
            name,
            id,
            profilePicture: user?.profilePicture?.url || null,
            timestamp: new Date(),
          },
        ];
      });
      
      setFollowers((prevFollowing) => {
        if (!Array.isArray(prevFollowing)) {
          prevFollowing = []; 
        }
        return [
          ...prevFollowing,
          {
            name: currentUser?.firstName + " " + currentUser?.lastName,
            id: userId,
            profilePicture: currentUser?.profilePicture?.url || null,
            timestamp: new Date(),
          },
        ];
      });
      await Promise.all([
        updateDoc(userDoc.ref, {
          following: arrayUnion({
            name: name,
            id: id,
            profilePicture: user?.profilePicture?.url || null,
            timestamp: new Date(),
          }),
        }),
        updateDoc(userDoc2.ref, {
          followers: arrayUnion({
            name: currentUser?.firstName + " " + currentUser?.lastName,
            id: currentUser?.id,
            profilePicture: currentUser?.profilePicture?.url || null,
            timestamp: new Date(),
          }),
        }),
      ]);
    }
  };

  return (
    <div className="profile-container container">
      <Row>
        <Breadcrumb className="bg-light rounded-3">
          <Breadcrumb.Item href="/pages/mainTimeline">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="#">User</Breadcrumb.Item>
          <Breadcrumb.Item active>View Profile</Breadcrumb.Item>
        </Breadcrumb>
      </Row>
      <>
        <div className="row justify-content-center">
          <div className="col-md-8 viewProfile-right-box">
            <Card className="mb-4 text-center">
              <Card.Header>
                {data?.profilePicture ? (
                  <Image
                    className="profile-pic"
                    src={data.profilePicture}
                    alt="User"
                    height={250}
                    width={250}
                  />
                ) : (
                  <Image
                    className="profile-pic"
                    src={defaultProfilePicture}
                    alt="User"
                    height={250}
                    width={250}
                  />
                )}
                <div className="user">
                  <strong className="name">
                    {data.firstName} {data.lastName}
                  </strong>
                  {data.role && (
                    <li className="list-group-item">{data.role}</li>
                  )}
                  {data?.tutor && <li className="list-group-item">Tutor</li>}
                  <Link href={`/pages/followers/${id}`} className="text-dark">
                    {followers?.length || 0} followers
                  </Link>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {user?.id !== userId && (
                    <>
                      <Button
                        onClick={(e) =>
                          handleSendRequest(
                            e,
                            user?.id,
                            user?.firstName + " " + user?.lastName
                          )
                        }
                        style={{ marginRight: "1rem" }}
                      >
                        {currentUser?.friends?.some((request) => {
                          const requestId = request?.id;
                          return requestId === user.id;
                        })
                          ? "Friends"
                          : sentRequests?.some((item) =>
                              item.includes(user?.id)
                            )
                          ? "Cancel"
                          : "Send Request"}
                      </Button>
                      <Button
                        onClick={(e) =>
                          handleFollow(
                            e,
                            user?.id,
                            user?.firstName + " " + user?.lastName
                          )
                        }
                        style={{ marginRight: "1rem" }}
                      >
                        {following?.some((follower) => {
                          const followerId = follower?.id;
                          return followerId === user.id;
                        })
                          ? "Following"
                          : "Follow"}
                      </Button>
                      <Button onClick={() => setShowDetails(!showDetails)}>
                        Profile Detail
                      </Button>
                      <Modal
                        show={openModal}
                        onHide={() => setOpenModal(false)}
                        centered
                      >
                        <Modal.Header closeButton>
                          <Modal.Title>Remove Friend Confirmation</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <p>
                            Are you sure you want to remove{" "}
                            <strong>
                              {user.firstName} {user.lastName}
                            </strong>{" "}
                            as a friend?
                          </p>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button
                            variant="secondary"
                            onClick={() => setOpenModal(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            onClick={(e) => handleConfirmation(e)}
                          >
                            Remove
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    </>
                  )}
                </div>
              </Card.Header>

              {showDetails && (
                <div className="d-flex justify-content-center">
                  <Card.Body style={{ maxWidth: "600px" }}>
                    <ul className="list-group">
                      {data && (
                        <>
                          {data?.phone && (
                            <li className="list-group-item">
                              Phone Number: {data.phone}
                            </li>
                          )}
                          {data?.bio && (
                            <li className="list-group-item">Bio: {data.bio}</li>
                          )}
                          {data?.major && (
                            <li className="list-group-item">
                              Major: {data.major}
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  </Card.Body>
                </div>
              )}

              <Card.Footer style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    alignSelf: "center",
                  }}
                >
                  <Button className="profile-btn" style={{marginRight: "18px"}} onClick={handleAppointment}>
                    <FaCalendarAlt className="text-black" />
                    Appointment
                  </Button>

                  <Button
                    className="profile-btn"
                    style={{ marginRight: "20px" }}
                  >
                    <Image
                      className="profile-btn-icon"
                      src={messageIcon}
                      alt="Profile Icon"
                      width={20}
                      height={20}
                    />{" "}
                    Message
                  </Button>
                  <Button className="profile-btn btn">
                    <Image
                      className="profile-btn-icon"
                      src={reportIcon}
                      alt="Profile Icon"
                      width={20}
                      height={20}
                    />{" "}
                    Report
                  </Button>
                </div>
                <div
                  style={{
                    borderTop: "1px solid #ccc",
                    fontWeight: "bold",
                    alignSelf: "flex-start",
                    width: "100%",
                  }}
                >
                  Friends
                </div>
                <div
                  style={{
                    display: "flex",
                    // flexDirection: "column",
                  }}
                >
                  {user?.friends?.length > 0 &&
                    user?.friends?.slice(0, 4).map((friend, index) => (
                      <button
                        key={index}
                        className="btn bg-white text-black shadow d-flex flex-column align-items-center position-relative"
                        style={{ width: "120px", marginRight: "10px" }}
                        onClick={(e) => friendProfile(e, friend?.id)}
                      >
                        <div
                          className="font-weight-bold text-center text-truncate"
                          style={{ maxWidth: "100%", fontSize: "11px" }}
                        >
                          {friend?.name}
                        </div>
                        <div className="d-flex justify-content-center">
                          <Image
                            src={
                              friend?.profilePicture
                                ? friend.profilePicture
                                : defaultProfilePicture
                            }
                            alt="Profile Picture"
                            height={80}
                            width={100}
                          />
                        </div>
                      </button>
                    ))}
                </div>
                <div style={{ alignSelf: "flex-end"}}>
                  {" "}
                  <Link href={`/pages/friends/${id}`} className="text-black"> View All Friends</Link>
                </div>
              </Card.Footer>
            </Card>
          </div>
          <div className="col-md-16 left-box">{/*User's posts go here*/}</div>
        </div>
      </>
    </div>
  );
}

export default ViewProfile;
