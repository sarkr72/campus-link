// Import necessary dependencies
"use client";

import { useEffect } from "react";
import React, { useState } from "react";
import { Container } from "react-bootstrap";
import Form from "react-bootstrap/Form";


const Schedule = () => {
    const [currnetEmail, setCurrentEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
        minor: "",
        isTutor: false,
        role: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        // setIsLoading(true);
        const fetchCurrentUser = async () => {
          try {
            const response = await fetch(`/api/users`);
            if (response.ok) {
              const data2 = await response.json();
              const extractedData = data2.map(user => ({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                phone: user.phone,
                profilePicture: user.profilePicture,
                bio: user.bio,
                major: user.major,
                minor: user.minor,
                isTutor: user.isTutor,
                role: user.role
              }));
              
              setData(extractedData[0]);
              setUser(data);
              console.log("ssss", data);
              setIsLoading(false);
              console.log("User data:", data);
            } else {
              console.log("Failed to fetch user data:", response.statusText);
            }
          } catch (error) {
            console.error("Error getting current user:", error);
          } finally {
          }
        };
    
        fetchCurrentUser();
    }, []);

    return (
      <Container>
        <Form.Control type="date" />
      </Container>
    );
  }
  
  export default Schedule;