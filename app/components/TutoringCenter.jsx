import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import TutoringSessionCreate from "./TutoringSessionCreate";
import CalendarPage from "./CalendarPage";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../utils/firebase";

const TutoringCenter = ({ id }) => {
  const [sessionData, setSessionData] = useState(null);
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const auth = getAuth();

  const handleSaveSession = (data) => {
    setSessionData(data);
  };

  const getUserRole = async (uid) => {
    const userRef = doc(db, "users", uid);

    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role.toLowerCase());
      } else {
        console.log("User document not found.");
      }
    } catch (error) {
      console.error("Error getting user document:", error);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        getUserRole(user.uid);
      }
    });
  }, []);

  console.log("role: ", userRole);

  return (
    <Container>
          <CalendarPage onSaveSession={handleSaveSession} />
        {userRole === "admin" && (
            <h5>Want to create a session? <a href="/pages/createTutoringSession">Click here!</a></h5>
        )}
    </Container>
  );
};

export default TutoringCenter;