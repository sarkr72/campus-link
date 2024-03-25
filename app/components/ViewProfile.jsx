"use client";
import styles from "/styles/viewProfile.css";
import Image from "next/image";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import reportIcon from "../resources/images/flag.svg";
import messageIcon from "../resources/images/comment.svg";
import styles2 from "/styles/mainTimeline.css";
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
        const userRef = doc(db, "users", user.uid); // Assuming userId is the document ID
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
        } else {
          console.log("User document not found.");
        }
      }
    });
  }, [userId]);

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
    window.location.href =`/pages/friendsRequests/${userId}`;
  };

  const handleFollowers = async (e) => {
    e.preventDefault();
    window.location.href = `/pages/followers/${userId}`;
  };

  return (
    <div className="profile-container container">
      <button onClick={handleSendEmail}> send email testing</button>
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
                    // style={{width: "100%"}}
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
                  <p className="username">
                    {user.email ? user.email.split("@")[0] : ""}
                  </p>
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
                      
                      <Button
                      onClick={handleFollowers}
                        style={{ marginRight: "1rem" }}
                      >
                        Followers
                      </Button>
                      <Button
                        onClick={() => setShowDetails(!showDetails)}
                        className="profile-btn btn"
                      >
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

              <Card.Footer className="card-footer">
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
