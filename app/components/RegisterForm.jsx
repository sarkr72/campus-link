// components/UserForm.js
"use client";
import { withAuthenticator } from "@aws-amplify/ui-react";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signUp } from "aws-amplify/auth";
import "../../utils/configureAmplify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button } from "react-bootstrap";
import GrowSpinner from "./Spinner";
import styles from "/styles/authentification.css";
import img from "next/image";
import logoImage from "../resources/images/logo.png";
// import { Auth } from "aws-amplify";
import { confirmSignUp } from "aws-amplify/auth";

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    profilePicture: "",
    bio: "",
    major: "",
    minor: "",
    isTutor: false,
    role: "",
  });
  const [error, setError] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

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

  if (isLoading) {
    return <GrowSpinner />;
  }

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

      const formData = new FormData();
      Object.entries(formDataObj).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(`/api/users`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await signUp({
          username: data.email,
          password: data.password,
          attributes: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone_number: data.phone,
          },
        });
      setIsLoading(false);
      console.log("called");
      setShowConfirmationModal(true);
      }
    } catch (error) {
      console.error("Error signing up user:", error);
    }
  };

  const handleChangeConfirmationCode = (e) => {
    const { value } = e.target;
    setConfirmationCode(value);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsLoading(true);
      try {
        console.log('email', data.email)
        const { isSignUpComplete, nextStep } = await confirmSignUp({
          username: data.email,
          confirmationCode,
        });
        if (isSignUpComplete) {
          setIsLoading(false);
          // router.push("/pages/home/");
          router.push('/pages/home/[slug]', `/pages/home/${data.email}`);
        } else {
          toast.error("Wrong credential");
        }
      } catch (error) {}
  };

  return (
    <div>
      {!showConfirmationModal && (
        <div
          className={`auth-container ${styles.footer}`}
          style={{ minHeight: "100vh" }}
        >
          <div className={`row border rounded-5 p-3 bg-white shadow }`}>
            {/* Left */}
            <div className="col-md-6 rounded-4 left-box">
              {/* Logo of our site goes here */}
              <div>
                <Image
                  className="featured-image"
                  src={logoImage} // path to your logo file
                  alt="Logo"
                  width={250}
                  height={250}
                />
              </div>
              <h1>Campus Link</h1>
              <small className="welcome-msg">
                Your learning adventure begins here!
              </small>
              <small className="welcome-msg">
                Please signup to get started.
              </small>
            </div>
            {/* Right */}
            <div className="col-md-6 right-box">
              <div className="row">
                <div className="header-text">
                  <p id="welcome">Welcome to Campus Link</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="input-group">
                <div className="input-group">
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
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Enter your email"
                    value={data.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Enter your password"
                    value={data.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    placeholder="Enter your confirmPassword"
                    value={data.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
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
                  <input
                    type="file"
                    className="form-control"
                    name="profilePicture"
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <textarea
                    className="form-control"
                    name="bio"
                    placeholder="Enter your bio"
                    value={data.bio}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
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
                  <select
                    className="form-select"
                    name="role"
                    value={data.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="student">Student</option>
                    <option value="professor">Professor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="input-group">
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
      )}
      {showConfirmationModal && (
        <div  style={{ minHeight: "100vh" }}>
          <div className=" top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
            <div  className="container position-relative">
              <div className="d-flex flex-column justify-content-center align-items-center confirmation-box bg-light p-4 rounded shadow">
                <h1 className="text-center">Confirmation Page</h1>
                <p className="text-center">Are you sure you want to proceed?</p>
                <div className="mb-3">
                <label htmlFor="confirmationCode" className="form-label"> <span style={{marginLeft: "30px"}} >Confirmation Code</span>
                <input type="text" style={{width: "200px"}}className="form-control" id="confirmationCode" value={confirmationCode} onChange={handleChangeConfirmationCode} />
                </label>
              </div>
                <div className="d-flex justify-content-center">
                  <Button
                    variant="primary"
                    onClick={handleConfirm}
                    className="mx-2"
                  >
                    Confirm
                  </Button>
                  <Button variant="danger" onClick={(e) => setShowConfirmationModal(false)} className="mx-2">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
