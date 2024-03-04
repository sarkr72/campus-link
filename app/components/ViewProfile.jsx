"use client";
import styles from "/styles/viewProfile.css";
import Image from "next/image";
import defaultProfilePicture from "../resources/images/default-profile-picture.jpeg";
import reportIcon from "../resources/images/flag.svg";
import messageIcon from "../resources/images/comment.svg";
import {
  Container,
  Row,
  Breadcrumb,
  Card,
  ListGroup,
  CardBody,
  CardText,
  Col,
  Button,
} from "react-bootstrap";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React, { useState } from "react";
import { db } from "../../firebase";
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
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function ViewProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState("");
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    profilePicture: "",
    bio: "",
    major: "",
    minor: "",
    tutor: "",
    role: "",
  });
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const ProfileDetail = ({ label, value }) => (
    <>
      <Row className="mb-2">
        <Col sm={3}>
          <Card.Text className={styles.detailLabel}>{label}</Card.Text>
        </Col>
        <Col sm={9}>
          <Card.Text className={`text-muted ${styles.detailValue}`}>
            {value}
          </Card.Text>
        </Col>
      </Row>
      <hr className={styles.hr} />
    </>
  );

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
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              password: data.password,
              phone: data.phone,
              profilePicture: data.profilePicture,
              bio: data.bio,
              major: data.major,
              minor: data.minor,
              tutor: data.isTutor,
              role: data.role,
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
            console.log("Failed to fetch user data update page:", response);
          }
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
        throw new Error("User document not found");
      }
    } catch (error) {
      console.error("Error retrieving user email:", error);
    }
  };

  return (
    <div className="profile-container container">
      <Row>
        <Breadcrumb className="bg-light rounded-3 p-3 mb-4">
          <Breadcrumb.Item href="/pages/mainTimeline">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="#">User</Breadcrumb.Item>
          <Breadcrumb.Item active>View Profile</Breadcrumb.Item>
        </Breadcrumb>
      </Row>

      <div className="row justify-content-center">
        <div className="col-md-8 right-box">
          <Card className="mb-4 text-center">
            <Card.Header>
              {imageUrl ? (
                <Image
                  className="profile-pic"
                  src={imageUrl}
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
                <p className="username">
                  {user.email ? user.email.split("@")[0] : ""}
                </p>
              </div>
            </Card.Header>
            <Card.Body>
              <ul className="list-group">
                {data.bio && <li className="list-group-item">{data.bio}</li>}
                {data.major && (
                  <li className="list-group-item">Major: {data.major}</li>
                )}
                {data.minor && (
                  <li className="list-group-item">Minor: {data.minor}</li>
                )}
                {data.email && (
                  <li className="list-group-item">Email: {data.email}</li>
                )}
                {data.phone && (
                  <li className="list-group-item">
                    Phone Number: {data.phone}
                  </li>
                )}
                {data.role && (
                  <li className="list-group-item">Role: {data.role}</li>
                )}
              </ul>
            </Card.Body>
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
    </div>
  );
}

export default ViewProfile;
