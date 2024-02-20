// Import necessary dependencies
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React, { useState } from "react";
import Image from "next/image";
import GrowSpinner from "../../components/Spinner";
import styles from "../../../styles/authentification.css";
import { fetchUserData } from "../../../utils/fetchUserData";
import currentUser from "../../../utils/checkSignIn";

const UpdateProfilePage = () => {
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
    setIsLoading(true);
    const fetchCurrentUser = async () => {
      try {
        const email = await currentUser();
        setCurrentEmail(email);

        if (email) {
          const response = await fetch(`/api/users/${email}`, {
            method: "GET",
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
              isTutor: data.isTutor,
              role: data.role,
            }));

            setUser(data);
            console.log("User data:", data);
          } else {
            console.log("Failed to fetch user data:", response.statusText);
          }
        } else {
          console.log("User is not signed in");
        }
      } catch (error) {
        console.error("Error getting current user:", error);
      } finally {
        setIsLoading(false);
        // setIsEmailSet(true);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "confirmPassword") {
      if (value !== data?.password) {
        setError("Passwords do not match");
      } else {
        setError("");
      }
    }

    if (type === "file") {
      const newProfilePicture = e.target.files[0];
      if (newProfilePicture) {
        // Read the file as a data URL or a blob object
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileData = event.target.result;
          setData((prevData) => ({
            ...prevData,
            profilePicture: fileData, // Save the file data to the state
          }));
        };
        reader.readAsDataURL(newProfilePicture); // You can also use readAsArrayBuffer() for a blob
      }
    } else {
      setData((prevData) => ({
        ...prevData,
        [name]: newValue,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const formDataObj = {
        email: data?.email,
        password: data?.password,
        firstName: data?.firstName,
        lastName: data?.lastName,
        major: data?.major,
        phone: data?.phone,
        role: data?.role,
        profilePicture: data?.profilePicture,
        bio: data?.bio,
        minor: data?.minor,
        isTutor: data?.isTutor,
      };

      const formData = new URLSearchParams();
      Object.entries(formDataObj).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(`/api/users/${currnetEmail}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        window.location.reload();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error signing up user:", error);
    }
  };

  if (isLoading) {
    return <GrowSpinner />;
  }

  return (
    <div>
      <div
        className={`auth-container ${styles.footer}`}
        style={{ minHeight: "100vh" }}
      >
        <div className={`row border rounded-5 p-3 bg-white shadow }`}>
          {/* Left */}
          <div className="col-md-6 rounded-4 left-box">
            <h3>Update your profile</h3>
            <small className="welcome-msg">
              Your learning adventure begins here!
            </small>
            <small className="welcome-msg">Please signup to get started.</small>
          </div>
          {/* Right */}
          <div className="col-md-6 right-box">
            <div className="row"></div>
            <form onSubmit={handleSubmit} className="input-group">
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  First Name:{" "}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={data.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Last Name:{" "}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={data.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Email:{" "}
                </label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter your email"
                  value={data.email}
                  onChange={handleChange}
                  disabled
                />
              </div>

              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Phone:{" "}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={data.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Profile Picture:{" "}
                </label>
                <input
                  type="file"
                  className="form-control"
                  name="profilePicture"
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Bio:{" "}
                </label>
                <textarea
                  className="form-control"
                  name="bio"
                  placeholder="Enter your bio"
                  value={data.bio}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Major:{" "}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="major"
                  placeholder="Enter your major"
                  value={data.major}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Minor:{" "}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="minor"
                  placeholder="Enter your minor"
                  value={data.minor}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Role:{" "}
                </label>
                <input
                  className="form-control"
                  type="text"
                  name="role"
                  value={data.role}
                  onChange={handleChange}
                  placeholder="Role"
                  disabled
                />
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  {" "}
                </label>
                <input
                  type="checkbox"
                  className={`form-check-input mr-${10}`}
                  style={{ marginRight: "10px" }}
                  name="isTutor"
                  checked={data.isTutor}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="isTutor">
                  Are you a tutor?
                </label>
              </div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePage;
