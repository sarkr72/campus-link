"use client";
import styles from "/styles/viewProfile.css";
import Image from "next/image";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import reportIcon from "../resources/images/flag.svg";
import messageIcon from "../resources/images/comment.svg";
import styles2 from "/styles/mainTimeline.css";
import MainTimeline from "./MainTimeline.jsx";
import Link from "next/link";
import {
  Container,
  Row,
  Breadcrumb,
  Card,
  Modal,
  Form,
  Dropdown,
  ListGroup,
  CardBody,
  CardText,
  Col,
  Button,
} from "react-bootstrap";
import likeIcon from "../resources/images/like.svg";
import dislikeIcon from "../resources/images/dislike.svg";
import commentIcon from "../resources/images/comment.svg";
import shareIcon from "../resources/images/share.svg";
import logoImage from "../resources/images/logo.png";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { db } from "../../utils/firebase";
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

function ViewProfile() {
  const [userEmail, setUserEmail] = useState("");
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
  const [emailData, setEmailData] = useState({
    user_name: "",
    user_location: "",
    user_city: "",
    user_email: "",
    user_phone: "",
  });
  const [userId, setUserId] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        setUserId(user.uid);
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
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
          setUserEmail(userData.email);
        } else {
          console.log("User document not found.");
        }
      }
    });
  }, []);

  const handleSendEmail = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });
    } catch (error) {
      console.error("Error sending email:", error, response);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    router.push(`/pages/friendsRequests`);
  };

  const friendProfile = async (e, id) => {
    e.preventDefault();
    if (id) {
      router.push(`/pages/profile/${encodeURIComponent(id)}`);
    }
  };

  const handleFollow = async (e) => {
    e.preventDefault();
      router.push(`/pages/following}`);
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
          <div className="col-md-8 top-box">
            <Card className="mb-4 text-center">
              <Card.Header>
                {data?.profilePicture ? (
                  <Image
                    className="profile-pic"
                    src={data.profilePicture}
                    alt="User"
                    height={250}
                    width={250}
                    style={{ width: "auto" }}
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
                  <Link href="/pages/followers" className="text-dark">
                    {user?.followers?.length || 0} followers
                  </Link>
                  <Link href="/pages/following" className="text-dark" style={{marginLeft: "10px"}}>
                    {user?.following?.length || 0} Following
                  </Link>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Button
                    onClick={handleSendRequest}
                    style={{ marginRight: "1rem" }}
                  >
                    View Requests
                  </Button>
                  
                  <Button onClick={() => setShowDetails(!showDetails)}>
                    Profile Detail
                  </Button>
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
                            // objectFit="cover"
                          />
                        </div>
                      </button>
                    ))}
                </div>
                <div style={{ alignSelf: "flex-end" }}>
                  {" "}
                  <Link href="/pages/friends" className="text-black"> View All Friends</Link>
                </div>
              </Card.Footer>
            </Card>
          </div>

          <div className="bottom-box">
            <MainTimeline userEmail={userEmail} />
          </div>
        </div>
      </>
    </div>
  );
}

export default ViewProfile;
