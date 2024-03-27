"use client";
import styles from "/styles/viewProfile.css";
import Image from "next/image";
import defaultProfilePicture from "../../../resources/images/default-profile-picture.jpeg";
import reportIcon from "../../../resources/images/flag.svg";
import messageIcon from "../../../resources/images/comment.svg";
import styles2 from "/styles/mainTimeline.css";
import { useParams, useSearchParams, usePathname } from "next/navigation";

import { Row, Breadcrumb, Card, Modal, Button } from "react-bootstrap";
import likeIcon from "../../../resources/images/like.svg";
import dislikeIcon from "../../../resources/images/dislike.svg";
import commentIcon from "../../../resources/images/comment.svg";
import shareIcon from "../../../resources/images/share.svg";
import logoImage from "../../../resources/images/logo.png";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { db } from "../../../../utils/firebase";
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
              setFriends(userData?.friends);
              if (userDoc.exists()) {
                const updatedFriendRequests = userData?.friendRequestsSent.map(
                  (request) => {
                    const [, requestUserId] = request.split(",");
                    return requestUserId;
                  }
                );
                setSentRequests(updatedFriendRequests || []);
              }
            }
          });

          const userDocRef = doc(db, "users", id);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot?.data();
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
    console.log("ffff", friends);
    if (
      friends?.some((request) => {
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

  const handleConfirmation = async (e, id) => {
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
    const userRef2 = doc(db, "users", userId);
    const userDoc2 = await getDoc(userRef2);
    const friends = userDoc2?.data()?.friends;
    const updatedFriends2 = friends?.filter((friend) => {
      const friendId = friend?.id;
      return friendId !== userId;
    });
    const receiverId = id;
    if (sentRequests?.some((item) => item === receiverId)) {
      setSentRequests((prevSentRequests) =>
        prevSentRequests.filter((id) => id !== receiverId)
      );
    }
    await updateDoc(userDoc.ref, {
      friends: updatedFriends2,
    });
   
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
                  <p className="username">
                    {user.email ? user.email.split("@")[0] : ""}
                  </p>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {user?.id !== userId && (
                    <>
                      {console.log("sent", sentRequests)}
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
                        {friends?.some((request) => {
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
                        onClick={() => setShowDetails(!showDetails)}
                        className="profile-btn btn"
                      >
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
                            onClick={(e) => handleConfirmation(e, user?.id)}
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

              <Card.Footer className="card-footer">
                <Button className="profile-btn" onClick={handleAppointment}>
                  <FaCalendarAlt className="text-black" />
                  Appointment
                </Button>
                <Button className="profile-btn">
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
