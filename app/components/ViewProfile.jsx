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

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user.email) {
        setUserId(user.uid);
        if (user.email) {
          const usersCollection = collection(db, "users");
          const userQuery = query(
            usersCollection,
            where("email", "==", user.email)
          );
          const querySnapshot = await getDocs(userQuery);

          querySnapshot?.forEach((doc) => {
            const data2 = doc?.data();
            console.log("ddd", data2.profilePicture)
            if (data) {
              setData((prevData) => ({
                ...prevData,
                firstName: data2?.firstName,
                lastName: data2?.lastName,
                email: data2?.email,
                password: data2?.password,
                phone: data2?.phone,
                profilePicture: data2?.profilePicture?.url,
                bio: data2?.bio,
                major: data2?.major,
                tutor: data2?.isTutor,
                role: data2?.role,
              }));
            }
          });
          setUser(data);
        }
      }
    });
  }, []);

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
          <div className="col-md-8 right-box">
            <Card className="mb-4 text-center">
              <Card.Header>
                {data?.profilePicture ? (
                  <Image
                    className=""
                    // style={{width: "100%"}}
                    src={data.profilePicture}
                    alt="User"
                    height={290}
                    width={1000}
                    style={{ width: "100%" }}
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
                  {data?.tutor && (
                            <li className="list-group-item">
                              Tutor
                            </li>
                          )}
                  <p className="username">
                    {user.email ? user.email.split("@")[0] : ""}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="profile-btn btn"
                >
                  {" "}
                  Profile Detail
                </button>
              </Card.Header>

              {showDetails && (
                <div className="d-flex justify-content-center">
                  <Card.Body style={{maxWidth: "600px"}}>
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

              <Card.Footer  className="card-footer">
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
